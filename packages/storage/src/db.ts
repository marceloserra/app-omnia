import * as SQLite from "expo-sqlite";

/**
 * Opens (or creates) the Omnia database with the correct schema.
 * Uses expo-sqlite synchronous API (SDK 56 compatible).
 *
 * Schema version: 1
 * Migrations: tracked in the `schema_version` table.
 */
export function openDatabase() {
  const db = SQLite.openDatabaseSync("omnia.db");
  runMigrations(db);
  return db;
}

function runMigrations(db: SQLite.SQLiteDatabase) {
  // Ensure version table exists
  db.execSync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );
  `);

  const row = db.getFirstSync<{ version: number }>(
    "SELECT version FROM schema_version ORDER BY version DESC LIMIT 1;"
  );
  const currentVersion = row?.version ?? 0;

  if (currentVersion < 1) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        system_prompt TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        provider_id TEXT,
        model_id TEXT,
        prompt_tokens INTEGER,
        completion_tokens INTEGER,
        timestamp INTEGER NOT NULL
      );

      INSERT INTO schema_version (version) VALUES (1);
    `);
  }

  if (currentVersion < 2) {
    db.execSync(`
      ALTER TABLE conversations ADD COLUMN is_pinned INTEGER DEFAULT 0;
      UPDATE schema_version SET version = 2;
    `);
  }

  if (currentVersion < 3) {
    db.execSync(`
      ALTER TABLE messages ADD COLUMN attachments TEXT;
      UPDATE schema_version SET version = 3;
    `);
  }
}
