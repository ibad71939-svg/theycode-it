// DB loader: Supabase Postgres only. There is no local/offline fallback —
// SUPABASE_URL and SUPABASE_KEY must be set in backend/.env, or the server
// refuses to start (see the check below). This is intentional: a silent
// fallback to local storage is exactly what caused confusing "it works on
// my machine but not in the real app" bugs earlier in this project.

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_KEY in backend/.env. This app only runs against Supabase — there is no local fallback.'
  );
}

module.exports = require('./db_supabase');
