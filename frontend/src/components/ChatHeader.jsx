import { Sparkles, Menu } from "lucide-react";

export default function ChatHeader({ title, toggleSidebar }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-medium text-slate-200">{title}</h1>
      </div>
      
      <div className="flex items-center">
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          <Sparkles className="w-3 h-3" />
          <span>Model: GPT-4</span>
        </button>
      </div>
    </div>
  );
}