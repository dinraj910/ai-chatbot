const express = require('express');
const {
  listSessions,
  createNewSession,
  listMessages,
  patchSession,
  removeSession,
} = require('../controllers/sessionController');

const router = express.Router();

// GET  /api/sessions         → list all sessions (sidebar)
router.get('/sessions', listSessions);

// POST /api/sessions         → create new session
router.post('/sessions', createNewSession);

// GET  /api/sessions/:id/messages → load message history for a session
router.get('/sessions/:id/messages', listMessages);

// PATCH /api/sessions/:id    → rename a session
router.patch('/sessions/:id', patchSession);

// DELETE /api/sessions/:id   → delete session + all its messages
router.delete('/sessions/:id', removeSession);

module.exports = router;
