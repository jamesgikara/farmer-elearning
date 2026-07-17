// backend/src/controllers/downloadsController.js

const pool = require('../db/db');

/**
 * GET /api/downloads
 * Returns all modules the authenticated farmer has downloaded.
 */
exports.getDownloads = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, m.title, m.content_type, m.file_url,
             m.thumbnail_url, m.description, c.name AS category
      FROM downloads d
      JOIN modules m     ON d.module_id   = m.module_id
      LEFT JOIN categories c ON m.category_id = c.category_id
      WHERE d.user_id = ?
      ORDER BY d.downloaded_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error('getDownloads error:', err);
    res.status(500).json({ message: 'Failed to fetch downloads' });
  }
};

/**
 * POST /api/downloads
 * Records a download event.
 * Body: { module_id }
 */
exports.recordDownload = async (req, res) => {
  try {
    const { module_id } = req.body;
    if (!module_id) {
      return res.status(400).json({ message: 'module_id is required' });
    }

    await pool.query(`
      INSERT IGNORE INTO downloads (user_id, module_id)
      VALUES (?, ?)
    `, [req.user.id, module_id]);

    res.status(201).json({ message: 'Download recorded' });
  } catch (err) {
    console.error('recordDownload error:', err);
    res.status(500).json({ message: 'Failed to record download' });
  }
};

/**
 * DELETE /api/downloads/:module_id
 * Removes a download record (farmer removes offline copy).
 */
exports.removeDownload = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM downloads WHERE user_id = ? AND module_id = ?',
      [req.user.id, req.params.module_id]
    );
    res.json({ message: 'Download removed' });
  } catch (err) {
    console.error('removeDownload error:', err);
    res.status(500).json({ message: 'Failed to remove download' });
  }
};
