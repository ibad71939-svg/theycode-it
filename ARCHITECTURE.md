# They Code It — Architecture & Handoff Document
*Updated by Claude this session. Read this before touching the codebase — it reflects the actual current state, including known gaps.*

## 0. Latest Session: Supabase-Only + 404 Diagnosis
Two things happened this session:

**1. All local/offline fallback code removed — Supabase is now the only path, and it fails loudly if misconfigured.**
- Deleted `backend/src/lib/db_local.js` entirely.
- Deleted `backend/src/lib/prisma.js` and `backend/prisma/schema.prisma` (dead code — `supabase_schema.sql` is the single source of truth for the schema now).
- `backend/src/lib/db.js` no longer branches on whether Supabase env vars are present — it throws immediately on startup if `SUPABASE_URL`/`SUPABASE_KEY` are missing, instead of silently degrading to local storage.
- Trimmed `backend/package.json`: removed `@prisma/client`, `prisma`, `bcryptjs`, `jsonwebtoken` — none of them are used anymore (auth is 100% Supabase Auth now, no local password hashing or JWT signing).

**2. The reported `GET /api/student/dashboard 404` was not a code bug — it's confirmed a stale-server issue.** I started the current backend and hit that exact route: it correctly returns `401 Unauthorized` (route matched, auth required), not `404` (route not found). A 404 only happens if an older version of the backend is what's actually running. See Section 2A below for the exact restart sequence to avoid this.

I also cross-referenced **every single API call the frontend makes against every route the backend registers** (grepped both sides, diffed the lists) — every call has a matching route. No other hidden mismatches exist right now.

### 2A. If you hit a 404 again: do this exact sequence
```
# 1. Kill anything already running on port 4000
#    (on Mac/Linux)
lsof -ti:4000 | xargs kill -9
#    (on Windows, in an admin terminal)
netstat -ano | findstr :4000
taskkill /PID <the_pid_you_see> /F

# 2. Make sure you're in the NEW extracted folder, not an old one
cd backend
rm -rf node_modules package-lock.json
npm install

# 3. Start fresh and watch the terminal — it should print exactly:
#    "They Code It API running on port 4000"
npm run dev
```
If it still 404s after that exact sequence, the route genuinely doesn't exist and it's a real bug — paste me the terminal output and I'll fix it directly.

The project arrived with Supabase partially wired in, but broken in ways that made every admin/student feature fail. Root causes found and fixed:

1. **Column-casing bug (the main one).** `supabase_schema.sql` created columns like `userId`, `createdAt` unquoted. Postgres silently folds unquoted identifiers to lowercase, so those columns actually existed as `userid`, `createdat` — while every route queried using camelCase keys. Every read/write to Postgres was failing.
   **Fix:** rewrote `supabase_schema.sql` entirely in snake_case, and rewrote `backend/src/lib/db_supabase.js` to auto-convert camelCase ⇄ snake_case on every read/write. Verified the conversion against every field name actually used in the schema (round-trip tested — see Section 6).

2. **Split-brain auth.** The frontend called Supabase Auth directly (`supabase.auth.signInWithPassword` via the anon key) while the backend's `requireAuth` middleware also tried to verify independently, and demo/seeded accounts only ever existed in a local JSON file — never in real Supabase Auth. Logins were failing at multiple different layers depending on which account you used.
   **Fix:** unified everything through the backend. Frontend now only calls `POST /api/auth/login` and `POST /api/auth/register`; the backend talks to Supabase Auth (using both a service-role client for admin actions and an anon-key client to validate passwords) and returns one consistent session token. `requireAuth` verifies that token against Supabase, then reads the user's role from our own `users` table (source of truth — promoting someone to admin is just an edit to that table).

3. **Registration was dropping fields.** The multi-step signup form collects ID number, DOB, address, guardian contact — none of it was reaching the database. Fixed: `POST /api/auth/register` now requires and stores all of it on the `students` row.

4. **A few missing `await`s** in `admin.js` (students list route) were silently returning `Promise` objects instead of data.

5. **Five admin pages (Instructors, Assignments, Attendance, Certificates, Announcements)** were sending payloads that didn't match the backend or schema at all (e.g. Instructors posted `{name, email}` with no way to actually create an account; Attendance posted `{enrollmentId, present: true}` with no batch or date). Rebuilt all five, and added backend support they needed: a flat `/admin/batches` endpoint for dropdowns, real instructor-account provisioning (creates a Supabase Auth user + returns a one-time temp password), `/admin/certificates` listing, and `?batchId=` filtering on `/admin/enrollments` for attendance rosters.

6. **Login/signup now hide themselves once logged in.** Added `PublicOnlyRoute` — visiting `/login` or `/register` while authenticated redirects straight to the right dashboard instead of showing the form again.

---

## 2. IMPORTANT — What I Could Not Verify
This sandbox's network egress is allowlisted to a fixed set of domains (npm, GitHub, PyPI, etc.) and **does not include `supabase.co`**. Every request to your actual project — REST API, Auth API, and the direct Postgres connection — is blocked at the network layer here, confirmed by testing directly (`Host not in allowlist: peorcgutbaxkpsnqlhfm.supabase.co`).

So: **I fixed and verified the code is logically correct (syntax-checked every backend file, confirmed the case-mapping round-trips correctly on every real field name, built the frontend cleanly), but I have not run a single request against your live Supabase project.** You need to do the two steps below yourself, from a machine with normal internet access.

### Step A — Apply the schema
In the Supabase dashboard → SQL Editor, paste and run `backend/supabase_schema.sql` in full. (Or run `cd backend && npm run migrate:supabase`, which uses `DATABASE_URL` from `.env` via `migrate.js` — same effect, from your terminal.)

