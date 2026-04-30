import { PenSquare, MessageSquare, Settings, User } from "lucide-react";
import { cn } from "../utils/cn";

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat }) {
  return (
    <div className="w-[260px] flex-shrink-0 bg-slate-950 flex flex-col h-full border-r border-slate-800 transition-all duration-300">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <PenSquare className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        <div className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wider">
          History
        </div>
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm text-left truncate rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600",
              activeChatId === chat.id
                ? "bg-slate-800 text-slate-100 font-medium"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{chat.title}</span>
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600">
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <span className="font-medium truncate">My Account</span>
          <Settings className="w-4 h-4 ml-auto text-slate-500" />
        </button>
      </div>
    </div>
  );
}