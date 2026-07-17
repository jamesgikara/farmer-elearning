// backend/src/routes/categories.js
const router = require('express').Router();
const pool   = require('../db/db');
const { auth, requireRole } = require('../middleware/authMiddleware');

// GET all categories (public within authenticated context)
router.get('/', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

// POST new category (admin)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  const { name, icon } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const [result] = await pool.query(
    'INSERT IGNORE INTO categories (name, icon) VALUES (?, ?)', [name, icon || null]
  );
  res.status(201).json({ message: 'Category created', category_id: result.insertId });
});

// DELETE category (admin)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  await pool.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
