import { PenSquare, MessageSquare, Settings, User } from "lucide-react";
import { cn } from "../utils/cn";

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat }) {
  return (
    <div className="w-[260px] flex-shrink-0 bg-[#212121] flex flex-col h-full border-r border-zinc-800 transition-all duration-300">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-zinc-200 bg-[#212121] border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600"
        >
          <PenSquare className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        <div className="text-xs font-semibold text-zinc-500 mb-3 px-3 uppercase tracking-wider">
          History
        </div>
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm text-left truncate rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600",
              activeChatId === chat.id
                ? "bg-zinc-800 text-zinc-100 font-medium"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            )}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{chat.title}</span>
          </button>
        ))}
      </div>

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