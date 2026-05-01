import { useState, useCallback } from "react";
import { Bot, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "../utils/cn";

/* ─── Copy button shared component ──────────────────────────────── */
function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback for non-secure contexts */
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy"}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200",
        "bg-zinc-700/60 hover:bg-zinc-600 border border-zinc-600/50 hover:border-zinc-500",
        copied
          ? "text-emerald-400 border-emerald-500/40 bg-emerald-900/20"
          : "text-zinc-400 hover:text-zinc-200",
        className
      )}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ─── Code block with syntax highlight + copy ───────────────────── */
function CodeBlock({ language, children }) {
  const code = String(children).replace(/\n$/, "");

  return (
    <div className="relative group/code my-4 rounded-xl overflow-hidden border border-zinc-700/60 shadow-lg shadow-black/30">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          {language && (
            <span className="ml-2 text-xs font-mono font-semibold text-violet-400 uppercase tracking-wider">
              {language}
            </span>
          )}
        </div>
        <CopyButton text={code} />
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "#0d0d1a",
          fontSize: "0.82rem",
          lineHeight: "1.65",
          padding: "1.1rem 1.25rem",
        }}
        showLineNumbers={code.split("\n").length > 4}
        lineNumberStyle={{
          color: "#4b5563",
          minWidth: "2.2em",
          paddingRight: "1em",
          userSelect: "none",
        }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/* ─── Inline code ────────────────────────────────────────────────── */
function InlineCode({ children }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-violet-300 font-mono text-[0.83em]">
      {children}
    </code>
  );
}

/* ─── Blinking cursor shown while streaming ──────────────────────── */
function Cursor() {
  return (
    <span className="inline-block w-[2px] h-[1em] ml-0.5 bg-zinc-300 align-middle animate-[blink_0.9s_step-end_infinite]" />
  );
}

/* ─── Main MessageBubble ─────────────────────────────────────────── */
export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group w-full py-5 flex sm:px-6 px-4 transition-colors",
        !isUser ? "bg-zinc-800/20" : ""
      )}
    >
      <div
        className={cn(
          "max-w-3xl mx-auto flex w-full gap-4 sm:gap-6",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border mt-0.5",
            isUser
              ? "bg-zinc-700 text-white border-zinc-600"
              : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-transparent shadow-sm"
          )}
        >
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>

        {/* Content wrapper */}
        <div
          className={cn(
            "flex-1 min-w-0 max-w-full",
            isUser ? "text-right" : "text-left"
          )}
        >
          {isUser ? (
            /* ── User bubble ── */
            <div className="relative inline-block group/user max-w-full">
              <div className="px-5 py-3 rounded-2xl bg-[#2f2f2f] border border-[#3a3a3a] shadow-sm text-left text-zinc-200 leading-relaxed text-[15px] break-words">
                {message.content}
              </div>
              {/* Copy for user message — appears on hover */}
              <div className="absolute -bottom-7 right-0 opacity-0 group-hover/user:opacity-100 transition-opacity duration-200 z-10">
                <CopyButton text={message.content} />
              </div>
            </div>
          ) : (
            /* ── Assistant bubble ── */
            <div className="relative group/assistant">
              {/* Prose markdown body */}
              <div className="prose prose-invert prose-zinc max-w-none text-[15px] leading-relaxed">
                <ReactMarkdown
                  components={{
                    /* Code blocks */
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline ? (
                        <CodeBlock language={match?.[1]}>{children}</CodeBlock>
                      ) : (
                        <InlineCode>{children}</InlineCode>
                      );
                    },
                    /* Paragraphs — tight spacing */
                    p({ children }) {
                      return (
                        <p className="mb-3 last:mb-0 text-zinc-200">{children}</p>
                      );
                    },
                    /* Blockquote */
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-violet-500/60 pl-4 text-zinc-400 italic my-3">
                          {children}
                        </blockquote>
                      );
                    },
                    /* Lists */
                    ul({ children }) {
                      return (
                        <ul className="list-disc list-outside pl-5 space-y-1 text-zinc-200 my-2">
                          {children}
                        </ul>
                      );
                    },
                    ol({ children }) {
                      return (
                        <ol className="list-decimal list-outside pl-5 space-y-1 text-zinc-200 my-2">
                          {children}
                        </ol>
                      );
                    },
                    /* Headings */
                    h1({ children }) {
                      return <h1 className="text-xl font-bold text-zinc-100 mt-4 mb-2">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-lg font-semibold text-zinc-100 mt-3 mb-2">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-base font-semibold text-zinc-200 mt-3 mb-1">{children}</h3>;
                    },
                    /* Horizontal rule */
                    hr() {
                      return <hr className="border-zinc-700 my-4" />;
                    },
                    /* Strong */
                    strong({ children }) {
                      return <strong className="font-semibold text-zinc-100">{children}</strong>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {/* Blinking cursor while streaming */}
                {message.streaming && <Cursor />}
              </div>

              {/* Copy full response — appears on hover */}
              {!message.streaming && message.content && (
                <div className="mt-2 opacity-0 group-hover/assistant:opacity-100 transition-opacity duration-200">
                  <CopyButton text={message.content} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}