### Step B — Seed demo data
```
cd backend
npm install
node prisma/seed.js
```
This creates two **real Supabase Auth accounts** (not fake/local ones) plus their profile rows, two courses, two batches, and one sample enrollment+payment:
- Admin: `admin@theycodeit.com` / `Passw0rd!`
- Student: `student@theycodeit.com` / `Passw0rd!`
- Instructor: `bilal@theycodeit.com` / `Passw0rd!`

The script is idempotent-ish (checks for existing rows/users before creating), so re-running it after a partial failure won't duplicate everything.

### Step C — Run it
```
# backend
cd backend && npm run dev        # http://localhost:4000

# frontend (separate terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```
Try logging in as admin and student and confirm the dashboards populate. If something 500s, check the backend terminal output first — Supabase/PostgREST error messages are passed through (e.g. `[supabase] insert users: ...`), which will point straight at the problem.

---

## 3. Current Auth Flow (how it actually works now)
```
Register:
  Frontend → POST /api/auth/register (all form fields)
    Backend → supabase.auth.admin.createUser()      [service role, skips email confirmation]
    Backend → insert into users + students tables    [service role, our own profile data]
    Backend → supabaseAuth.auth.signInWithPassword()  [anon key, gets a real session]
    Backend → returns { token, user } to frontend

Login:
  Frontend → POST /api/auth/login { email, password }
    Backend → supabaseAuth.auth.signInWithPassword()  [anon key, validates password]
    Backend → look up profile row in users table by id
    Backend → returns { token, user }

Every authenticated request:
  Frontend → sends "Authorization: Bearer <token>"
    Backend requireAuth → supabase.auth.getUser(token)   [confirms token is a real, valid Supabase session]
    Backend requireAuth → look up role from users table by id   [source of truth for role/permissions]
    → req.user = { id, email, name, role }
```
The frontend never talks to Supabase directly — `frontend/src/lib/supabase.js` was removed since it's no longer used anywhere.

---

## 4. Repo Layout (unchanged structurally, see previous handoff for full tree)
Key files touched this session:
```
backend/
├── supabase_schema.sql        ← REWRITTEN: snake_case columns, created_at on every table
├── prisma/seed.js             ← REWRITTEN: seeds real Supabase Auth accounts, idempotent-ish
├── src/lib/db_supabase.js     ← REWRITTEN: camelCase <-> snake_case mapping on every call
├── src/lib/supabaseClient.js  ← REWRITTEN: now exports both `supabase` (service role) and `supabaseAuth` (anon)
├── src/middleware/auth.js     ← REWRITTEN: verifies via Supabase, sources role from our `users` table
├── src/routes/auth.js         ← REWRITTEN: full register (all fields) + login, both through backend only
├── src/routes/admin.js        ← FIXED missing awaits; ADDED /instructors (real provisioning), /batches, /certificates (GET), ?batchId filter on /enrollments
└── .env                       ← ADDED SUPABASE_ANON_KEY (needed for the login/register password check)

frontend/
├── src/context/AuthContext.jsx     ← REWRITTEN: backend-only, no direct Supabase calls
├── src/components/PublicOnlyRoute.jsx  ← NEW: hides /login, /register when already authenticated
├── src/App.jsx                     ← wraps /login, /register in PublicOnlyRoute
├── src/lib/supabase.js             ← REMOVED (unused after the auth unification)
└── src/pages/admin/
    ├── Instructors.jsx      ← REBUILT: real account creation form + temp-password display
    ├── Assignments.jsx      ← REBUILT: batch dropdown, due date, max marks
    ├── Attendance.jsx       ← REBUILT: batch selector -> student roster -> present/absent/late
    ├── Certificates.jsx     ← REBUILT: enrollment dropdown, issued-certificates table
    └── Announcements.jsx    ← REBUILT: title/body/audience matching the schema
```

---

## 5. What's Still Rough / Not Done
Same list as the previous handoff, still accurate:
1. No real payment gateway (payments are manual/mock — `status`/`method`/`transactionRef` exist, nothing talks to Stripe/JazzCash/Easypaisa).
2. No file upload — assignment submissions and instructor/student photos take a URL string, no actual upload endpoint or storage bucket wired.
3. No email/SMS notifications (enrollment approval, payment confirmation, fee reminders).
4. No refresh-token handling beyond what Supabase's client gives by default; no rate limiting on login.
5. No tests (unit, integration, or e2e) anywhere.
6. No CI/CD, no Docker, no deployment config.
7. RLS is left disabled on all tables (documented as intentional in the SQL file's header, since only the service-role backend touches tables — but worth revisiting if you ever let the frontend query Postgres directly).

---

## 6. Verification Performed This Session (and what's left to you)
| Check | Status |
|---|---|
| Every backend `.js` file passes `node --check` | ✅ Done |
| Frontend builds cleanly (`npm run build`, zero errors/warnings) | ✅ Done |
| camelCase ⇄ snake_case mapping round-trips correctly on every real field name in the schema | ✅ Done (dry-run tested) |
| Schema SQL actually applied to your Supabase project | ⬜ **You need to run this** (Section 2, Step A) |
| Seed script actually run against your Supabase project | ⬜ **You need to run this** (Section 2, Step B) |
| Live login/register/CRUD tested against your real project | ⬜ **Not possible from this sandbox** — network egress here is allowlisted and does not include `supabase.co`. Test locally after Steps A/B. |

If Step A/B/C above surface any errors, paste the exact backend console output back to me and I'll fix it directly — the error messages from Supabase/PostgREST are passed through unmodified specifically so this is diagnosable.
