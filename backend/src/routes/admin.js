const express = require('express');
const db = require('../lib/db');
const { getSignedReceiptUrl } = require('../lib/storage');
const { requireAuth, requireRole } = require('../middleware/auth');
const { logAction } = require('../lib/audit');
const mailer = require('../lib/email');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
router.use(requireAuth, requireRole('REGISTRAR', 'SUPER_ADMIN'));

// Simple in-memory pagination applied after filtering/sorting. Table sizes
// here are expected to stay in the thousands, not millions, so paginating
// the already-fetched array is a reasonable trade-off against rewriting the
// db layer for real DB-side range queries (see ARCHITECTURE.md for the
// upgrade path if a table ever grows large enough to need it).
function paginate(items, req, defaultLimit = 20) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || defaultLimit));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return { data: items.slice(start, start + limit), page, limit, total, totalPages };
}

router.get('/dashboard', async (req, res) => {
  const students = await db.all('students');
  const batches = await db.filter('batches', { status: 'active' });
  const enrollments = await db.filter('enrollments', { status: 'PENDING' });
  const payments = await db.filter('payments', { status: 'PAID' });
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
    category: c.categoryId ? await db.find('categories', { id: c.categoryId }) : null,
    batches: await db.filter('batches', { courseId: c.id }),
  })));
  res.json(enriched);
});
router.post('/courses', async (req, res) => {
  const { title, description, durationWeeks, fee, level } = req.body;
  if (!title || !description || !level) {
    return res.status(400).json({ error: 'title, description, and level are required' });
  }
  if (!durationWeeks || durationWeeks <= 0) {
    return res.status(400).json({ error: 'durationWeeks must be a positive number' });
  }
  if (fee == null || fee < 0) {
    return res.status(400).json({ error: 'fee must be a non-negative number' });
  }
  const slug = (req.body.slug || title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!slug) return res.status(400).json({ error: 'Could not derive a valid slug from the title' });
  const existingSlug = await db.find('courses', { slug: slug });
  if (existingSlug) return res.status(409).json({ error: 'A course with this title/slug already exists' });

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
    const student = await db.find('students', { id: e.studentId });
    const studentUser = student ? await db.find('users', { id: student.userId }) : null;
    const batch = await db.find('batches', { id: e.batchId });
    const course = batch ? await db.find('courses', { id: batch.courseId }) : null;
    const payments = await db.filter('payments', { enrollmentId: e.id });
    return { ...e, student: student ? { ...student, user: studentUser } : null, batch: batch ? { ...batch, course } : null, payments };
  }));
  const sorted = enriched.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
  res.json(paginate(sorted, req));
});
const ENROLLMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED'];
router.put('/enrollments/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!ENROLLMENT_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${ENROLLMENT_STATUSES.join(', ')}` });
  }
  const before = await db.find('enrollments', { id: req.params.id });
  const updated = await db.update('enrollments', req.params.id, { status });
  await logAction({
    actor: req.user,
    action: 'enrollment.status_changed',
    entityType: 'enrollment',
    entityId: req.params.id,
    details: { from: before?.status, to: status },
  });

  // Notify the student on approval — best-effort, never blocks the response.
  if (status === 'APPROVED' && before?.status !== 'APPROVED') {
    (async () => {
      try {
        const student = await db.find('students', { id: updated.studentId });
        const studentUser = student ? await db.find('users', { id: student.userId }) : null;
        const batch = await db.find('batches', { id: updated.batchId });
        const course = batch ? await db.find('courses', { id: batch.courseId }) : null;
        if (studentUser?.email) {
          await mailer.sendEnrollmentApproved({ to: studentUser.email, studentName: studentUser.name, courseTitle: course?.title || 'your course' });
        }
      } catch (e) {
        console.error('enrollment approval email failed:', e.message);
      }
    })();
  }

  res.json(updated);
});

// Students
router.get('/students', async (req, res) => {
  const students = await db.all('students');
  const enriched = await Promise.all(students.map(async (s) => {
    const enrollmentsRaw = await db.filter('enrollments', { studentId: s.id });
    const enrollments = await Promise.all(enrollmentsRaw.map(async (e) => {
      const batch = await db.find('batches', { id: e.batchId });
      const course = batch ? await db.find('courses', { id: batch.courseId }) : null;
      return { ...e, batch: batch ? { ...batch, course } : null };
    }));
    return { ...s, user: await db.find('users', { id: s.userId }), enrollments };
  }));
  res.json(paginate(enriched, req));
});

// Instructors
router.get('/instructors', async (req, res) => {
  const instructors = await db.all('instructors');
  const enriched = await Promise.all(instructors.map(async (i) => ({
    ...i,
    user: await db.find('users', { id: i.userId }),
    batches: await db.filter('batches', { instructorId: i.id }),
  })));
  res.json(enriched);
});

