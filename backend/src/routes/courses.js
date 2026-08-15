const express = require('express');
const db = require('../lib/db');

const router = express.Router();

async function enrichCourse(course) {
  const category = course.categoryId ? await db.find('categories', { id: course.categoryId }) : null;
  const batches = await db.filter('batches', { courseId: course.id });
  return { ...course, category, batches };
}

router.get('/', async (req, res) => {
  const { category, level } = req.query;
  let courses = await db.filter('courses', (c) => c.isPublished !== false);
  if (level) courses = courses.filter((c) => c.level === level);
  if (category) {
    const cat = await db.find('categories', { name: category });
    courses = courses.filter((c) => c.categoryId === (cat && cat.id));
  }
  const enriched = await Promise.all(courses.map(enrichCourse));
  res.json(enriched);
});

router.get('/:slug', async (req, res) => {
  const course = await db.find('courses', { slug: req.params.slug });
  // Unpublished/draft courses are intentionally hidden from the catalog list
  // (isPublished !== false filter above) — but without this check, anyone
  // who guessed or was sent a draft course's slug could view its full
  // details anyway, since this endpoint has no auth. Treat it the same as
  // "not found" so drafts stay actually private until published.
  if (!course || course.isPublished === false) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const enriched = await enrichCourse(course);
  enriched.batches = await Promise.all(enriched.batches.map(async (b) => {
    const instructor = b.instructorId ? await db.find('instructors', { id: b.instructorId }) : null;
    const instructorUser = instructor ? await db.find('users', { id: instructor.userId }) : null;
    return { ...b, instructor: instructor ? { ...instructor, user: instructorUser } : null };
  }));
  res.json(enriched);
});

router.get('/certificates/verify/:code', async (req, res) => {
  const cert = await db.find('certificates', { verificationCode: req.params.code });
  if (!cert) return res.status(404).json({ error: 'Certificate not found' });
  const enrollment = await db.find('enrollments', { id: cert.enrollmentId });
  const student = await db.find('students', { id: enrollment.studentId });
  const studentUser = await db.find('users', { id: student.userId });
  const batch = await db.find('batches', { id: enrollment.batchId });
  const course = await db.find('courses', { id: batch.courseId });
  res.json({ valid: true, studentName: studentUser.name, course: course.title, issuedAt: cert.issuedAt });
});

module.exports = router;
