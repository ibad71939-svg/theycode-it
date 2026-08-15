const express = require('express');
const db = require('../lib/db');
const { supabaseAuth } = require('../lib/supabaseClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/me — returns the trusted profile, with role sourced from
// the `users` table (never from Supabase session metadata, which is
// client-writable). No role restriction: any authenticated user calls this
// right after signing in to find out who they are and where to route them.
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/register — called by the frontend AFTER it has already
// created the Supabase Auth identity itself (AuthContext.jsx calls
// supabase.auth.signUp() directly with the anon key, then hits this route
// with the fresh session token). This route is requireAuth-protected using
// that token, and its only job is to create the matching `users` +
// `students` profile rows. Role is ALWAYS hardcoded to STUDENT here — never
// taken from anything the client sends — since this is the only
// registration path a regular visitor can reach. Instructor/admin accounts
// are only ever created through the controlled backend path in
// routes/admin.js (POST /admin/instructors) or a direct DB edit.
router.post('/register', requireAuth, async (req, res) => {
  const {
    name, phone,
    idNumber, dob, gender, address,
    guardianName, guardianPhone, guardianRelation,
    consentAccepted,
  } = req.body;

  if (!name || !idNumber || !dob || !address) {
    return res.status(400).json({ error: 'name, idNumber, dob, and address are required' });
  }

  try {
    let user = await db.find('users', { id: req.user.id });
    if (!user) {
      user = await db.insert('users', {
        id: req.user.id,
        name,
        email: req.user.email,
        phone: phone || null,
        role: 'STUDENT',
        status: 'active',
      });
    }

    let student = await db.find('students', { userId: user.id });
    if (!student) {
      student = await db.insert('students', {
        userId: user.id,
        idNumber,
        dob,
        gender: gender || null,
        address,
        guardianName: guardianName || null,
        guardianPhone: guardianPhone || null,
        guardianRelation: guardianRelation || null,
        consentAcceptedAt: consentAccepted ? new Date().toISOString() : null,
      });
    }

    res.status(201).json({ user, student });
  } catch (e) {
    console.error('registration failed:', e.message);
    res.status(500).json({ error: 'Could not complete registration. Please try again.' });
  }
});

// POST /api/auth/login — fallback path, only used when the frontend isn't
// configured to talk to Supabase Auth directly (see AuthContext.jsx's
// `if (import.meta.env.VITE_SUPABASE_URL)` branch — this is what runs when
// that env var is missing). Validates the password with the anon client
// (same check the frontend would do), then returns the session token plus
// the trusted profile in one response.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  if (!supabaseAuth) return res.status(500).json({ error: 'Supabase is not configured on the server' });

  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error || !data?.session) return res.status(401).json({ error: 'Invalid email or password' });

  let profile = await db.find('users', { id: data.user.id });
  if (!profile) {
    // Same rule as middleware/auth.js: never trust user_metadata.role.
    profile = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email,
      role: 'STUDENT',
    };
  }

  res.json({ token: data.session.access_token, user: profile });
});

module.exports = router;