// Creates an instructor PROFILE ONLY — no Supabase Auth login. There is no
// instructor portal in the frontend yet (see ARCHITECTURE.md), so creating
// a real login here would hand out working credentials to a dashboard that
// doesn't exist. The `users` + `instructors` rows are still created because
// `instructors.userId` is what course/batch pages join against to show the
// instructor's name to students — that display path doesn't need a login,
// just the profile data. Once the instructor portal is built, swap this
// back to also calling supabase.auth.admin.createUser(...) and emailing a
// temp password, same as it worked before this change.
router.post('/instructors', async (req, res) => {
  const { name, email, phone, bio, specialization } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please provide a valid email address' });

  const existing = await db.find('users', { email: email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  try {
    const user = await db.insert('users', { id: db.id(), name, email, phone: phone || null, role: 'INSTRUCTOR', status: 'active' });
    const instructor = await db.insert('instructors', {
      userId: user.id,
      bio: bio || null,
      specialization: specialization || null,
    });
    await logAction({
      actor: req.user,
      action: 'instructor.created',
      entityType: 'instructor',
      entityId: instructor.id,
      details: { email, portalLogin: false },
    });
    res.status(201).json({
      ...instructor,
      user,
      note: 'Profile created for display/assignment purposes only — there is no instructor portal yet, so no login was created for this person.',
    });
  } catch (e) {
    console.error('Instructor creation failed:', e.message);
    res.status(500).json({ error: 'Could not create instructor profile' });
  }
});

// Flat list of batches with course + instructor labels, for admin dropdowns
// (assignment creation, attendance marking, etc.)
router.get('/batches', async (req, res) => {
  const batches = await db.all('batches');
  const enriched = await Promise.all(batches.map(async (b) => ({
    ...b,
    course: await db.find('courses', { id: b.courseId }),
    instructor: b.instructorId ? await db.find('instructors', { id: b.instructorId }) : null,
  })));
  res.json(enriched);
});

// Payments / finance
// Summary is computed over the FULL table, independent of pagination below
// — the payments list is paginated for display, but revenue/pending totals
// must reflect every record, not just the current page.
router.get('/payments/summary', async (req, res) => {
  const payments = await db.all('payments');
  const revenue = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + (p.amount || 0), 0);
  const pending = payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + (p.amount || 0), 0);
  res.json({ revenue, pending });
});

router.get('/payments', async (req, res) => {
  const payments = await db.all('payments');
  const enriched = await Promise.all(payments.map(async (p) => {
    const enrollment = await db.find('enrollments', { id: p.enrollmentId });
    const student = enrollment ? await db.find('students', { id: enrollment.studentId }) : null;
    const studentUser = student ? await db.find('users', { id: student.userId }) : null;
    const batch = enrollment ? await db.find('batches', { id: enrollment.batchId }) : null;
    const course = batch ? await db.find('courses', { id: batch.courseId }) : null;
    return { ...p, enrollment: enrollment ? { ...enrollment, student: { ...student, user: studentUser }, batch: { ...batch, course } } : null };
  }));
  const sorted = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(paginate(sorted, req));
});
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

// Single enriched payment lookup — used by the printable voucher page so it
// doesn't need to fetch and filter the entire payments list client-side.
router.get('/payments/:id', async (req, res) => {
  const payment = await db.find('payments', { id: req.params.id });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  const enrollment = payment.enrollmentId ? await db.find('enrollments', { id: payment.enrollmentId }) : null;
  const student = enrollment ? await db.find('students', { id: enrollment.studentId }) : null;
  const studentUser = student ? await db.find('users', { id: student.userId }) : null;
  const batch = enrollment ? await db.find('batches', { id: enrollment.batchId }) : null;
  const course = batch ? await db.find('courses', { id: batch.courseId }) : null;

  res.json({
    ...payment,
    enrollment: enrollment
      ? { ...enrollment, student: student ? { ...student, user: studentUser } : null, batch: batch ? { ...batch, course } : null }
      : null,
  });
});

