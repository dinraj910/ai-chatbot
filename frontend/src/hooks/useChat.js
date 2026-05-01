import { useState, useCallback, useRef } from 'react';
import { sendMessage as sendMessageAPI } from '../services/api';

/**
 * Custom Hook: useChat
 * Manages chat state, message flow, and a fast chunk-based typewriter effect.
 *
 * Streaming strategy:
 *   - Split the full reply into word-sized tokens
 *   - Reveal CHUNK_SIZE tokens every INTERVAL_MS
 *   - This gives ~300-500 chars/sec which feels snappy without looking instant
 */

const CHUNK_SIZE   = 4;   // words revealed per tick
const INTERVAL_MS  = 30;  // ms between ticks

const useChat = () => {
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

  /** Clear all messages (new chat) */
  const clearMessages = useCallback(() => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  /**
   * Chunk-based typewriter: reveal `fullText` in word-groups.
   * Resolves when complete so the caller can await it.
   */
  const streamText = useCallback(
    (fullText) =>
      new Promise((resolve) => {
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);

        // Split preserving whitespace so the reconstructed string is identical
        const tokens = fullText.split(/(\s+)/);
        let index = 0;
        setIsStreaming(true);

        streamTimerRef.current = setInterval(() => {
          index = Math.min(index + CHUNK_SIZE * 2, tokens.length); // *2 because whitespace tokens
          const partial   = tokens.slice(0, index).join('');
          const finished  = index >= tokens.length;

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
   * While isLoading OR isStreaming the caller should block further input.
   */
  const sendUserMessage = useCallback(
    async (userInput) => {
      if (!userInput || typeof userInput !== 'string') { setError('Invalid message'); return; }
      const trimmedInput = userInput.trim();
      if (!trimmedInput) { setError('Message cannot be empty'); return; }

      setError(null);

      try {
        addMessage(trimmedInput, 'user');
        addMessage('', 'assistant');   // empty placeholder — loading dots show via isLoading
        setIsLoading(true);

        const reply = await sendMessageAPI(trimmedInput);
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
    [addMessage, updateLastMessage, streamText]
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
  };
};

export default useChat;
