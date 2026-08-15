const express = require('express');
const db = require('../lib/db');
const { supabase } = require('../lib/supabaseClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/leads', async (req, res) => {
  const { name, email, phone, message, courseInterest } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please provide a valid email address' });
  const lead = await db.insert('leads', { name, email, phone, message, courseInterest, status: 'NEW' });
  res.status(201).json(lead);
});

router.post('/', requireAuth, requireRole('STUDENT'), async (req, res) => {
  const { batchId } = req.body;
  if (!batchId) return res.status(400).json({ error: 'batchId is required' });

  const student = await db.find('students', { userId: req.user.id });
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const batch = await db.find('batches', { id: batchId });
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const course = await db.find('courses', { id: batch.courseId });
  if (!course || course.isPublished === false) {
    return res.status(404).json({ error: 'This course is not currently open for enrollment' });
  }

  // Duplicate-application and capacity checks, plus the insert itself, all
  // happen inside a single Postgres function (apply_to_batch, defined in
  // supabase_schema.sql) that locks the batch row for the duration of the
  // check. That's what actually prevents two near-simultaneous requests
  // from both slipping through — doing the check and the insert as two
  // separate round trips from here, even carefully, leaves a window where
  // both requests can read "seats available" before either has inserted.
  const { data: enrollment, error: rpcError } = await supabase.rpc('apply_to_batch', {
    p_id: db.id(),
    p_student_id: student.id,
    p_batch_id: batchId,
  });

  if (rpcError) {
    if (rpcError.message?.includes('DUPLICATE_APPLICATION')) {
      return res.status(409).json({ error: 'You have already applied to this batch.' });
    }
    if (rpcError.message?.includes('BATCH_FULL')) {
      return res.status(409).json({ error: 'This batch is full. Please choose another batch or contact us.' });
    }
    throw new Error(`[supabase] apply_to_batch: ${rpcError.message}`);
  }

  const enrollmentCamel = {
    id: enrollment.id,
    studentId: enrollment.student_id,
    batchId: enrollment.batch_id,
    status: enrollment.status,
    enrolledAt: enrollment.enrolled_at,
    createdAt: enrollment.created_at,
  };

  const payment = await db.insert('payments', {
    enrollmentId: enrollmentCamel.id,
    amount: course.fee,
    status: 'PENDING',
    method: 'manual',
  });

  res.status(201).json({ ...enrollmentCamel, payments: [payment], batch: { ...batch, course } });
});

module.exports = router;
