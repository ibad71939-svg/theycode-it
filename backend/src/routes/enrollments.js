const express = require('express');
const db = require('../lib/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/leads', async (req, res) => {
  const { name, email, phone, message, courseInterest } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const lead = await db.insert('leads', { name, email, phone, message, courseInterest, status: 'NEW' });
  res.status(201).json(lead);
});

router.post('/', requireAuth, requireRole('STUDENT'), async (req, res) => {
  const { batchId } = req.body;
  if (!batchId) return res.status(400).json({ error: 'batchId is required' });

  const student = await db.find('students', (s) => s.userId === req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const batch = await db.find('batches', (b) => b.id === batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  const course = await db.find('courses', (c) => c.id === batch.courseId);

  const enrollment = await db.insert('enrollments', {
    studentId: student.id,
    batchId,
    status: 'PENDING',
    enrolledAt: new Date().toISOString(),
  });
  const payment = await db.insert('payments', {
    enrollmentId: enrollment.id,
    amount: course.fee,
    status: 'PENDING',
    method: 'manual',
  });

  res.status(201).json({ ...enrollment, payments: [payment], batch: { ...batch, course } });
});

module.exports = router;
