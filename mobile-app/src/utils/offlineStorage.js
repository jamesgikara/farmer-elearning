// mobile-app/src/utils/offlineStorage.js
// SQLite-backed offline module cache

import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db = null;

export const getDB = async () => {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'farmerlearn.db', location: 'default' });
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS offline_modules (
      id           INTEGER PRIMARY KEY,
      title        TEXT NOT NULL,
      description  TEXT,
      content_type TEXT,
      file_url     TEXT,
      thumbnail_url TEXT,
      category     TEXT,
      duration_mins INTEGER,
      saved_at     TEXT DEFAULT (datetime('now'))
    )
  `);
  return db;
};

/**
 * Save or replace a module in local SQLite cache.
 */
export const saveModuleOffline = async (module) => {
  const database = await getDB();
  await database.executeSql(
    `INSERT OR REPLACE INTO offline_modules
       (id, title, description, content_type, file_url, thumbnail_url, category, duration_mins)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      module.module_id,
      module.title,
      module.description || '',
      module.content_type || 'text',
      module.file_url || '',
      module.thumbnail_url || '',
      module.category || '',
      module.duration_mins || 0,
    ]
  );
};

/**
 * Get all cached modules.
 */
export const getOfflineModules = async () => {
  const database = await getDB();
  const [results] = await database.executeSql('SELECT * FROM offline_modules ORDER BY saved_at DESC');
  const rows = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i));
  }
  return rows;
};

/**
 * Check if a specific module is cached.
 */
export const isModuleCached = async (moduleId) => {
  const database = await getDB();
  const [results] = await database.executeSql(
    'SELECT id FROM offline_modules WHERE id = ?', [moduleId]
  );
  return results.rows.length > 0;
};

/**
 * Remove a module from local cache.
 */
export const removeOfflineModule = async (moduleId) => {
  const database = await getDB();
  await database.executeSql('DELETE FROM offline_modules WHERE id = ?', [moduleId]);
};
