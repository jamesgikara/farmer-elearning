// backend/src/controllers/modulesController.js

const pool = require('../db/db');

/**
 * GET /api/modules
 * Returns all published modules with category names.
 * Farmers see published only; officers/admins see all.
 */
exports.getAll = async (req, res) => {
  try {
    const isPrivileged = ['officer', 'admin'].includes(req.user.role);
    const whereClause  = isPrivileged ? '' : 'WHERE m.is_published = 1';

    const [rows] = await pool.query(`
      SELECT
        m.*,
        c.name AS category,
        u.full_name AS created_by_name,
        COALESCE(AVG(f.rating), 0) AS avg_rating,
        COUNT(DISTINCT p.progress_id)  AS completion_count
      FROM modules m
      LEFT JOIN categories c ON m.category_id  = c.category_id
      LEFT JOIN users u       ON m.created_by   = u.user_id
      LEFT JOIN feedback f    ON f.module_id    = m.module_id
      LEFT JOIN progress p    ON p.module_id    = m.module_id AND p.completed = 1
      ${whereClause}
      GROUP BY m.module_id
      ORDER BY m.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('getAll modules error:', err);
    res.status(500).json({ message: 'Failed to fetch modules' });
  }
};

/**
 * GET /api/modules/:id
 */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, c.name AS category, u.full_name AS created_by_name
      FROM modules m
      LEFT JOIN categories c ON m.category_id = c.category_id
      LEFT JOIN users u       ON m.created_by  = u.user_id
      WHERE m.module_id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: 'Module not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getOne module error:', err);
    res.status(500).json({ message: 'Failed to fetch module' });
  }
};

/**
 * POST /api/modules  (officer, admin)
 */
exports.create = async (req, res) => {
  try {
    const {
      title, description, category_id,
      content_type, file_url, thumbnail_url,
      duration_mins, is_published,
    } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({ message: 'title and category_id are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO modules
        (title, description, category_id, content_type,
         file_url, thumbnail_url, duration_mins, is_published, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description   || null,
      category_id,
      content_type  || 'video',
      file_url      || null,
      thumbnail_url || null,
      duration_mins || null,
      is_published  ? 1 : 0,
      req.user.id,
    ]);

    res.status(201).json({ message: 'Module created', module_id: result.insertId });
  } catch (err) {
    console.error('create module error:', err);
    res.status(500).json({ message: 'Failed to create module' });
  }
};

/**
 * PUT /api/modules/:id  (officer, admin)
 */
exports.update = async (req, res) => {
  try {
    const {
      title, description, category_id,
      content_type, file_url, thumbnail_url,
      duration_mins, is_published,
    } = req.body;

    await pool.query(`
      UPDATE modules
      SET title = COALESCE(?, title),
          description   = COALESCE(?, description),
          category_id   = COALESCE(?, category_id),
          content_type  = COALESCE(?, content_type),
          file_url      = COALESCE(?, file_url),
          thumbnail_url = COALESCE(?, thumbnail_url),
          duration_mins = COALESCE(?, duration_mins),
          is_published  = COALESCE(?, is_published)
      WHERE module_id = ?
    `, [
      title, description, category_id,
      content_type, file_url, thumbnail_url,
      duration_mins, is_published != null ? (is_published ? 1 : 0) : null,
      req.params.id,
    ]);

    res.json({ message: 'Module updated' });
  } catch (err) {
    console.error('update module error:', err);
    res.status(500).json({ message: 'Failed to update module' });
  }
};

/**
 * DELETE /api/modules/:id  (admin)
 */
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM modules WHERE module_id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json({ message: 'Module deleted' });
  } catch (err) {
    console.error('delete module error:', err);
    res.status(500).json({ message: 'Failed to delete module' });
  }
};
