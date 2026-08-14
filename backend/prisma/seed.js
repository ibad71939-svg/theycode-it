// Seeds demo data into Supabase: two real Supabase Auth accounts (admin +
// student) plus matching profile rows, a couple of courses/batches, and one
// sample enrollment + payment.
//
// Run this AFTER applying backend/supabase_schema.sql to your Supabase
// project (Supabase SQL editor, or `npm run migrate:supabase`).
//
// This script needs real network access to your Supabase project, so run it
// from your own machine: `cd backend && npm install && node prisma/seed.js`

require('dotenv').config();
const db = require('../src/lib/db');
const { supabase } = require('../src/lib/supabaseClient');

const DEMO_PASSWORD = 'Passw0rd!';

async function ensureAuthUser({ email, name, phone, role }) {
  if (!supabase) throw new Error('Supabase is not configured (check backend/.env)');

  // If this demo user already exists (re-running the seed), reuse it.
  const { data: existingList } = await supabase.auth.admin.listUsers();
  const existing = existingList?.users?.find((u) => u.email === email);
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name, phone, role },
  });
  if (error) throw new Error(`Could not create ${email}: ${error.message}`);
  return data.user;
}

async function main() {
  console.log('Seeding Supabase with demo data...\n');

  const adminAuth = await ensureAuthUser({ email: 'admin@theycodeit.com', name: 'Ayesha Khan', role: 'SUPER_ADMIN' });
  let adminUser = await db.find('users', (u) => u.id === adminAuth.id);
  if (!adminUser) {
    adminUser = await db.insert('users', { id: adminAuth.id, name: 'Ayesha Khan', email: 'admin@theycodeit.com', role: 'SUPER_ADMIN', status: 'active' });
  }

  const instructorAuth = await ensureAuthUser({ email: 'bilal@theycodeit.com', name: 'Bilal Ahmed', role: 'INSTRUCTOR' });
  let instructorUser = await db.find('users', (u) => u.id === instructorAuth.id);
  if (!instructorUser) {
    instructorUser = await db.insert('users', { id: instructorAuth.id, name: 'Bilal Ahmed', email: 'bilal@theycodeit.com', role: 'INSTRUCTOR', status: 'active' });
  }
  let instructor = await db.find('instructors', (i) => i.userId === instructorUser.id);
  if (!instructor) {
    instructor = await db.insert('instructors', { userId: instructorUser.id, bio: 'Full-stack instructor, 8 years industry experience.', specialization: 'Web Development' });
  }

  const studentAuth = await ensureAuthUser({ email: 'student@theycodeit.com', name: 'Hassan Raza', phone: '0300-1234567', role: 'STUDENT' });
  let studentUser = await db.find('users', (u) => u.id === studentAuth.id);
  if (!studentUser) {
    studentUser = await db.insert('users', { id: studentAuth.id, name: 'Hassan Raza', email: 'student@theycodeit.com', phone: '0300-1234567', role: 'STUDENT', status: 'active' });
  }
  let student = await db.find('students', (s) => s.userId === studentUser.id);
  if (!student) {
    student = await db.insert('students', {
      userId: studentUser.id,
      idNumber: '42101-0000000-1',
      dob: '2001-05-10',
      address: 'House 12, Street 5, Karachi',
    });
  }

  let category = await db.find('categories', (c) => c.name === 'Web Development');
  if (!category) category = await db.insert('categories', { name: 'Web Development' });

  let course = await db.find('courses', (c) => c.slug === 'full-stack-web-development');
  if (!course) {
    course = await db.insert('courses', {
      title: 'Full-Stack Web Development',
      slug: 'full-stack-web-development',
      description: 'From HTML/CSS fundamentals to building and deploying full-stack React + Node applications.',
      durationWeeks: 16,
      fee: 45000,
      level: 'Beginner to Intermediate',
      categoryId: category.id,
      isPublished: true,
    });
  }

  let course2 = await db.find('courses', (c) => c.slug === 'python-for-data-science');
  if (!course2) {
    course2 = await db.insert('courses', {
      title: 'Python for Data Science',
      slug: 'python-for-data-science',
      description: 'Core Python, pandas, and data visualization for aspiring data analysts.',
      durationWeeks: 10,
      fee: 32000,
      level: 'Beginner',
      categoryId: category.id,
      isPublished: true,
    });
  }

  let batch = await db.find('batches', (b) => b.courseId === course.id);
  if (!batch) {
    batch = await db.insert('batches', {
      courseId: course.id,
      instructorId: instructor.id,
      startDate: '2026-09-01',
      endDate: '2026-12-20',
      schedule: 'Mon/Wed/Fri, 6:00-8:00 PM',
      capacity: 30,
      mode: 'onsite',
      status: 'upcoming',
    });
  }

  const existingBatch2 = await db.find('batches', (b) => b.courseId === course2.id);
  if (!existingBatch2) {
    await db.insert('batches', {
      courseId: course2.id,
      instructorId: instructor.id,
      startDate: '2026-09-15',
      endDate: '2026-11-24',
      schedule: 'Tue/Thu, 7:00-9:00 PM',
      capacity: 25,
      mode: 'online',
      status: 'upcoming',
    });
  }

  const existingEnrollment = await db.find('enrollments', (e) => e.studentId === student.id && e.batchId === batch.id);
  if (!existingEnrollment) {
    const enrollment = await db.insert('enrollments', { studentId: student.id, batchId: batch.id, status: 'APPROVED', enrolledAt: new Date().toISOString() });
    await db.insert('payments', { enrollmentId: enrollment.id, amount: course.fee, status: 'PAID', method: 'bank_transfer', paidAt: new Date().toISOString() });
  }

  console.log('Seed complete.\n');
  console.log(`Admin login:    admin@theycodeit.com / ${DEMO_PASSWORD}`);
  console.log(`Student login:  student@theycodeit.com / ${DEMO_PASSWORD}`);
  console.log(`Instructor:     bilal@theycodeit.com / ${DEMO_PASSWORD}`);
}

main().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
