/**
 * Session Controller
 * Handles CRUD operations for chat sessions.
 */

const {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  getMessages,
} = require('../services/dbService');

/**
 * GET /api/sessions
 * Returns all sessions sorted by most recently updated.
 */
const listSessions = async (req, res) => {
  try {
    const sessions = await getSessions(50);
    res.json({ sessions });
  } catch (err) {
    console.error('[SessionController] listSessions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

/**
 * POST /api/sessions
 * Creates a new chat session.
 * Body: { title? }
 */
const createNewSession = async (req, res) => {
  try {
    const { title = 'New Chat' } = req.body;
    const session = await createSession(title);

    if (!session) {
      // DB offline — return a temporary in-memory session
      return res.json({
        session: {
          _id: `temp-${Date.now()}`,
          title,
          message_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          isTemporary: true,
        },
      });
    }

    res.status(201).json({ session });
  } catch (err) {
    console.error('[SessionController] createSession error:', err.message);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

/**
 * GET /api/sessions/:id/messages
 * Returns all messages for a specific session.
 */
const listMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await getMessages(id, 100);
    res.json({ messages });
  } catch (err) {
    console.error('[SessionController] listMessages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * PATCH /api/sessions/:id
 * Renames or updates a session.
 * Body: { title? }
 */
const patchSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    await updateSession(id, { title });
    res.json({ success: true });
  } catch (err) {
    console.error('[SessionController] patchSession error:', err.message);
    res.status(500).json({ error: 'Failed to update session' });
  }
};

/**
 * DELETE /api/sessions/:id
 * Deletes a session and all its messages.
 */
const removeSession = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSession(id);
    res.json({ success: true });
  } catch (err) {
    console.error('[SessionController] removeSession error:', err.message);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

module.exports = {
  listSessions,
  createNewSession,
  listMessages,
  patchSession,
  removeSession,
};
