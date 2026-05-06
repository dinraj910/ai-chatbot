import { useState, useCallback, useRef } from 'react';
import { sendMessage as sendMessageAPI } from '../services/api';

/**
 * Custom Hook: useChat
 * Manages chat state, message flow, and a chunk-based typewriter effect.
 * Now accepts a sessionId so the backend can persist messages to Astra DB.
 */

const CHUNK_SIZE  = 4;   // words revealed per tick
const INTERVAL_MS = 30;  // ms between ticks

const useChat = (sessionId = null) => {
  const [messages,    setMessages]    = useState([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error,       setError]       = useState(null);
  const streamTimerRef = useRef(null);

  /** Add a single message to the chat */
  const addMessage = useCallback((content, role) => {
    const newMessage = {
      id:        `${role}-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  /** Replace the last message content instantly (used for errors) */
  const updateLastMessage = useCallback((content) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], content };
      return updated;
    });
  }, []);

  /** Clear all messages (new chat / session switch) */
  const clearMessages = useCallback(() => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  /**
   * Hydrate messages from DB history (when switching sessions).
   * Converts DB message format → UI message format.
   * @param {Array} dbMessages - Array of message docs from Astra DB
   */
  const loadHistory = useCallback((dbMessages) => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    setIsStreaming(false);
    setError(null);

    const uiMessages = dbMessages.map((msg, index) => ({
      id:        msg._id || `history-${index}`,
      role:      msg.role,
      content:   msg.content,
      timestamp: msg.created_at || new Date().toISOString(),
    }));

    setMessages(uiMessages);
  }, []);

  /**
   * Chunk-based typewriter: reveal `fullText` in word-groups.
   * Resolves when the full text has been revealed.
   */
  const streamText = useCallback(
    (fullText) =>
      new Promise((resolve) => {
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);

        const tokens = fullText.split(/(\s+)/);
        let index = 0;
        setIsStreaming(true);

        streamTimerRef.current = setInterval(() => {
          index = Math.min(index + CHUNK_SIZE * 2, tokens.length);
          const partial  = tokens.slice(0, index).join('');
          const finished = index >= tokens.length;

          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content:   partial,
              streaming: !finished,
            };
            return updated;
          });

          if (finished) {
            clearInterval(streamTimerRef.current);
            setIsStreaming(false);
            resolve();
          }
        }, INTERVAL_MS);
      }),
    []
  );

  /**
   * Send a user message and stream the response.
   * Passes sessionId to the API so the backend saves to DB.
   */
  const sendUserMessage = useCallback(
    async (userInput) => {
      if (!userInput || typeof userInput !== 'string') { setError('Invalid message'); return; }
      const trimmedInput = userInput.trim();
      if (!trimmedInput) { setError('Message cannot be empty'); return; }

      setError(null);

      try {
        addMessage(trimmedInput, 'user');
        addMessage('', 'assistant'); // placeholder for loading dots
        setIsLoading(true);

        // Pass sessionId → backend saves both messages to Astra DB
        const reply = await sendMessageAPI(trimmedInput, sessionId);
        setIsLoading(false);

        await streamText(reply);
      } catch (err) {
        console.error('[useChat] Error:', err);
        const msg = err.message || 'Failed to get response. Please try again.';
        updateLastMessage(`⚠️ ${msg}`);
        setError(msg);
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [addMessage, updateLastMessage, streamText, sessionId]
  );

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendUserMessage,
    addMessage,
    updateLastMessage,
    clearMessages,
    loadHistory,
  };
};

export default useChat;
