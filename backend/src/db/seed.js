// backend/src/db/seed.js
// Populates the database with default admin, officer, categories, and sample modules.
// Run once: node src/db/seed.js

const bcrypt = require('bcryptjs');
const pool   = require('./db');

async function seed() {
  try {
    // --- Users ---
    const adminHash   = await bcrypt.hash('Admin@1234', 10);
    const officerHash = await bcrypt.hash('Officer@1234', 10);
    const farmerHash  = await bcrypt.hash('Farmer@1234', 10);

    await pool.query(`
      INSERT IGNORE INTO users (full_name, email, password, role, location) VALUES
        ('System Admin',   'admin@farmerlearn.ke',   ?, 'admin',   'Nairobi'),
        ('Jane Wanjiku',   'officer@farmerlearn.ke', ?, 'officer', 'Nakuru'),
        ('John Kamau',     'farmer@farmerlearn.ke',  ?, 'farmer',  'Kirinyaga')
    `, [adminHash, officerHash, farmerHash]);

    // --- Categories ---
    await pool.query(`
      INSERT IGNORE INTO categories (name, icon) VALUES
        ('Crop Management',    'leaf'),
        ('Pest & Disease',     'bug'),
        ('Soil Health',        'terrain'),
        ('Market Access',      'store'),
        ('Water Management',   'water'),
        ('Sustainable Farming','eco')
    `);

    // --- Sample Modules ---
    const [[officer]] = await pool.query(
      "SELECT user_id FROM users WHERE role='officer' LIMIT 1"
    );
    const [[cat1]] = await pool.query(
      "SELECT category_id FROM categories WHERE name='Crop Management'"
    );
    const [[cat2]] = await pool.query(
      "SELECT category_id FROM categories WHERE name='Pest & Disease'"
    );
    const [[cat3]] = await pool.query(
      "SELECT category_id FROM categories WHERE name='Soil Health'"
    );

    await pool.query(`
      INSERT IGNORE INTO modules
        (title, description, category_id, content_type,
         file_url, thumbnail_url, duration_mins, is_published, created_by)
      VALUES
        ('Introduction to Maize Farming',
         'Learn the basics of planting, watering and harvesting maize on small plots.',
         ?, 'video',
         'https://res.cloudinary.com/demo/video/upload/dog.mp4',
         'https://res.cloudinary.com/demo/image/upload/sample.jpg',
         12, 1, ?),

        ('Identifying Common Crop Pests',
         'Visual guide to spotting aphids, stem borers, and fall armyworm early.',
         ?, 'text',
         NULL,
         'https://res.cloudinary.com/demo/image/upload/sample.jpg',
         8, 1, ?),

        ('Soil Testing and pH Management',
         'How to collect soil samples and interpret results to improve yields.',
         ?, 'image',
         'https://res.cloudinary.com/demo/image/upload/sample.jpg',
         NULL,
         6, 1, ?)
    `, [
      cat1.category_id, officer.user_id,
      cat2.category_id, officer.user_id,
      cat3.category_id, officer.user_id,
    ]);

    console.log('✅  Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
