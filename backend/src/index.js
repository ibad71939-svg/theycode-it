require('dotenv').config();
// Must be required before any routers that use async handlers: patches
// Express so a rejected promise inside an `async (req, res) => {}` route is
// forwarded to the error-handling middleware below instead of crashing the
// whole process. Without this, a single Supabase hiccup in a route with no
// try/catch (courses.js, enrollments.js) takes down every connected user.
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

const app = express();

// Sets standard security headers (X-Content-Type-Options, HSTS, disables
// X-Powered-By, etc). contentSecurityPolicy is off because this is a pure
// JSON API with no HTML views of its own to lock down — the frontend is a
// separate app and sets its own CSP.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// General API-wide limiter: generous, just there to blunt scripted abuse
// and accidental retry storms.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Tighter limiter specifically on login: this is the endpoint an attacker
// would actually brute-force, so it gets a much lower ceiling than the
// general API limit above. Keyed by IP + attempted email so one bad actor
// can't lock out other users sharing the same IP (e.g. an office NAT).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Keyed by IP + attempted email so one bad actor can't lock out other
  // users sharing the same IP (e.g. an office NAT). ipKeyGenerator() is
  // required here (rather than raw req.ip) because it normalizes IPv6
  // addresses down to a /56 subnet — without it, an attacker on IPv6 could
  // get a fresh rate-limit bucket on every request just by varying the
  // last few bits of their address.
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${(req.body?.email || '').toLowerCase()}`,
  message: { error: 'Too many login attempts. Please wait a few minutes and try again.' },
});
app.use('/api/auth/login', loginLimiter);

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'they-code-it-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Backstop: express-async-errors covers rejections thrown from inside route
// handlers, but this catches anything else that slips through (e.g. a
// rejection from code running outside the request/response cycle) so the
// process logs it instead of dying silently.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`They Code It API running on port ${PORT}`));
