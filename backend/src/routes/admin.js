const express = require('express');
const crypto = require('crypto');
const db = require('../lib/db');
const { supabase } = require('../lib/supabaseClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('REGISTRAR', 'SUPER_ADMIN'));

router.get('/dashboard', async (req, res) => {
  const students = await db.all('students');
  const batches = await db.filter('batches', (b) => b.status === 'active');
  const enrollments = await db.filter('enrollments', (e) => e.status === 'PENDING');
  const payments = await db.filter('payments', (p) => p.status === 'PAID');
  const totalStudents = students.length;
  const activeBatches = batches.length;
  const pendingApprovals = enrollments.length;
  const revenue = payments.reduce((s, p) => s + p.amount, 0);
  res.json({ totalStudents, activeBatches, pendingApprovals, revenue });
});

// Courses
router.get('/courses', async (req, res) => {
  const courses = await db.all('courses');
  const enriched = await Promise.all(courses.map(async (c) => ({
    ...c,
    category: c.categoryId ? await db.find('categories', (cat) => cat.id === c.categoryId) : null,
    batches: await db.filter('batches', (b) => b.courseId === c.id),
  })));
  res.json(enriched);
});
router.post('/courses', async (req, res) => {
  const slug = (req.body.slug || req.body.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const created = await db.insert('courses', { ...req.body, slug, isPublished: req.body.isPublished !== false });
  res.status(201).json(created);
});
router.put('/courses/:id', async (req, res) => res.json(await db.update('courses', req.params.id, req.body)));
router.delete('/courses/:id', async (req, res) => { await db.remove('courses', req.params.id); res.status(204).send(); });

// Batches
router.post('/batches', async (req, res) => res.status(201).json(await db.insert('batches', { ...req.body, status: req.body.status || 'upcoming' })));
router.put('/batches/:id', async (req, res) => res.json(await db.update('batches', req.params.id, req.body)));

// Enrollment approvals
router.get('/enrollments', async (req, res) => {
  const { status, batchId } = req.query;
  let enrollments = await db.all('enrollments');
  if (status) enrollments = enrollments.filter((e) => e.status === status);
  if (batchId) enrollments = enrollments.filter((e) => e.batchId === batchId);
  const enriched = await Promise.all(enrollments.map(async (e) => {
    const student = await db.find('students', (s) => s.id === e.studentId);
    const studentUser = student ? await db.find('users', (u) => u.id === student.userId) : null;
    const batch = await db.find('batches', (b) => b.id === e.batchId);
    const course = batch ? await db.find('courses', (c) => c.id === batch.courseId) : null;
    const payments = await db.filter('payments', (p) => p.enrollmentId === e.id);
    return { ...e, student: student ? { ...student, user: studentUser } : null, batch: batch ? { ...batch, course } : null, payments };
  }));
  res.json(enriched.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)));
});
router.put('/enrollments/:id/status', async (req, res) => res.json(await db.update('enrollments', req.params.id, { status: req.body.status })));

// Students
router.get('/students', async (req, res) => {
  const students = await db.all('students');
  const enriched = await Promise.all(students.map(async (s) => {
    const enrollmentsRaw = await db.filter('enrollments', (e) => e.studentId === s.id);
    const enrollments = await Promise.all(enrollmentsRaw.map(async (e) => {
      const batch = await db.find('batches', (b) => b.id === e.batchId);
      const course = batch ? await db.find('courses', (c) => c.id === batch.courseId) : null;
      return { ...e, batch: batch ? { ...batch, course } : null };
    }));
    return { ...s, user: await db.find('users', (u) => u.id === s.userId), enrollments };
  }));
  res.json(enriched);
});

// Instructors
router.get('/instructors', async (req, res) => {
  const instructors = await db.all('instructors');
  const enriched = await Promise.all(instructors.map(async (i) => ({
    ...i,
    user: await db.find('users', (u) => u.id === i.userId),
    batches: await db.filter('batches', (b) => b.instructorId === i.id),
  })));
  res.json(enriched);
});

