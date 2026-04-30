import axios from 'axios';

/**
 * API Service Layer
 * Handles all communication with the backend
 * Centralized configuration for base URL, headers, interceptors, etc.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('[API Response Error]', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('[API Request Error] No response from server', error.request);
    } else {
      // Error in request setup
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Send a message to the chat API
 * @param {string} message - The user's message
 * @returns {Promise<string>} - The assistant's reply
 * @throws {Error} - If the request fails
 */
const sendMessage = async (message) => {
  try {
    const response = await apiClient.post('/chat', {
      message,
    });

    // Extract reply from response
    const { reply } = response.data;

    if (!reply) {
      throw new Error('Invalid response format from server');
    }

    return reply;
  } catch (error) {
    // Re-throw with user-friendly message
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid message format');
    } else if (error.response?.status === 500) {
      throw new Error(error.response.data.error || 'Server error. Please try again.');
    } else if (error.request && !error.response) {
      throw new Error('Unable to connect to server. Please check your connection.');
    } else {
      throw new Error(error.message || 'Failed to send message');
    }
  }
};

export { apiClient, sendMessage };