router.put('/payments/:id', async (req, res) => {
  const { status, method, transactionRef } = req.body;
  if (!PAYMENT_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${PAYMENT_STATUSES.join(', ')}` });
  }
  const before = await db.find('payments', { id: req.params.id });
  const patch = { status, method, transactionRef, paidAt: status === 'PAID' ? new Date().toISOString() : null };
  const updated = await db.update('payments', req.params.id, patch);
  await logAction({
    actor: req.user,
    action: 'payment.status_changed',
    entityType: 'payment',
    entityId: req.params.id,
    details: { from: before?.status, to: status, amount: updated.amount },
  });

  if (status === 'PAID' && before?.status !== 'PAID') {
    (async () => {
      try {
        const enrollment = await db.find('enrollments', { id: updated.enrollmentId });
        const student = enrollment ? await db.find('students', { id: enrollment.studentId }) : null;
        const studentUser = student ? await db.find('users', { id: student.userId }) : null;
        const batch = enrollment ? await db.find('batches', { id: enrollment.batchId }) : null;
        const course = batch ? await db.find('courses', { id: batch.courseId }) : null;
        if (studentUser?.email) {
          await mailer.sendPaymentConfirmed({
            to: studentUser.email,
            studentName: studentUser.name,
            courseTitle: course?.title || 'your course',
            amount: updated.amount,
            transactionRef: updated.transactionRef,
          });
        }
      } catch (e) {
        console.error('payment confirmation email failed:', e.message);
      }
    })();
  }

  res.json(updated);
});

// Signed URL to view a student's uploaded payment receipt. Admin-only (no
// ownership check needed — staff can review any payment) but still requires
// a valid session; the receipt is never served from a public/static URL.
router.get('/payments/:id/receipt-url', async (req, res) => {
  const payment = await db.find('payments', { id: req.params.id });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (!payment.receiptPath) return res.status(404).json({ error: 'No receipt has been uploaded for this payment yet' });

  try {
    const url = await getSignedReceiptUrl(payment.receiptPath);
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
    const enrollment = await db.find('enrollments', { id: cert.enrollmentId });
    const student = enrollment ? await db.find('students', { id: enrollment.studentId }) : null;
    const studentUser = student ? await db.find('users', { id: student.userId }) : null;
    const batch = enrollment ? await db.find('batches', { id: enrollment.batchId }) : null;
    const course = batch ? await db.find('courses', { id: batch.courseId }) : null;
    return { ...cert, studentName: studentUser?.name, courseTitle: course?.title };
  }));
  res.json(enriched.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)));
});
router.post('/certificates', async (req, res) => {
  const { enrollmentId } = req.body;
  if (!enrollmentId) return res.status(400).json({ error: 'enrollmentId is required' });

  const enrollment = await db.find('enrollments', { id: enrollmentId });
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

  const existing = await db.find('certificates', { enrollmentId: enrollmentId });
  if (existing) return res.status(409).json({ error: 'A certificate has already been issued for this enrollment.' });

  const verificationCode = 'TCI-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  res.status(201).json(await db.insert('certificates', { ...req.body, verificationCode, issuedAt: new Date().toISOString() }));
});

// Announcements
router.post('/announcements', async (req, res) => res.status(201).json(await db.insert('announcements', req.body)));
router.get('/announcements', async (req, res) => res.json((await db.all('announcements')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));

// Settings — bank details shown to students in the Pay Now panel (Bank
// Transfer view). Stored as a single row in `settings` keyed by a fixed id
// so there's one canonical record to read/write, instead of a config file
// that would need a deploy to change.
const BANK_DETAILS_ID = 'bank_details';
const DEFAULT_BANK_DETAILS = {
  bankName: 'Meezan Bank',
  accountTitle: 'They Code It (Pvt) Ltd',
  accountNumber: '0123-4567890-1',
  iban: 'PK00 MEZN 0000 0001 2345 6789',
  branch: 'Karachi Main Branch',
};
router.get('/bank-details', async (req, res) => {
  const settings = await db.find('settings', { id: BANK_DETAILS_ID });
  res.json(settings || { id: BANK_DETAILS_ID, ...DEFAULT_BANK_DETAILS });
});
router.put('/bank-details', async (req, res) => {
  const { bankName, accountTitle, accountNumber, iban, branch } = req.body;
  if (!bankName || !accountTitle || !accountNumber || !iban) {
    return res.status(400).json({ error: 'bankName, accountTitle, accountNumber, and iban are required' });
  }
  const patch = { bankName, accountTitle, accountNumber, iban, branch: branch || null, updatedAt: new Date().toISOString() };
  const existing = await db.find('settings', { id: BANK_DETAILS_ID });
  const saved = existing
    ? await db.update('settings', BANK_DETAILS_ID, patch)
    : await db.insert('settings', { id: BANK_DETAILS_ID, ...patch });
  res.json(saved);
});

// Audit trail — read-only view of everything logged via lib/audit.js.
router.get('/audit-logs', async (req, res) => {
  const { entityType, entityId } = req.query;
  let logs = await db.all('auditLogs');
  if (entityType) logs = logs.filter((l) => l.entityType === entityType);
  if (entityId) logs = logs.filter((l) => l.entityId === entityId);
  const sorted = logs
    .map((l) => ({ ...l, details: l.details ? JSON.parse(l.details) : null }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(paginate(sorted, req, 50));
});

// Leads / CRM
// NOTE: deliberately NOT paginated like students/payments/enrollments below.
// Leads.jsx renders every lead as a Kanban board grouped by stage — paginating
// the underlying list would split/truncate stages in a confusing way. If lead
// volume grows large enough for this to matter, the right fix is server-side
// filtering by stage (?status=NEW) with pagination per-column, not a flat
// page/limit here. Left as a known follow-up — see ENHANCEMENTS.md.
router.get('/leads', async (req, res) => {
  const sorted = (await db.all('leads')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});
router.put('/leads/:id', async (req, res) => res.json(await db.update('leads', req.params.id, { status: req.body.status })));

module.exports = router;