// Creates a full instructor account: Supabase Auth identity + users row +
// instructors row, in one step. Returns a one-time temp password the admin
// must share with the instructor (they should change it on first login).
router.post('/instructors', async (req, res) => {
  const { name, email, phone, bio, specialization } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  if (!supabase) return res.status(500).json({ error: 'Supabase is not configured on the server' });

  const existing = await db.find('users', (u) => u.email === email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const tempPassword = crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + '1!';

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name, phone, role: 'INSTRUCTOR' },
  });
  if (createErr) return res.status(400).json({ error: createErr.message || 'Could not create instructor account' });

  const authUser = created.user;
  try {
    const user = await db.insert('users', { id: authUser.id, name, email, phone: phone || null, role: 'INSTRUCTOR', status: 'active' });
    const instructor = await db.insert('instructors', {
      userId: user.id,
      bio: bio || null,
      specialization: specialization || null,
    });
    res.status(201).json({ ...instructor, user, tempPassword });
  } catch (e) {
    await supabase.auth.admin.deleteUser(authUser.id).catch(() => {});
    console.error('Instructor creation failed:', e.message);
    res.status(500).json({ error: 'Could not create instructor account' });
  }
});

// Flat list of batches with course + instructor labels, for admin dropdowns
// (assignment creation, attendance marking, etc.)
router.get('/batches', async (req, res) => {
  const batches = await db.all('batches');
  const enriched = await Promise.all(batches.map(async (b) => ({
    ...b,
    course: await db.find('courses', (c) => c.id === b.courseId),
    instructor: b.instructorId ? await db.find('instructors', (i) => i.id === b.instructorId) : null,
  })));
  res.json(enriched);
});

// Payments / finance
router.get('/payments', async (req, res) => {
  const payments = await db.all('payments');
  const enriched = await Promise.all(payments.map(async (p) => {
    const enrollment = await db.find('enrollments', (e) => e.id === p.enrollmentId);
    const student = enrollment ? await db.find('students', (s) => s.id === enrollment.studentId) : null;
    const studentUser = student ? await db.find('users', (u) => u.id === student.userId) : null;
    const batch = enrollment ? await db.find('batches', (b) => b.id === enrollment.batchId) : null;
    const course = batch ? await db.find('courses', (c) => c.id === batch.courseId) : null;
    return { ...p, enrollment: enrollment ? { ...enrollment, student: { ...student, user: studentUser }, batch: { ...batch, course } } : null };
  }));
  res.json(enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});
router.put('/payments/:id', async (req, res) => {
  const { status, method, transactionRef } = req.body;
  const patch = { status, method, transactionRef, paidAt: status === 'PAID' ? new Date().toISOString() : null };
  res.json(await db.update('payments', req.params.id, patch));
});

// Attendance
router.post('/attendance', async (req, res) => res.status(201).json(await db.insert('attendance', req.body)));

// Assignments & grading
router.post('/assignments', async (req, res) => res.status(201).json(await db.insert('assignments', req.body)));
router.get('/assignments', async (req, res) => res.json(await db.all('assignments')));
router.put('/submissions/:id/grade', async (req, res) => {
  const { marksObtained, feedback } = req.body;
  res.json(await db.update('submissions', req.params.id, { marksObtained, feedback }));
});

// Grades
router.post('/grades', async (req, res) => res.status(201).json(await db.insert('grades', req.body)));

// Certificates
router.get('/certificates', async (req, res) => {
  const certs = await db.all('certificates');
  const enriched = await Promise.all(certs.map(async (cert) => {
    const enrollment = await db.find('enrollments', (e) => e.id === cert.enrollmentId);
    const student = enrollment ? await db.find('students', (s) => s.id === enrollment.studentId) : null;
    const studentUser = student ? await db.find('users', (u) => u.id === student.userId) : null;
    const batch = enrollment ? await db.find('batches', (b) => b.id === enrollment.batchId) : null;
    const course = batch ? await db.find('courses', (c) => c.id === batch.courseId) : null;
    return { ...cert, studentName: studentUser?.name, courseTitle: course?.title };
  }));
  res.json(enriched.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)));
});
router.post('/certificates', async (req, res) => {
  const verificationCode = 'TCI-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  res.status(201).json(await db.insert('certificates', { ...req.body, verificationCode, issuedAt: new Date().toISOString() }));
});

// Announcements
router.post('/announcements', async (req, res) => res.status(201).json(await db.insert('announcements', req.body)));
router.get('/announcements', async (req, res) => res.json((await db.all('announcements')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));

// Leads / CRM
router.get('/leads', async (req, res) => res.json((await db.all('leads')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));
router.put('/leads/:id', async (req, res) => res.json(await db.update('leads', req.params.id, { status: req.body.status })));

module.exports = router;
