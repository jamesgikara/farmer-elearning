// backend/src/server.js
// Express REST API — Mobile E-Learning Platform for Farmers

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    const allowed = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(o => o.trim());
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/modules',    require('./routes/modules'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/progress',   require('./routes/progress'));
app.use('/api/downloads',  require('./routes/downloads'));
app.use('/api/feedback',   require('./routes/feedback'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/assistant',  require('./routes/assistant'));

// ── Health check ────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 ─────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
);

// ── Error handler ───────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── Start ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀  Server running on port ${PORT}  [${process.env.NODE_ENV || 'development'}]`)
);

module.exports = app;
