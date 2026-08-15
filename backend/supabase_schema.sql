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
  consent_accepted_at timestamptz,
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
  receipt_path text,
  receipt_uploaded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- If this table already existed before the bank-transfer receipt feature was
-- added, run these two lines manually in the Supabase SQL editor (safe to
-- run even if the columns already exist):
-- ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_path text;
-- ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_uploaded_at timestamptz;

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

-- Single-row key/value-ish table for site-wide settings. Currently only
-- holds the bank details shown to students in the Pay Now panel (Bank
-- Transfer view) -- editable from the admin Settings page instead of being
-- hardcoded in the frontend.
CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY,
  bank_name text,
  account_title text,
  account_number text,
  iban text,
  branch text,
  updated_at timestamptz DEFAULT now()
);

-- If this table is being added to a database that already existed before
-- this feature, run this manually in the Supabase SQL editor to seed the
-- row with the values that used to be hardcoded in the frontend (safe to
-- run even if a row with this id already exists):
-- INSERT INTO settings (id, bank_name, account_title, account_number, iban, branch)
-- VALUES ('bank_details', 'Meezan Bank', 'They Code It (Pvt) Ltd', '0123-4567890-1', 'PK00 MEZN 0000 0001 2345 6789', 'Karachi Main Branch')
-- ON CONFLICT (id) DO NOTHING;

-- Audit trail — every status-changing admin action (enrollment approval,
-- payment status change, instructor account provisioning) writes one row
-- here via backend/src/lib/audit.js. Append-only: nothing in this app ever
-- updates or deletes a row from this table. `details` holds a small JSON
-- blob (e.g. {"from":"PENDING","to":"APPROVED"}) for context.
CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY,
  actor_id text,
  actor_email text,
  actor_role text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details text,
  created_at timestamptz DEFAULT now()
);

-- If audit_logs is being added to a database that already has the rest of
-- the schema, run just this CREATE TABLE block above manually in the
-- Supabase SQL editor — it's safe to run on its own (IF NOT EXISTS).

-- Consent capture at registration (terms & privacy policy acceptance).
-- If your `students` table already existed before this feature, run this
-- manually in the Supabase SQL editor (safe to run even if it already exists):
-- ALTER TABLE students ADD COLUMN IF NOT EXISTS consent_accepted_at timestamptz;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses (slug);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students (user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments (student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON enrollments (batch_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id ON payments (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON batches (course_id);

-- Enrollment concurrency guard --------------------------------------------
-- The application code used to do duplicate/capacity checks with a plain
-- read followed by a separate insert. Two requests arriving at nearly the
-- same instant could both pass the checks before either one had inserted,
-- letting a batch go over capacity or a student apply twice. These two
-- pieces move the guarantee into Postgres, which is the only place it can
-- actually be enforced atomically:
--
-- 1. A partial unique index blocks a second *active* application outright,
--    even if application code has a bug or is bypassed entirely. REJECTED
--    rows are excluded so a student can re-apply after rejection.
-- 2. A function that locks the batch row (SELECT ... FOR UPDATE) before
--    counting seats and inserting, so concurrent callers queue up instead
--    of racing — the second caller re-reads the up-to-date seat count
--    after the first has committed, rather than both reading stale data.
--
-- If this schema already exists in your Supabase project, run just this
-- block in the SQL editor to add the guard retroactively.

CREATE UNIQUE INDEX IF NOT EXISTS uq_enrollments_student_batch_active
  ON enrollments (student_id, batch_id)
  WHERE status <> 'REJECTED';

CREATE OR REPLACE FUNCTION apply_to_batch(
  p_id text,
  p_student_id text,
  p_batch_id text
) RETURNS enrollments AS $$
DECLARE
  v_capacity integer;
  v_taken integer;
  v_enrollment enrollments;
BEGIN
  -- Locks the batch row for the rest of this transaction. A second,
  -- concurrent call for the same batch blocks here until the first
  -- transaction commits or rolls back, so seat counts can never be read
  -- and acted on out of date.
  SELECT capacity INTO v_capacity FROM batches WHERE id = p_batch_id FOR UPDATE;

  IF v_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_taken FROM enrollments
      WHERE batch_id = p_batch_id AND status IN ('PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED');
    IF v_taken >= v_capacity THEN
      RAISE EXCEPTION 'BATCH_FULL' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  INSERT INTO enrollments (id, student_id, batch_id, status, enrolled_at)
  VALUES (p_id, p_student_id, p_batch_id, 'PENDING', now())
  RETURNING * INTO v_enrollment;

  RETURN v_enrollment;
EXCEPTION
  WHEN unique_violation THEN
    -- Caught here (rather than only relying on the app-level pre-check)
    -- so the uq_enrollments_student_batch_active index above is a real
    -- guarantee and not just a backstop that never actually fires.
    RAISE EXCEPTION 'DUPLICATE_APPLICATION' USING ERRCODE = 'P0002';
END;
$$ LANGUAGE plpgsql;