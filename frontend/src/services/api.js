import axios from 'axios';

/**
 * API Service Layer
 * Handles all communication with the Node.js backend.
 * Includes both chat and session management endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('[API] Base URL configured:', API_BASE_URL);

// ─── Axios Instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response logging + error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[API Error]', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API Error] No response from server');
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// ─── Chat ──────────────────────────────────────────────────────────────────────

/**
 * Send a message to the AI and get a reply.
 * @param {string} message
 * @param {string|null} sessionId  — DB session to save messages into
 * @returns {Promise<string>} The assistant's reply text
 */
const sendMessage = async (message, sessionId = null) => {
  try {
    const response = await apiClient.post('/chat', { message, sessionId });
    const { reply } = response.data;
    if (!reply) throw new Error('Invalid response format from server');
    return reply;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid message format');
    } else if (error.response?.status === 503) {
      throw new Error('AI service is unavailable. Please make sure it is running.');
    } else if (error.response?.status === 500) {
      throw new Error(error.response.data.error || 'Server error. Please try again.');
    } else if (error.request && !error.response) {
      throw new Error('Unable to connect to server. Please check your connection.');
    } else {
      throw new Error(error.message || 'Failed to send message');
    }
  }
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

/**
 * Fetch all chat sessions (for sidebar).
 * @returns {Promise<Array>}
 */
const getSessions = async () => {
  try {
    const response = await apiClient.get('/sessions');
    return response.data.sessions || [];
  } catch (error) {
    console.error('[API] getSessions failed:', error.message);
    return []; // graceful fallback
  }
};

/**
 * Create a new chat session in the DB.
 * @param {string} title
 * @returns {Promise<Object>} The new session document
 */
const createSession = async (title = 'New Chat') => {
  const response = await apiClient.post('/sessions', { title });
  return response.data.session;
};

/**
 * Load all messages for a specific session.
 * @param {string} sessionId
 * @returns {Promise<Array>}
 */
const getSessionMessages = async (sessionId) => {
  try {
    const response = await apiClient.get(`/sessions/${sessionId}/messages`);
    return response.data.messages || [];
  } catch (error) {
    console.error('[API] getSessionMessages failed:', error.message);
    return [];
  }
};

/**
 * Rename a session.
 * @param {string} sessionId
 * @param {string} title
 */
const renameSession = async (sessionId, title) => {
  try {
    await apiClient.patch(`/sessions/${sessionId}`, { title });
  } catch (error) {
    console.error('[API] renameSession failed:', error.message);
  }
};

/**
 * Delete a session and all its messages.
 * @param {string} sessionId
 */
const deleteSession = async (sessionId) => {
  await apiClient.delete(`/sessions/${sessionId}`);
};

export {
  apiClient,
  sendMessage,
  getSessions,
  createSession,
  getSessionMessages,
  renameSession,
  deleteSession,
};
