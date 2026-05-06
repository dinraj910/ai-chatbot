/**
 * DB Service — All Astra DB Operations
 *
 * Single source of truth for database reads and writes.
 * Every function checks if DB is available and fails gracefully if not.
 *
 * Collections:
 *   sessions  → one document per chat session
 *   messages  → all messages, indexed by session_id
 */

const { getDb } = require('../db/astraClient');
const { COLLECTIONS } = require('../db/schema');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Returns the current time bucket string 'YYYY-MM' for message partitioning */
const getBucket = () => new Date().toISOString().slice(0, 7);

/** Safely get a collection or return null if DB is offline */
const getCollection = (name) => {
  const db = getDb();
  if (!db) return null;
  return db.collection(name);
};

// ─────────────────────────────────────────────
// Session Operations
// ─────────────────────────────────────────────

/**
 * Create a new chat session.
 * @param {string} title - Initial title (usually "New Chat")
 * @returns {Object|null} The created session document, or null if DB is offline
 */
const createSession = async (title = 'New Chat') => {
  const sessions = getCollection(COLLECTIONS.SESSIONS);
  if (!sessions) return null;

  const now = new Date().toISOString();
  const session = {
    _id: uuidv4(),
    title,
    model_used: null,
    message_count: 0,
    created_at: now,
    updated_at: now,
  };

  await sessions.insertOne(session);
  console.log(`[DB] ✅ Session created: ${session._id}`);
  return session;
};

/**
 * Get all sessions, sorted by most recently updated.
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Array} Array of session documents
 */
const getSessions = async (limit = 50) => {
  const sessions = getCollection(COLLECTIONS.SESSIONS);
  if (!sessions) return [];

  const cursor = sessions.find(
    {},
    {
      sort: { updated_at: -1 },
      limit,
    }
  );

  return await cursor.toArray();
};

/**
 * Get a single session by ID.
 * @param {string} sessionId
 * @returns {Object|null}
 */
const getSession = async (sessionId) => {
  const sessions = getCollection(COLLECTIONS.SESSIONS);
  if (!sessions) return null;

  return await sessions.findOne({ _id: sessionId });
};

/**
 * Update a session's fields (title, updated_at, model_used, etc.)
 * @param {string} sessionId
 * @param {Object} patch - Fields to update
 */
const updateSession = async (sessionId, patch) => {
  const sessions = getCollection(COLLECTIONS.SESSIONS);
  if (!sessions) return;

  await sessions.updateOne(
    { _id: sessionId },
    { $set: { ...patch, updated_at: new Date().toISOString() } }
  );
};

/**
 * Delete a session and all its messages.
 * @param {string} sessionId
 */
const deleteSession = async (sessionId) => {
  const sessions  = getCollection(COLLECTIONS.SESSIONS);
  const messages  = getCollection(COLLECTIONS.MESSAGES);
  if (!sessions || !messages) return;

  // Delete all messages belonging to this session
  await messages.deleteMany({ session_id: sessionId });
  // Delete the session itself
  await sessions.deleteOne({ _id: sessionId });
  console.log(`[DB] 🗑️  Session deleted: ${sessionId}`);
};

// ─────────────────────────────────────────────
// Message Operations
// ─────────────────────────────────────────────

/**
 * Save a single message to the messages collection.
 * @param {string} sessionId - The session this message belongs to
 * @param {'user'|'assistant'} role - Who sent the message
 * @param {string} content - Message text
 * @param {string|null} model - AI model used (for assistant messages)
 * @returns {Object|null} The saved message document
 */
const saveMessage = async (sessionId, role, content, model = null) => {
  const messages = getCollection(COLLECTIONS.MESSAGES);
  if (!messages) return null;

  const now = new Date().toISOString();
  const message = {
    session_id: sessionId,
    bucket: getBucket(),          // 'YYYY-MM' — for partition management
    role,
    content,
    model,
    created_at: now,
  };

  const result = await messages.insertOne(message);
  return { ...message, _id: result.insertedId };
};

/**
 * Get all messages for a session (most recent first, then reversed for display).
 * @param {string} sessionId
 * @param {number} limit
 * @returns {Array} Messages in chronological order (oldest first)
 */
const getMessages = async (sessionId, limit = 100) => {
  const messages = getCollection(COLLECTIONS.MESSAGES);
  if (!messages) return [];

  const cursor = messages.find(
    { session_id: sessionId },
    {
      sort: { created_at: 1 }, // ascending — oldest first for chat display
      limit,
    }
  );

  return await cursor.toArray();
};

module.exports = {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  saveMessage,
  getMessages,
};
