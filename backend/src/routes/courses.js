const express = require('express');
const db = require('../lib/db');

const router = express.Router();

async function enrichCourse(course) {
  const category = course.categoryId ? await db.find('categories', (c) => c.id === course.categoryId) : null;
  const batches = await db.filter('batches', (b) => b.courseId === course.id);
  return { ...course, category, batches };
}

router.get('/', async (req, res) => {
  const { category, level } = req.query;
  let courses = await db.filter('courses', (c) => c.isPublished !== false);
  if (level) courses = courses.filter((c) => c.level === level);
  if (category) {
    const cat = await db.find('categories', (c) => c.name === category);
    courses = courses.filter((c) => c.categoryId === (cat && cat.id));
  }
  const enriched = await Promise.all(courses.map(enrichCourse));
  res.json(enriched);
});

router.get('/:slug', async (req, res) => {
  const course = await db.find('courses', (c) => c.slug === req.params.slug);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const enriched = await enrichCourse(course);
  enriched.batches = await Promise.all(enriched.batches.map(async (b) => {
    const instructor = b.instructorId ? await db.find('instructors', (i) => i.id === b.instructorId) : null;
    const instructorUser = instructor ? await db.find('users', (u) => u.id === instructor.userId) : null;
    return { ...b, instructor: instructor ? { ...instructor, user: instructorUser } : null };
  }));
  res.json(enriched);
});

router.get('/certificates/verify/:code', async (req, res) => {
  const cert = await db.find('certificates', (c) => c.verificationCode === req.params.code);
  if (!cert) return res.status(404).json({ error: 'Certificate not found' });
  const enrollment = await db.find('enrollments', (e) => e.id === cert.enrollmentId);
  const student = await db.find('students', (s) => s.id === enrollment.studentId);
  const studentUser = await db.find('users', (u) => u.id === student.userId);
  const batch = await db.find('batches', (b) => b.id === enrollment.batchId);
  const course = await db.find('courses', (c) => c.id === batch.courseId);
  res.json({ valid: true, studentName: studentUser.name, course: course.title, issuedAt: cert.issuedAt });
});

module.exports = router;
