import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import useChat from "../hooks/useChat";
import { Bot, ArrowRight, AlertCircle } from "lucide-react";

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState("1");
  
  // Use the custom hook for chat management
  const {
    messages,
    isLoading,
    error,
    sendUserMessage,
    clearMessages,
  } = useChat();
  
  // Chat history management (for sidebar)
  const [chats, setChats] = useState([
    { id: "1", title: "New Chat", messagesCount: 0 },
  ]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (content) => {
    // Update chat title if this is the first message
    if (messages.length === 0) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, title: content.slice(0, 30) + "..." }
            : chat
        )
      );
    }

    // Send message via the hook (which handles all the API logic)
    await sendUserMessage(content);

    // Update message count in sidebar
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messagesCount: messages.length + 2 } // +2 for user + assistant
          : chat
      )
    );
  };

  // Create a new chat
  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setChats([{ id: newChatId, title: "New Chat", messagesCount: 0 }, ...chats]);
    setActiveChatId(newChatId);
    clearMessages();
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Switch between chats
  const handleSelectChat = (id) => {
    setActiveChatId(id);
    clearMessages(); // In a real app, you'd load the chat history
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#212121] text-zinc-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#212121]/80 z-40 lg:hidden backdrop-blur-sm"
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
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full relative z-0">
        {/* Header */}
        <ChatHeader 
          title={activeChat.title} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {messages.length === 0 ? (
            /* Empty State */
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
                  "Explain quantum computing",
                  "Write a python script",
                  "Help me debug a React error",
                  "Generate a cover letter"
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
          ) : (
            /* Messages */
            <div className="pb-8 min-h-full">
              {/* Error message if API call fails */}
              {error && (
                <div className="mx-4 mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Error</p>
                    <p className="text-xs text-red-200 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Display all messages */}
              {messages.map((msg) => (
                <div key={msg.id} className="animate-in fade-in duration-300">
                  <MessageBubble message={msg} />
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="py-6 px-4 animate-in fade-in duration-300 bg-zinc-800/20 w-full flex">
                  <div className="max-w-3xl mx-auto flex w-full gap-4 sm:gap-6 flex-row">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border bg-[#10a37f] text-white border-transparent">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-zinc-200 items-center flex gap-1 h-8">
                      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"></div>
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
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
