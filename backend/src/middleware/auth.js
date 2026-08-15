const { supabase } = require('../lib/supabaseClient');
const db = require('../lib/db');

// Verifies the bearer token against Supabase Auth (trusted identity check),
// then looks up the profile row in our own `users` table by that id to get
// the current name/role. The `users` table is the source of truth for role
// (so promoting someone to REGISTRAR/SUPER_ADMIN is just an update to that
// table's `role` column) rather than trusting stale JWT metadata.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase is not configured on the server' });
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });

    const authUser = data.user;
    let profile = await db.find('users', { id: authUser.id });

    // Fallback: profile row missing (shouldn't happen post-registration, but
    // covers accounts created directly in the Supabase dashboard). Role is
    // ALWAYS 'STUDENT' here, never read from user_metadata — that field is
    // client-writable via the public anon key (anyone can call
    // supabase.auth.signUp/updateUser with any metadata they like), so
    // trusting it for authorization would let someone self-grant
    // SUPER_ADMIN. Real elevated roles only ever come from a `users` table
    // row, which only this backend can write.
    if (!profile) {
      profile = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email,
        role: 'STUDENT',
      };
    }

    req.user = { id: profile.id, email: profile.email, name: profile.name, role: profile.role };
    next();
  } catch (e) {
    console.error('requireAuth error:', e.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
