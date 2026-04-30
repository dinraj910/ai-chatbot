import { useState, useCallback } from 'react';
import { sendMessage as sendMessageAPI } from '../services/api';

/**
 * Custom Hook: useChat
 * Manages chat state and message flow
 * Abstracts API communication from components
 */

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Add a single message to the chat
   * @param {string} content - Message content
   * @param {string} role - 'user' or 'assistant'
   */
  const addMessage = useCallback((content, role) => {
    const newMessage = {
      id: `${role}-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  /**
   * Update the last message (used for replacing loading state with real response)
   * @param {string} content - New message content
   */
  const updateLastMessage = useCallback((content) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;

      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content,
      };
      return updated;
    });
  }, []);

  /**
   * Clear all messages (for new chat)
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Send a user message and handle the response
   * Flow:
   * 1. Add user message immediately to UI
   * 2. Add temporary assistant message (loading)
   * 3. Call backend API
   * 4. Replace loading message with real response or error
   *
   * @param {string} userInput - The user's message
   */
  const sendUserMessage = useCallback(
    async (userInput) => {
      // Validate input
      if (!userInput || typeof userInput !== 'string') {
        setError('Invalid message');
        return;
      }

      const trimmedInput = userInput.trim();
      if (trimmedInput.length === 0) {
        setError('Message cannot be empty');
        return;
      }

      // Clear previous errors
      setError(null);

      try {
        // Step 1: Add user message immediately (instant UI feedback)
        addMessage(trimmedInput, 'user');

        // Step 2: Add loading placeholder
        addMessage('...', 'assistant');

        // Step 3: Set loading state
        setIsLoading(true);

        // Step 4: Call backend API
        const reply = await sendMessageAPI(trimmedInput);

        // Step 5: Replace loading message with real response
        updateLastMessage(reply);

        setIsLoading(false);
      } catch (err) {
        console.error('[useChat] Error:', err);

        // Replace loading message with error message
        const errorMessage = err.message || 'Failed to get response. Please try again.';
        updateLastMessage(`Error: ${errorMessage}`);

        setError(errorMessage);
        setIsLoading(false);
      }
    },
    [addMessage, updateLastMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sendUserMessage,
    addMessage,
    updateLastMessage,
    clearMessages,
  };
};

export default useChat;
