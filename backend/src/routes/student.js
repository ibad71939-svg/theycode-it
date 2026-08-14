const express = require('express');
const db = require('../lib/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('STUDENT'));

async function getStudent(userId) {
  return db.find('students', (s) => s.userId === userId);
}

async function enrichEnrollment(e) {
  const batch = await db.find('batches', (b) => b.id === e.batchId);
  const course = batch ? await db.find('courses', (c) => c.id === batch.courseId) : null;
  const instructor = batch && batch.instructorId ? await db.find('instructors', (i) => i.id === batch.instructorId) : null;
  const instructorUser = instructor ? await db.find('users', (u) => u.id === instructor.userId) : null;
  const payments = await db.filter('payments', (p) => p.enrollmentId === e.id);
  const attendance = await db.filter('attendance', (a) => a.enrollmentId === e.id);
  const grades = await db.filter('grades', (g) => g.enrollmentId === e.id);
  const certificate = (await db.find('certificates', (c) => c.enrollmentId === e.id)) || null;
  return {
    ...e,
    batch: batch ? { ...batch, course, instructor: instructor ? { ...instructor, user: instructorUser } : null } : null,
    payments, attendance, grades, certificate,
  };
}

router.get('/dashboard', async (req, res) => {
  const student = await getStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const enrollmentsRaw = await db.filter('enrollments', (e) => e.studentId === student.id);
  const enrollments = await Promise.all(enrollmentsRaw.map(enrichEnrollment));
  const totalCourses = enrollments.length;
  const activeCourses = enrollments.filter((e) => e.status === 'ACTIVE' || e.status === 'APPROVED').length;
  const pendingFees = enrollments
    .flatMap((e) => e.payments)
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  res.json({ totalCourses, activeCourses, pendingFees, enrollments });
});

router.get('/enrollments', async (req, res) => {
  const student = await getStudent(req.user.id);
  const enrollmentsRaw = await db.filter('enrollments', (e) => e.studentId === student.id);
  const enrollments = await Promise.all(enrollmentsRaw.map(enrichEnrollment));
  res.json(enrollments);
});

router.get('/assignments', async (req, res) => {
  const student = await getStudent(req.user.id);
  const batchIds = (await db.filter('enrollments', (e) => e.studentId === student.id)).map((e) => e.batchId);
  const assignments = await db.filter('assignments', (a) => batchIds.includes(a.batchId));
  const enriched = await Promise.all(assignments.map(async (a) => ({
    ...a,
    submissions: await db.filter('submissions', (s) => s.assignmentId === a.id && s.studentId === student.id),
  })));
  res.json(enriched);
});

router.post('/assignments/:id/submit', async (req, res) => {
  const student = await getStudent(req.user.id);
  const { fileUrl } = req.body;
  const submission = await db.insert('submissions', {
    assignmentId: req.params.id,
    studentId: student.id,
    fileUrl,
    submittedAt: new Date().toISOString(),
  });
  res.status(201).json(submission);
});

module.exports = router;
