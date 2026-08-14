const express = require('express');
const db = require('../lib/db');
const { supabase, supabaseAuth } = require('../lib/supabaseClient');

const router = express.Router();

function assertConfigured(res) {
  if (!supabase || !supabaseAuth) {
    res.status(500).json({
      error: 'Supabase is not fully configured on the server (need SUPABASE_URL, SUPABASE_KEY, SUPABASE_ANON_KEY).',
    });
    return false;
  }
  return true;
}

// Student self-registration, step 2: the frontend creates the actual Supabase
// Auth identity itself via supabase.auth.signUp() (same code path the login
// page already uses), then calls this endpoint — with that session's access
// token in the Authorization header — to create the matching profile rows in
// our own `users` + `students` tables (which hold fields Supabase Auth itself
// doesn't store: ID number, DOB, address, guardian contact, etc). This route
// never handles a raw password and never creates the auth account — it only
// verifies the token and finishes the profile for whoever it belongs to.
router.post('/register', async (req, res) => {
  if (!assertConfigured(res)) return;

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const { data: authData, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authData?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const authUser = authData.user;

  const {
    name, email, phone,
    idNumber, dob, gender, address,
    guardianName, guardianRelation, guardianPhone,
  } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'name, email, and phone are required' });
  }
  if (!idNumber || !dob || !address) {
    return res.status(400).json({ error: 'idNumber, dob, and address are required' });
  }

  const existing = await db.find('users', (u) => u.id === authUser.id);
  if (existing) return res.status(409).json({ error: 'This account already has a profile.' });

  try {
    const user = await db.insert('users', {
      id: authUser.id,
      name, email, phone,
      role: 'STUDENT',
      status: 'active',
    });
    await db.insert('students', {
      userId: user.id,
      idNumber, dob, gender: gender || null, address,
      guardianName: guardianName || null,
      guardianRelation: guardianRelation || null,
      guardianPhone: guardianPhone || null,
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    // Roll back the auth identity if profile creation failed, so a retry
    // doesn't hit "email already registered" against a half-created account.
    await supabase.auth.admin.deleteUser(authUser.id).catch(() => {});
    console.error('Profile creation failed after Supabase signup:', e.message);
    res.status(500).json({ error: 'Could not finish creating your profile. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  if (!assertConfigured(res)) return;

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid credentials' });

  const authUser = data.user;
  let profile = await db.find('users', (u) => u.id === authUser.id);

  // Legacy/manual accounts created directly in the Supabase dashboard won't
  // have a profile row yet — create a minimal one on first login.
  if (!profile) {
    profile = await db.insert('users', {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email,
      email: authUser.email,
      phone: authUser.user_metadata?.phone || null,
      role: authUser.user_metadata?.role || 'STUDENT',
      status: 'active',
    });
    // If this user is a STUDENT, also create a matching students profile row
    // so student-only routes (e.g. /api/student/dashboard) won't 404.
    try {
      if ((profile.role || '').toUpperCase() === 'STUDENT') {
        const existingStudent = await db.find('students', (s) => s.userId === profile.id);
        if (!existingStudent) {
          await db.insert('students', { userId: profile.id, idNumber: null, dob: null, address: null });
        }
      }
    } catch (e) {
      console.error('Could not auto-create student profile on login:', e.message);
    }
  }

  res.json({
    token: data.session.access_token,
    user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role },
  });
});

module.exports = router;
