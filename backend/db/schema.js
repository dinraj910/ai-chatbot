/**
 * Astra DB Schema Initializer
 * Creates the `sessions` and `messages` collections if they don't exist.
 * Called once on server startup.
 */

const { getDb } = require('./astraClient');

const COLLECTIONS = {
  SESSIONS: 'sessions',
  MESSAGES: 'messages',
};

/**
 * Ensures all required collections exist in the keyspace.
 * Astra's Data API is idempotent — creating an existing collection is a no-op.
 */
const initSchema = async () => {
  const db = getDb();
  if (!db) {
    console.warn('[Schema] Skipping schema init — DB not connected.');
    return;
  }

  try {
    // Sessions collection — one doc per chat conversation
    await db.createCollection(COLLECTIONS.SESSIONS, {
      defaultId: { type: 'uuid' },
      ifNotExists: true,
    });
    console.log(`[Schema] ✅ Collection ready: ${COLLECTIONS.SESSIONS}`);

    // Messages collection — all chat messages
    // UUIDv7 is time-sortable → natural chronological order
    await db.createCollection(COLLECTIONS.MESSAGES, {
      defaultId: { type: 'uuidv7' },
      ifNotExists: true,
    });
    console.log(`[Schema] ✅ Collection ready: ${COLLECTIONS.MESSAGES}`);

  } catch (err) {
    // Log but don't crash the server — the app works without DB
    console.error('[Schema] ❌ Failed to initialize collections:', err.message);
  }
};

module.exports = { initSchema, COLLECTIONS };
