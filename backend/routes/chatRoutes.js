const chatController = require('../controllers/chatController');
const express = require('express');

const router = express.Router();

// POST /api/chat — Send message and get AI response
// Body: { message: string, sessionId?: string, model?: string }
router.post('/chat', chatController.sendMessage);

module.exports = router;