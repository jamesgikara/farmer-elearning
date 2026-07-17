// backend/src/controllers/authController.js
// Handles user registration and login with bcrypt + JWT

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/db');

/**
 * POST /api/auth/register
 * Body: { full_name, email, password, role?, location? }
 */
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role, location } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email and password are required' });
    }

    // Check for duplicate email
    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE email = ?', [email]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = ['farmer', 'officer', 'admin'].includes(role) ? role : 'farmer';

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password, role, location)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, hashed, assignedRole, location || null]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user_id: result.insertId,
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id:       user.user_id,
        name:     user.full_name,
        email:    user.email,
        role:     user.role,
        location: user.location,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * GET /api/auth/me  (protected)
 * Returns the currently authenticated user's profile.
 */
exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, location, created_at FROM users WHERE user_id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
