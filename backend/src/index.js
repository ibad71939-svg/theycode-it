require('dotenv').config();

// Must be required before any routers that use async handlers.
// Patches Express so rejected promises inside async route handlers
// are forwarded to the error-handling middleware.
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

/* =========================================================
   SECURITY HEADERS
========================================================= */

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  'https://www.theycodeit.com',
  'https://theycodeit.com',

  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // such as Postman or server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);

    return callback(new Error('Not allowed by CORS'));
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  optionsSuccessStatus: 204,
};

// Normal requests
app.use(cors(corsOptions));

// Explicitly handle browser preflight requests
app.options('*', cors(corsOptions));

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   GENERAL API RATE LIMITER
========================================================= */

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later.',
    },
  })
);

/* =========================================================
   LOGIN RATE LIMITER
========================================================= */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,

  // Keyed by IP + attempted email.
  // ipKeyGenerator() normalizes IPv6 addresses.
  keyGenerator: (req) =>
    `${ipKeyGenerator(req.ip)}:${(
      req.body?.email || ''
    ).toLowerCase()}`,

  message: {
    error:
      'Too many login attempts. Please wait a few minutes and try again.',
  },
});

app.use('/api/auth/login', loginLimiter);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'they-code-it-api',
  });
});

/* =========================================================
   API ROUTES
========================================================= */

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error(err);

  // Handle CORS errors cleanly
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS origin not allowed',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
  });
});

/* =========================================================
   PROCESS ERROR HANDLING
========================================================= */

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

/* =========================================================
   SERVER
========================================================= */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`They Code It API running on port ${PORT}`);
});
