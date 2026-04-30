import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../utils/cn";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group w-full py-6 flex sm:px-6 px-4 transition-colors",
        !isUser ? "bg-zinc-800/20" : ""
      )}
    >
      <div className={cn("max-w-3xl mx-auto flex w-full gap-4 sm:gap-6", isUser ? "flex-row-reverse" : "flex-row")}>
        
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border",
            isUser
              ? "bg-zinc-700 text-white border-zinc-600"
              : "bg-[#10a37f] text-white border-transparent shadow-sm"
          )}
        >
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>

        {/* Message Content */}
        <div className={cn(
          "flex-1 min-w-0 max-w-full text-zinc-200 leading-relaxed text-[15px]",
          isUser ? "text-right" : "text-left"
        )}>
          {isUser ? (
            <div className="inline-block px-5 py-3 rounded-2xl bg-[#2f2f2f] border border-[#2f2f2f]/50 shadow-sm text-left max-w-full overflow-hidden break-words">
              {message.content}
            </div>
          ) : (
            <div className="prose prose-invert prose-slate prose-pre:bg-[#212121] prose-pre:border prose-pre:border-zinc-800 prose-pre:shadow-inner max-w-none pt-1">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}