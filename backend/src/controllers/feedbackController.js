// backend/src/controllers/feedbackController.js

const pool = require('../db/db');

/**
 * GET /api/feedback/:module_id
 * Returns all feedback for a given module (officer/admin).
 */
exports.getForModule = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, u.full_name AS farmer_name
      FROM feedback f
      JOIN users u ON f.user_id = u.user_id
      WHERE f.module_id = ?
      ORDER BY f.created_at DESC
    `, [req.params.module_id]);

    res.json(rows);
  } catch (err) {
    console.error('getForModule error:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};

/**
 * POST /api/feedback
 * Farmer submits a rating and optional comment.
 * Body: { module_id, rating, comment? }
 */
exports.submit = async (req, res) => {
  try {
    const { module_id, rating, comment } = req.body;

    if (!module_id || !rating) {
      return res.status(400).json({ message: 'module_id and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const [result] = await pool.query(`
      INSERT INTO feedback (user_id, module_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, module_id, rating, comment || null]);

    res.status(201).json({ message: 'Feedback submitted', feedback_id: result.insertId });
  } catch (err) {
    console.error('submit feedback error:', err);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

/**
 * DELETE /api/feedback/:id  (admin)
 */
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM feedback WHERE feedback_id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error('delete feedback error:', err);
    res.status(500).json({ message: 'Failed to delete feedback' });
  }
};
