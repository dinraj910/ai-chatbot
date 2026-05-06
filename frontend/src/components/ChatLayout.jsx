import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import useChat from '../hooks/useChat';
import {
  getSessions,
  createSession,
  getSessionMessages,
  renameSession,
  deleteSession,
} from '../services/api';
import { Bot, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * ChatLayout — Root layout component.
 *
 * Session lifecycle (DB-backed):
 *   mount        → load sessions from Astra DB
 *   new chat     → POST /api/sessions → add to sidebar
 *   select chat  → GET /api/sessions/:id/messages → hydrate useChat
 *   send message → passes sessionId → backend saves to DB automatically
 *   delete chat  → DELETE /api/sessions/:id → remove from sidebar
 *   first msg    → auto-renames session in DB (title = first 35 chars of message)
 */
export default function ChatLayout() {
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [activeChatId,      setActiveChatId]       = useState(null);
  const [chats,             setChats]              = useState([]);
  const [isLoadingSessions, setIsLoadingSessions]  = useState(true);
  const [isLoadingHistory,  setIsLoadingHistory]   = useState(false);
  const [renamedSessions,   setRenamedSessions]    = useState(new Set()); // track auto-renamed

  // useChat receives the active sessionId so it can pass it to the API
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendUserMessage,
    clearMessages,
    loadHistory,
  } = useChat(activeChatId);

  const messagesEndRef      = useRef(null);
  const scrollContainerRef  = useRef(null);
  const isNearBottomRef     = useRef(true);

  // ── Scroll management ────────────────────────────────────────────────────────
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = dist < 120;
  };

  const scrollToBottom = () => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // ── Load sessions on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const sessions = await getSessions();
        setChats(sessions);
        // Auto-select the most recent session (sessions are sorted newest-first)
        if (sessions.length > 0) {
          const first = sessions[0];
          setActiveChatId(first._id || first.id);
          await hydrateSession(first._id || first.id);
        }
      } catch (err) {
        console.error('[ChatLayout] Failed to load sessions:', err.message);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Hydrate messages for a session ──────────────────────────────────────────
  const hydrateSession = useCallback(async (sessionId) => {
    setIsLoadingHistory(true);
    clearMessages();
    try {
      const dbMessages = await getSessionMessages(sessionId);
      if (dbMessages.length > 0) {
        loadHistory(dbMessages);
      }
    } catch (err) {
      console.error('[ChatLayout] Failed to load history:', err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [clearMessages, loadHistory]);

  // ── New Chat ─────────────────────────────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const session = await createSession('New Chat');
      const sessionId = session._id || session.id;

      setChats((prev) => [session, ...prev]);
      setActiveChatId(sessionId);
      clearMessages();

      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (err) {
      console.error('[ChatLayout] Failed to create session:', err.message);
      // Fallback: local-only session
      const localId = `local-${Date.now()}`;
      setChats((prev) => [
        { _id: localId, id: localId, title: 'New Chat', message_count: 0 },
        ...prev,
      ]);
      setActiveChatId(localId);
      clearMessages();
    }
  };

  // ── Select existing chat ─────────────────────────────────────────────────────
  const handleSelectChat = async (id) => {
    if (id === activeChatId) return; // already active
    setActiveChatId(id);
    await hydrateSession(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // ── Delete chat ──────────────────────────────────────────────────────────────
  const handleDeleteChat = async (id) => {
    try {
      await deleteSession(id);
    } catch (err) {
      console.error('[ChatLayout] Failed to delete session:', err.message);
    }

    setChats((prev) => prev.filter((c) => (c._id || c.id) !== id));

    // If we deleted the active chat, switch to the next one
    if (id === activeChatId) {
      const remaining = chats.filter((c) => (c._id || c.id) !== id);
      if (remaining.length > 0) {
        const nextId = remaining[0]._id || remaining[0].id;
        setActiveChatId(nextId);
        await hydrateSession(nextId);
      } else {
        setActiveChatId(null);
        clearMessages();
      }
    }
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSendMessage = async (content) => {
    if (isLoading || isStreaming) return;

    // If no active session yet, create one first
    let currentSessionId = activeChatId;
    if (!currentSessionId) {
      try {
        const session = await createSession('New Chat');
        currentSessionId = session._id || session.id;
        setChats((prev) => [session, ...prev]);
        setActiveChatId(currentSessionId);
      } catch (err) {
        console.error('[ChatLayout] Could not create session before sending:', err.message);
      }
    }

    // Auto-rename session on the very first message (once per session)
    const isFirstMessage = messages.length === 0;
    if (isFirstMessage && currentSessionId && !renamedSessions.has(currentSessionId)) {
      const autoTitle = content.slice(0, 35) + (content.length > 35 ? '...' : '');
      setRenamedSessions((prev) => new Set(prev).add(currentSessionId));
      setChats((prev) =>
        prev.map((c) =>
          (c._id || c.id) === currentSessionId ? { ...c, title: autoTitle } : c
        )
      );
      renameSession(currentSessionId, autoTitle).catch(() => {});
    }

    isNearBottomRef.current = true;
    await sendUserMessage(content);
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const activeChat = chats.find(
    (c) => (c._id || c.id) === activeChatId
  );

  return (
    <div className="flex h-screen bg-[#212121] text-zinc-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#212121]/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isLoadingSessions={isLoadingSessions}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full relative z-0">
        {/* Header */}
        <ChatHeader
          title={activeChat?.title || 'New Chat'}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Messages Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          {/* Loading history spinner */}
          {isLoadingHistory && (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-zinc-500">
                <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                <span className="text-sm">Loading conversation...</span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoadingHistory && messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 fade-in">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-zinc-900 mb-6 ring-1 ring-zinc-200">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-100 mb-3 tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed">
                I'm a powerful AI assistant ready to help with coding, writing, and problem-solving.
              </p>

              {/* Quick prompt suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4 mb-10">
                {[
                  'Explain quantum computing',
                  'Write a python script',
                  'Help me debug a React error',
                  'Generate a cover letter',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="flex justify-between items-center text-left px-5 py-4 bg-zinc-800/50 hover:bg-[#2f2f2f] border border-[#2f2f2f]/50 hover:border-zinc-500 rounded-xl text-sm text-zinc-300 transition-all duration-200 group shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {!isLoadingHistory && messages.length > 0 && (
            <div className="pb-8 min-h-full">
              {/* Error banner */}
              {error && (
                <div className="mx-4 mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Error</p>
                    <p className="text-xs text-red-200 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg) => (
                <div key={msg.id} className="animate-in fade-in duration-300">
                  <MessageBubble message={msg} />
                </div>
              ))}

              {/* Loading indicator (AI thinking) */}
              {isLoading && (
                <div className="py-6 px-4 animate-in fade-in duration-300 bg-zinc-800/20 w-full flex">
                  <div className="max-w-3xl mx-auto flex w-full gap-4 sm:gap-6 flex-row">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border bg-[#10a37f] text-white border-transparent">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-zinc-200 items-center flex gap-1 h-8">
                      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} className="h-px bg-transparent" />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading || isStreaming}
        />
      </div>
    </div>
  );
}
