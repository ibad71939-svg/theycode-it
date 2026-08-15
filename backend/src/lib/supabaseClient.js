const { createClient } = require('@supabase/supabase-js');

// Service-role client: used for all table reads/writes (bypasses RLS) and
// for Supabase Auth admin actions (creating users). Never expose this key
// to the frontend.
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Anon client: used only to validate a user's email/password via
// signInWithPassword, exactly like the frontend would. This is what
// actually confirms the password is correct and issues a real session
// token, which requireAuth later verifies with supabase.auth.getUser().
let supabaseAuth = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

module.exports = { supabase, supabaseAuth };
