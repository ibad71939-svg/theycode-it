const express = require('express');
const multer = require('multer');
const db = require('../lib/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadReceipt, getSignedReceiptUrl, MAX_FILE_BYTES } = require('../lib/storage');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_BYTES } });

const router = express.Router();
router.use(requireAuth, requireRole('STUDENT'));

async function getStudent(userId) {
  return db.find('students', { userId: userId });
}

async function enrichEnrollment(e) {
  const batch = await db.find('batches', { id: e.batchId });
  const course = batch ? await db.find('courses', { id: batch.courseId }) : null;
  const instructor = batch && batch.instructorId ? await db.find('instructors', { id: batch.instructorId }) : null;
  const instructorUser = instructor ? await db.find('users', { id: instructor.userId }) : null;
  const payments = await db.filter('payments', { enrollmentId: e.id });
  const attendance = await db.filter('attendance', { enrollmentId: e.id });
  const grades = await db.filter('grades', { enrollmentId: e.id });
  const certificate = (await db.find('certificates', { enrollmentId: e.id })) || null;
  return {
    ...e,
    batch: batch ? { ...batch, course, instructor: instructor ? { ...instructor, user: instructorUser } : null } : null,
    payments, attendance, grades, certificate,
  };
}

router.get('/dashboard', async (req, res) => {
  const student = await getStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const enrollmentsRaw = await db.filter('enrollments', { studentId: student.id });
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
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const enrollmentsRaw = await db.filter('enrollments', { studentId: student.id });
  const enrollments = await Promise.all(enrollmentsRaw.map(enrichEnrollment));
  res.json(enrollments);
});

router.get('/assignments', async (req, res) => {
  const student = await getStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const batchIds = (await db.filter('enrollments', { studentId: student.id })).map((e) => e.batchId);
  const assignments = await db.filter('assignments', (a) => batchIds.includes(a.batchId));
  const enriched = await Promise.all(assignments.map(async (a) => ({
    ...a,
    submissions: await db.filter('submissions', { assignmentId: a.id, studentId: student.id }),
  })));
  res.json(enriched);
});

router.post('/assignments/:id/submit', async (req, res) => {
  const student = await getStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const { fileUrl } = req.body;
  if (!fileUrl) return res.status(400).json({ error: 'fileUrl is required' });

  const assignment = await db.find('assignments', { id: req.params.id });
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  // A student can only submit to an assignment tied to a batch they're
  // actually enrolled in — otherwise any authenticated student could submit
  // to any assignment id by guessing/enumerating it.
  const enrolledInBatch = await db.find(
    'enrollments',
    (e) => e.studentId === student.id && e.batchId === assignment.batchId
  );
  if (!enrolledInBatch) {
    return res.status(403).json({ error: 'You are not enrolled in the batch this assignment belongs to' });
  }

  const submission = await db.insert('submissions', {
    assignmentId: req.params.id,
    studentId: student.id,
    fileUrl,
    submittedAt: new Date().toISOString(),
  });
  res.status(201).json(submission);
});

// Shared ownership check: does this payment belong to an enrollment that
// belongs to the currently authenticated student? Used by both routes below
// so a student can never touch (upload for, or view) another student's
// payment record just by guessing a payment id.
async function loadOwnedPayment(paymentId, studentUserId) {
  const student = await db.find('students', { userId: studentUserId });
  if (!student) return { error: 'Student profile not found', status: 404 };

  const payment = await db.find('payments', { id: paymentId });
  if (!payment) return { error: 'Payment not found', status: 404 };

  const enrollment = await db.find('enrollments', { id: payment.enrollmentId });
  if (!enrollment || enrollment.studentId !== student.id) {
    return { error: 'You do not have access to this payment', status: 403 };
  }

  return { payment };
}

// Bank details for the Bank Transfer view of the Pay Now panel. Read-only
// here — only the admin routes (routes/admin.js) can change them. Falls
// back to sensible defaults if the admin hasn't saved anything yet, so the
// panel never shows blank fields.
const DEFAULT_BANK_DETAILS = {
  bankName: 'Meezan Bank',
  accountTitle: 'They Code It (Pvt) Ltd',
  accountNumber: '0123-4567890-1',
  iban: 'PK00 MEZN 0000 0001 2345 6789',
  branch: 'Karachi Main Branch',
};
router.get('/bank-details', async (req, res) => {
  const settings = await db.find('settings', { id: 'bank_details' });
  res.json(settings || DEFAULT_BANK_DETAILS);
});

const PAYMENT_METHODS = ['cash', 'bank_transfer'];

// Lets the student declare how they intend to pay before actually paying —
// shown as a choice in the Pay Now panel. Blocked once the payment is
// already PAID, since changing the method after the fact doesn't make sense
// and could confuse the paper trail admin relies on.
router.put('/payments/:id/method', requireAuth, requireRole('STUDENT'), async (req, res) => {
  const { method } = req.body;
  if (!PAYMENT_METHODS.includes(method)) {
    return res.status(400).json({ error: `method must be one of: ${PAYMENT_METHODS.join(', ')}` });
  }
  const { payment, error, status } = await loadOwnedPayment(req.params.id, req.user.id);
  if (error) return res.status(status).json({ error });
  if (payment.status === 'PAID') {
    return res.status(409).json({ error: 'This payment has already been marked paid' });
  }
  const updated = await db.update('payments', payment.id, { method });
  res.json(updated);
});

router.post('/payments/:id/receipt', requireAuth, requireRole('STUDENT'), upload.single('file'), async (req, res) => {
  const { payment, error, status } = await loadOwnedPayment(req.params.id, req.user.id);
  if (error) return res.status(status).json({ error });

  if (!req.file) return res.status(400).json({ error: 'No file was uploaded' });

  try {
    const path = await uploadReceipt(payment.id, req.file, payment.receiptPath);
    const updated = await db.update('payments', payment.id, {
      receiptPath: path,
      receiptUploadedAt: new Date().toISOString(),
      method: 'bank_transfer',
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Returns a short-lived signed URL to view the receipt — never the storage
// path itself, and never a public link. Regenerated fresh on every call.
router.get('/payments/:id/receipt-url', requireAuth, requireRole('STUDENT'), async (req, res) => {
  const { payment, error, status } = await loadOwnedPayment(req.params.id, req.user.id);
  if (error) return res.status(status).json({ error });
  if (!payment.receiptPath) return res.status(404).json({ error: 'No receipt has been uploaded for this payment yet' });

  try {
    const url = await getSignedReceiptUrl(payment.receiptPath);
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
