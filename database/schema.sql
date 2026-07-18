// =====================================================
CREATE DATABASE IF NOT EXISTS farmer_elearning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE farmer_elearning;

-- ------------------------------------------------
-- Table: users
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id    INT          PRIMARY KEY AUTO_INCREMENT,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash
  role       ENUM('farmer','officer','admin') DEFAULT 'farmer',
  location   VARCHAR(100),
  is_active  BOOLEAN      DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------
-- Table: categories
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  category_id INT         PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(50),
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------
-- Table: modules
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS modules (
  module_id     INT          PRIMARY KEY AUTO_INCREMENT,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  category_id   INT,
  content_type  ENUM('video','text','image') DEFAULT 'video',
  file_url      VARCHAR(500),
  thumbnail_url VARCHAR(500),
  duration_mins INT,
  is_published  BOOLEAN      DEFAULT FALSE,
  created_by    INT,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(user_id)
    ON DELETE SET NULL
);

-- ------------------------------------------------
-- Table: progress
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS progress (
  progress_id  INT       PRIMARY KEY AUTO_INCREMENT,
  user_id      INT       NOT NULL,
  module_id    INT       NOT NULL,
  completed    BOOLEAN   DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_module (user_id, module_id),
  FOREIGN KEY (user_id)   REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE
);

-- ------------------------------------------------
-- Table: downloads
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS downloads (
  download_id   INT       PRIMARY KEY AUTO_INCREMENT,
  user_id       INT       NOT NULL,
  module_id     INT       NOT NULL,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_download (user_id, module_id),
  FOREIGN KEY (user_id)   REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE
);

-- ------------------------------------------------
-- Table: feedback
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INT       PRIMARY KEY AUTO_INCREMENT,
  user_id     INT       NOT NULL,
  module_id   INT       NOT NULL,
  rating      TINYINT   CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE
);

-- =====================================================
-- Seed Data
-- =====================================================

-- Categories
INSERT INTO categories (name, icon) VALUES
  ('Crop Management',   'leaf'),
  ('Pest & Disease',    'bug'),
  ('Soil Health',       'terrain'),
  ('Market Access',     'store'),
  ('Water Management',  'water'),
  ('Sustainable Farming','eco');

-- Admin user (password: Admin@1234)
INSERT INTO users (full_name, email, password, role) VALUES
  ('System Admin',
   'admin@farmerlearn.ke',
   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
   'admin');

-- Sample Extension Officer (password: Officer@1234)
INSERT INTO users (full_name, email, password, role, location) VALUES
  ('Jane Wanjiku',
   'officer@farmerlearn.ke',
   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
   'officer',
   'Nakuru');
