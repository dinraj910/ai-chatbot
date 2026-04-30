/**
 * Chat Controller
 * API Gateway between frontend and AI service
 * Handles request validation and forwarding to FastAPI service
 */

const axios = require('axios');

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const CHAT_ENDPOINT = `${AI_SERVICE_URL}/chat`;

// Create axios instance for AI service communication
const aiServiceClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
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
 * Forward message to AI service and return response
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with reply
 */
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Input validation
    if (!message || typeof message !== 'string') {
      console.warn('[Gateway] Invalid message format received');
      return res.status(400).json({
        error: 'Invalid request. "message" field is required and must be a string.',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      console.warn('[Gateway] Empty message received');
      return res.status(400).json({
        error: 'Message cannot be empty.',
      });
    }

    // Log incoming message
    console.log(`[Gateway] Received message from frontend: "${trimmedMessage.substring(0, 50)}..."`);

    // Call AI service
    console.log(`[Gateway] Forwarding to AI Service at ${CHAT_ENDPOINT}`);
    
    const aiResponse = await aiServiceClient.post('/chat', {
      message: trimmedMessage,
    });

    // Extract reply from AI service response
    const { reply } = aiResponse.data;

    if (!reply) {
      throw new Error('Invalid response format from AI Service: missing "reply" field');
    }

    // Log successful response
    console.log(`[Gateway] Successfully processed message, returning reply: "${reply.substring(0, 50)}..."`);

    // Return response to frontend
    res.json({
      reply,
      timestamp: new Date().toISOString(),
      source: 'ai-service',
    });

  } catch (error) {
    // Handle different error types
    if (error.response) {
      // AI Service returned an error response
      console.error(`[Gateway] AI Service error: ${error.response.status}`, error.response.data);
      
      return res.status(error.response.status || 500).json({
        error: error.response.data?.detail || 'AI service processing failed',
        source: 'ai-service',
      });

    } else if (error.code === 'ECONNREFUSED') {
      // AI Service is not running
      console.error('[Gateway] Cannot connect to AI Service - is it running on port 8000?');
      
      return res.status(503).json({
        error: 'AI service is unavailable. Please ensure the FastAPI service is running on port 8000.',
        source: 'gateway',
      });

    } else if (error.code === 'ENOTFOUND') {
      // AI Service host not found
      console.error('[Gateway] AI Service host not found:', error.message);
      
      return res.status(503).json({
        error: 'Cannot reach AI service. Check your network configuration.',
        source: 'gateway',
      });

    } else if (error.code === 'ETIMEDOUT') {
      // Request timeout
      console.error('[Gateway] Request to AI Service timed out');
      
      return res.status(504).json({
        error: 'AI service took too long to respond. Please try again.',
        source: 'gateway',
      });

    } else {
      // Generic error
      console.error('[Gateway] Unexpected error:', error.message);
      
      return res.status(500).json({
        error: 'Failed to process your message. Please try again.',
        source: 'gateway',
      });
    }
  }
};

module.exports = {
  sendMessage,
};
