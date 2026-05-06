import { useState } from 'react';
import { PenSquare, MessageSquare, Settings, User, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Sidebar Component
 * Displays the list of chat sessions loaded from Astra DB.
 * Supports: new chat, session switching, delete, loading state.
 */
export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isLoadingSessions,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [hoveredId, setHoveredId]   = useState(null);

  const handleDelete = async (e, chatId) => {
    e.stopPropagation(); // don't trigger onSelectChat
    if (deletingId) return;
    setDeletingId(chatId);
    try {
      await onDeleteChat(chatId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-[260px] flex-shrink-0 bg-[#171717] flex flex-col h-full border-r border-zinc-800 transition-all duration-300">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          id="new-chat-btn"
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-zinc-200 bg-[#212121] border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-zinc-600"
        >
          <PenSquare className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        <div className="text-xs font-semibold text-zinc-500 mb-3 px-3 uppercase tracking-wider">
          History
        </div>

        {/* Loading Skeletons */}
        {isLoadingSessions && (
          <div className="space-y-2 px-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 rounded-lg bg-zinc-800/50 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingSessions && chats.length === 0 && (
          <p className="text-xs text-zinc-600 px-3 py-2">No conversations yet.</p>
        )}

        {/* Session Items */}
        {!isLoadingSessions &&
          chats.map((chat) => (
            <div
              key={chat._id || chat.id}
              className="relative group"
              onMouseEnter={() => setHoveredId(chat._id || chat.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={() => onSelectChat(chat._id || chat.id)}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600 pr-8',
                  activeChatId === (chat._id || chat.id)
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                )}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{chat.title || 'New Chat'}</span>
              </button>

              {/* Delete Button — revealed on hover */}
              {(hoveredId === (chat._id || chat.id) || deletingId === (chat._id || chat.id)) && (
                <button
                  onClick={(e) => handleDelete(e, chat._id || chat.id)}
                  disabled={!!deletingId}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  title="Delete chat"
                >
                  {deletingId === (chat._id || chat.id) ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600">
          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-zinc-300" />
          </div>
          <span className="font-medium truncate">My Account</span>
          <Settings className="w-4 h-4 ml-auto text-zinc-500" />
        </button>
      </div>
    </div>
  );
}