import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { Bot, ArrowRight } from "lucide-react";

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock Data for UI demonstration
  const [chats, setChats] = useState([
    { id: "1", title: "New Chat", messages: [] },
    { id: "2", title: "React Development Help", messages: [{ role: "user", content: "How do I use effects?" }] },
  ]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages]);

  const handleSendMessage = (content) => {
    const newMessage = { role: "user", content };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: chat.messages.length === 0 ? content.slice(0, 30) + "..." : chat.title,
              messages: [...chat.messages, newMessage],
            }
          : chat
      )
    );

    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const assistantMessage = {
        role: "assistant",
        content: `I received your message: "${content}". This is a simulated response generated using Markdown.\n\nHere is an example code block:\n\`\`\`javascript\nconsole.log("Hello World");\n\`\`\``,
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );
      setIsLoading(false);
    }, 1500);
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setChats([{ id: newChatId, title: "New Chat", messages: [] }, ...chats]);
    setActiveChatId(newChatId);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar 
          chats={chats} 
          activeChatId={activeChatId} 
          onSelectChat={(id) => {
            setActiveChatId(id);
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full relative z-0">
        {/* Header containing title and mobile menu toggle */}
        <ChatHeader 
          title={activeChat.title} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 fade-in">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-100 mb-3 tracking-tight">How can I help you today?</h2>
              <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                I am a powerful AI assistant ready to help with coding, writing, and problem-solving.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4 mb-10">
                {["Explain quantum computing", "Write a python script", "Help me debug a React error", "Generate a cover letter"].map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="flex justify-between items-center text-left px-5 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-500 rounded-xl text-sm text-slate-300 transition-all duration-200 group shadow-sm hover:shadow-md"
                  >
                    <span>{prompt}</span> 
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-8 min-h-full">
              {activeChat.messages.map((msg, index) => (
                <div key={index} className="animate-in fade-in duration-300">
                  <MessageBubble message={msg} />
                </div>
              ))}
              
              {isLoading && (
                <div className="py-6 px-4 animate-in fade-in duration-300 bg-slate-800/20 w-full flex">
                  <div className="max-w-3xl mx-auto flex w-full gap-4 sm:gap-6 flex-row">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border bg-gradient-to-br from-blue-600 to-blue-500 text-white border-blue-700">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-slate-200 items-center flex gap-1 h-8">
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible element to auto-scroll to */}
              <div ref={messagesEndRef} className="h-px bg-transparent" />
            </div>
          )}
        </div>

        {/* Fixed Input Area */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
