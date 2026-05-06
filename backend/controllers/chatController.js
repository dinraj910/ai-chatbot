/**
 * Chat Controller
 * API Gateway between frontend and AI service.
 * Now saves every message pair to Astra DB for persistence.
 */

const axios = require('axios');
const { saveMessage, updateSession } = require('../services/dbService');

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Create axios instance for AI service communication
const aiServiceClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
aiServiceClient.interceptors.request.use(
  (config) => {
    console.log(`[Gateway] → [AI Service] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Gateway] Request to AI Service failed:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
aiServiceClient.interceptors.response.use(
  (response) => {
    console.log(`[Gateway] ← [AI Service] ${response.status} (${response.statusText})`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[Gateway] AI Service error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      console.error('[Gateway] No response from AI Service');
    } else {
      console.error('[Gateway] Error configuring request:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * POST /api/chat
 * Forward message to AI service, save both messages to DB, return reply.
 *
 * Body: { message: string, sessionId?: string, model?: string }
 */
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId, model } = req.body;

    // ── Input validation ──────────────────────────────────────────────
    if (!message || typeof message !== 'string') {
      console.warn('[Gateway] Invalid message format received');
      return res.status(400).json({
        error: 'Invalid request. "message" field is required and must be a string.',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      console.warn('[Gateway] Empty message received');
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    console.log(`[Gateway] Received message: "${trimmedMessage.substring(0, 50)}..."`);

    // ── Save user message to DB (non-blocking) ────────────────────────
    if (sessionId) {
      saveMessage(sessionId, 'user', trimmedMessage, null).catch((err) =>
        console.error('[Gateway] Failed to save user message:', err.message)
      );
    }

    // ── Forward to AI service ─────────────────────────────────────────
    console.log(`[Gateway] Forwarding to AI Service at ${AI_SERVICE_URL}/chat`);
    const aiResponse = await aiServiceClient.post('/chat', { message: trimmedMessage });
    const { reply } = aiResponse.data;

    if (!reply) {
      throw new Error('Invalid response format from AI Service: missing "reply" field');
    }

    // ── Save assistant reply + update session ─────────────────────────
    if (sessionId) {
      const modelUsed = aiResponse.data.model || model || null;

      saveMessage(sessionId, 'assistant', reply, modelUsed).catch((err) =>
        console.error('[Gateway] Failed to save assistant message:', err.message)
      );

      updateSession(sessionId, {
        model_used: modelUsed,
        // message_count incremented by 2 (user + assistant)
      }).catch((err) =>
        console.error('[Gateway] Failed to update session:', err.message)
      );
    }

    console.log(`[Gateway] Reply ready: "${reply.substring(0, 50)}..."`);

    // ── Respond to frontend ───────────────────────────────────────────
    res.json({
      reply,
      timestamp: new Date().toISOString(),
      source: 'ai-service',
    });

  } catch (error) {
    // Handle different error types
    if (error.response) {
      console.error(`[Gateway] AI Service error: ${error.response.status}`, error.response.data);
      return res.status(error.response.status || 500).json({
        error: error.response.data?.detail || 'AI service processing failed',
        source: 'ai-service',
      });
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[Gateway] Cannot connect to AI Service');
      return res.status(503).json({
        error: 'AI service is unavailable. Please ensure the FastAPI service is running on port 8000.',
        source: 'gateway',
      });
    } else if (error.code === 'ENOTFOUND') {
      console.error('[Gateway] AI Service host not found:', error.message);
      return res.status(503).json({
        error: 'Cannot reach AI service. Check your network configuration.',
        source: 'gateway',
      });
    } else if (error.code === 'ETIMEDOUT') {
      console.error('[Gateway] Request to AI Service timed out');
      return res.status(504).json({
        error: 'AI service took too long to respond. Please try again.',
        source: 'gateway',
      });
    } else {
      console.error('[Gateway] Unexpected error:', error.message);
      return res.status(500).json({
        error: 'Failed to process your message. Please try again.',
        source: 'gateway',
      });
    }
  }
};

module.exports = { sendMessage };
