// backend/src/controllers/usersController.js
// Admin-only user management

const bcrypt = require('bcryptjs');
const pool   = require('../db/db');

/**
 * GET /api/users
 * Returns all users (admin only).
 */
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT user_id, full_name, email, role, location, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('getAll users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * GET /api/users/:id  (admin)
 */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, location, is_active, created_at FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

/**
 * PUT /api/users/:id  (admin)
 * Body: { full_name?, role?, location?, is_active?, password? }
 */
exports.update = async (req, res) => {
  try {
    const { full_name, role, location, is_active, password } = req.body;
    let hashedPw = undefined;
    if (password) hashedPw = await bcrypt.hash(password, 10);

    await pool.query(`
      UPDATE users
      SET full_name  = COALESCE(?, full_name),
          role       = COALESCE(?, role),
          location   = COALESCE(?, location),
          is_active  = COALESCE(?, is_active),
          password   = COALESCE(?, password)
      WHERE user_id = ?
    `, [full_name, role, location, is_active != null ? (is_active ? 1 : 0) : null, hashedPw || null, req.params.id]);

    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('update user error:', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

/**
 * DELETE /api/users/:id  (admin)
 */
exports.remove = async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ message: 'Admin cannot delete their own account' });
    }
    const [result] = await pool.query(
      'DELETE FROM users WHERE user_id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
