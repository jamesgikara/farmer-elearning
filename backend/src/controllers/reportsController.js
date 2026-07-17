// backend/src/controllers/reportsController.js
// Admin-level reporting and analytics

const pool = require('../db/db');

/**
 * GET /api/reports/completion
 * Module completion statistics.
 */
exports.completion = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.module_id,
        m.title,
        c.name AS category,
        COUNT(DISTINCT p.user_id)            AS total_completions,
        COALESCE(AVG(f.rating), 0)           AS avg_rating,
        COUNT(DISTINCT d.user_id)            AS total_downloads
      FROM modules m
      LEFT JOIN categories c ON m.category_id = c.category_id
      LEFT JOIN progress p   ON p.module_id   = m.module_id AND p.completed = 1
      LEFT JOIN feedback f   ON f.module_id   = m.module_id
      LEFT JOIN downloads d  ON d.module_id   = m.module_id
      WHERE m.is_published = 1
      GROUP BY m.module_id
      ORDER BY total_completions DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('completion report error:', err);
    res.status(500).json({ message: 'Failed to generate completion report' });
  }
};

/**
 * GET /api/reports/summary
 * High-level dashboard statistics.
 */
exports.summary = async (req, res) => {
  try {
    const [[users]]   = await pool.query(
      "SELECT COUNT(*) AS total_users, SUM(role='farmer') AS total_farmers, SUM(role='officer') AS total_officers FROM users WHERE is_active=1"
    );
    const [[mods]]    = await pool.query(
      "SELECT COUNT(*) AS total_modules, SUM(is_published=1) AS published_modules FROM modules"
    );
    const [[prog]]    = await pool.query(
      "SELECT COUNT(*) AS total_completions FROM progress WHERE completed=1"
    );
    const [[avgRating]] = await pool.query(
      "SELECT COALESCE(AVG(rating),0) AS avg_rating FROM feedback"
    );

    res.json({
      ...users,
      ...mods,
      ...prog,
      avg_rating: parseFloat(avgRating.avg_rating).toFixed(2),
    });
  } catch (err) {
    console.error('summary report error:', err);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

/**
 * GET /api/reports/category-engagement
 * Completions grouped by category.
 */
exports.categoryEngagement = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.name                          AS category,
        COUNT(DISTINCT m.module_id)     AS module_count,
        COUNT(DISTINCT p.progress_id)   AS completions
      FROM categories c
      LEFT JOIN modules m  ON m.category_id  = c.category_id AND m.is_published = 1
      LEFT JOIN progress p ON p.module_id    = m.module_id AND p.completed = 1
      GROUP BY c.category_id
      ORDER BY completions DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('categoryEngagement error:', err);
    res.status(500).json({ message: 'Failed to fetch category engagement' });
  }
};
