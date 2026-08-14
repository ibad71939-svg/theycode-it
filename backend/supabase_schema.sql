-- Supabase / Postgres schema for They Code It.
-- Run this in the Supabase SQL editor (or via `npm run migrate:supabase` using
-- DATABASE_URL) BEFORE starting the backend or running the seed script.
--
-- All columns use snake_case. Postgres folds unquoted identifiers to
-- lowercase, so `userId` silently becomes `userid` if written without
-- quotes -- snake_case avoids that trap and matches what
-- backend/src/lib/db_supabase.js sends (it converts camelCase <-> snake_case
-- automatically, so the rest of the app still uses camelCase everywhere).
--
-- RLS: left disabled here. Only the backend (using the service_role key,
-- which bypasses RLS) talks to these tables -- the frontend only calls
-- Supabase Auth directly (with the anon key), never these tables directly.
-- If you later let the frontend query Postgres directly, enable RLS and add
-- policies before doing so.

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  password_hash text,
  role text DEFAULT 'STUDENT',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id text PRIMARY KEY,
  user_id text UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  id_number text,
  dob text,
  gender text,
  address text,
  guardian_name text,
  guardian_relation text,
  guardian_phone text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instructors (
  id text PRIMARY KEY,
  user_id text UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio text,
  specialization text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  duration_weeks integer NOT NULL,
  fee numeric,
  level text,
  category_id text REFERENCES categories(id),
  thumbnail_url text,
  syllabus_url text,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batches (
  id text PRIMARY KEY,
  course_id text REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id text REFERENCES instructors(id),
  start_date timestamptz,
  end_date timestamptz,
  schedule text,
  capacity integer,
  mode text DEFAULT 'onsite',
  status text DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id text PRIMARY KEY,
  student_id text REFERENCES students(id) ON DELETE CASCADE,
  batch_id text REFERENCES batches(id) ON DELETE CASCADE,
  status text DEFAULT 'PENDING',
  enrolled_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  enrollment_id text REFERENCES enrollments(id) ON DELETE CASCADE,
  amount numeric,
  method text DEFAULT 'manual',
  status text DEFAULT 'PENDING',
  transaction_ref text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance (
  id text PRIMARY KEY,
  enrollment_id text REFERENCES enrollments(id) ON DELETE CASCADE,
  batch_id text REFERENCES batches(id) ON DELETE CASCADE,
  session_date timestamptz,
  status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
  id text PRIMARY KEY,
  batch_id text REFERENCES batches(id) ON DELETE CASCADE,
  title text,
  description text,
  due_date timestamptz,
  max_marks integer,
  attachment_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id text PRIMARY KEY,
  assignment_id text REFERENCES assignments(id) ON DELETE CASCADE,
  student_id text REFERENCES students(id) ON DELETE CASCADE,
  file_url text,
  submitted_at timestamptz DEFAULT now(),
  marks_obtained integer,
  feedback text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grades (
  id text PRIMARY KEY,
  enrollment_id text REFERENCES enrollments(id) ON DELETE CASCADE,
  exam_type text,
  marks_obtained numeric,
  max_marks numeric,
  remarks text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id text PRIMARY KEY,
  enrollment_id text UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
  certificate_url text,
  issued_at timestamptz DEFAULT now(),
  verification_code text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id text PRIMARY KEY,
  title text,
  body text,
  audience text DEFAULT 'all',
  batch_id text,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY,
  name text,
  email text,
  phone text,
  message text,
  course_interest text,
  status text DEFAULT 'NEW',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses (slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students (user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments (student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON enrollments (batch_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id ON payments (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON batches (course_id);
