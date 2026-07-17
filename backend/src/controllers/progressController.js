// backend/src/controllers/progressController.js

const pool = require('../db/db');

/**
 * GET /api/progress
 * Farmer: returns their own progress.
 * Admin: returns all progress (paginated).
 */
exports.getProgress = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId  = req.user.id;

    const [rows] = isAdmin
      ? await pool.query(`
          SELECT p.*, m.title AS module_title, u.full_name AS farmer_name
          FROM progress p
          JOIN modules m ON p.module_id = m.module_id
          JOIN users u   ON p.user_id   = u.user_id
          ORDER BY p.completed_at DESC
          LIMIT 200
        `)
      : await pool.query(`
          SELECT p.*, m.title AS module_title, c.name AS category
          FROM progress p
          JOIN modules m     ON p.module_id  = m.module_id
          LEFT JOIN categories c ON m.category_id = c.category_id
          WHERE p.user_id = ?
          ORDER BY p.created_at DESC
        `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('getProgress error:', err);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

/**
 * POST /api/progress
 * Marks a module as complete for the authenticated farmer.
 * Body: { module_id }
 */
exports.markComplete = async (req, res) => {
  try {
    const { module_id } = req.body;
    if (!module_id) {
      return res.status(400).json({ message: 'module_id is required' });
    }

    await pool.query(`
      INSERT INTO progress (user_id, module_id, completed, completed_at)
      VALUES (?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE completed = 1, completed_at = NOW()
    `, [req.user.id, module_id]);

    res.json({ message: 'Progress recorded' });
  } catch (err) {
    console.error('markComplete error:', err);
    res.status(500).json({ message: 'Failed to update progress' });
  }
};
