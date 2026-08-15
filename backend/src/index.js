require('dotenv').config();
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
   CORS
========================================================= */

const allowedOrigins = [
  'https://www.theycodeit.com',
  'https://theycodeit.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no Origin header
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('CORS blocked:', origin);

    return callback(new Error('Not allowed by CORS'));
  },

  credentials: true,

  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  optionsSuccessStatus: 204,
};

/*
 * CORS MUST come before rate limiting and routes.
 */
app.use(cors(corsOptions));

/*
 * Explicit preflight handler.
 */
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
      res.header('Access-Control-Max-Age', '86400');

      return res.sendStatus(204);
    }

    return res.sendStatus(403);
  }

  next();
});

/* =========================================================
   SECURITY HEADERS
========================================================= */

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

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
   ROUTES
========================================================= */

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

/* =========================================================
   404
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
  console.error('Server error:', err);

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
   UNHANDLED REJECTION
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
