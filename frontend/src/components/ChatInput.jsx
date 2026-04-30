import { ArrowUp, Play, Paperclip, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../utils/cn";

export default function ChatInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full p-4 pb-6 bg-gradient-to-t from-[#212121] to-transparent pt-10">
      <div className="max-w-3xl mx-auto relative group">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "relative flex items-end w-full px-4 py-3 bg-[#2f2f2f] border border-[#2f2f2f] shadow-xl rounded-2xl transition-all focus-within:ring-2 focus-within:ring-zinc-400 focus-within:border-zinc-400",
            isLoading ? "opacity-70 pointer-events-none" : ""
          )}
        >
          <button
            type="button"
            className="p-2 mb-1 mr-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-700/50 focus:outline-none"
            title="Attach file (coming soon)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Assistant..."
            className="flex-1 max-h-[200px] w-full resize-none bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none py-1.5 min-h-[24px] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
            rows={1}
            disabled={isLoading}
            autoFocus
          />

          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-2 mb-1 ml-2 flex items-center justify-center bg-white text-black rounded-full hover:opacity-80 transition-opacity disabled:bg-zinc-700 disabled:text-zinc-500 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-zinc-500 mt-3 font-medium">
          Assistant can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}