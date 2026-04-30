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
    <div className="w-full p-4 pb-6 bg-gradient-to-t from-slate-900 to-transparent pt-10">
      <div className="max-w-3xl mx-auto relative group">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "relative flex items-end w-full px-4 py-3 bg-slate-800 border border-slate-700 shadow-xl rounded-2xl transition-all focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50",
            isLoading ? "opacity-70 pointer-events-none" : ""
          )}
        >
          <button
            type="button"
            className="p-2 mb-1 mr-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-700/50 focus:outline-none"
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
            className="flex-1 max-h-[200px] w-full resize-none bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none py-1.5 min-h-[24px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            rows={1}
            disabled={isLoading}
            autoFocus
          />

          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-2 mb-1 ml-2 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-3 font-medium">
          Assistant can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}