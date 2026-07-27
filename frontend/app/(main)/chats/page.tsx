"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Send, Copy, Bookmark, MoreHorizontal,
  ChevronLeft, AlertCircle, Sparkles
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { sendChatMessage } from "@/lib/api";

// ── Avatar Helper ─────────────────────────────────────────────────────────────

function MentorAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const colors = [
    "from-blue-500 to-purple-600",
    "from-emerald-500 to-cyan-600",
    "from-orange-500 to-pink-600",
    "from-violet-500 to-indigo-600",
    "from-rose-500 to-red-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const cls = {
    sm: "w-8 h-8 text-xs rounded-full",
    md: "w-12 h-12 text-base rounded-2xl",
    lg: "w-16 h-16 text-xl rounded-2xl",
  }[size];

  return (
    <div className={`${cls} bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[85%]">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Code Block ────────────────────────────────────────────────────────────────

function renderContent(text: string) {
  // Split on ```code blocks``` and render them with styling
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const lines = part.slice(3, -3).split("\n");
      const lang = lines[0].trim();
      const code = lines.slice(1).join("\n");
      return (
        <div key={i} className="rounded-xl overflow-hidden bg-[#09090B] border border-white/10 my-3">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
            <span className="text-xs font-mono text-muted-foreground">{lang || "code"}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-muted-foreground hover:text-white transition-colors"
              title="Copy code"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-sm font-mono text-emerald-400 whitespace-pre-wrap">
            {code}
          </pre>
        </div>
      );
    }
    // Regular text — split on newlines for paragraphs
    return (
      <span key={i}>
        {part.split("\n").map((line, j) => (
          <span key={j}>
            {line}
            {j < part.split("\n").length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

// ── Suggested Questions ───────────────────────────────────────────────────────

function getSuggestedQuestions(expertise: string[]) {
  const area = expertise[0] ?? "your field";
  return [
    `What's the most important concept in ${area} I should master first?`,
    `Can you recommend a learning roadmap for someone at my level?`,
    `What mistakes do beginners make in ${area}?`,
  ];
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const router = useRouter();
  const selectedMentor = useAppStore((s) => s.selectedMentor);
  const chatHistory = useAppStore((s) => s.chatHistory);
  const addMessage = useAppStore((s) => s.addMessage);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Guard: redirect if no mentor selected
  useEffect(() => {
    if (!selectedMentor) router.replace("/recommendation");
  }, [selectedMentor, router]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [input]);

  if (!selectedMentor) return null;

  const suggested = getSuggestedQuestions(selectedMentor.expertise_areas);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setInput("");
    setError(null);
    addMessage({ role: "user", content: trimmed });
    setIsTyping(true);

    try {
      const historyForApi = chatHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await sendChatMessage(selectedMentor.id, trimmed, historyForApi);
      addMessage({ role: "model", content: res.reply });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get response.";
      setError(msg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const copyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090B]">
      {/* ── Header ── */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#111111]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/recommendation")}
            className="p-2 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <MentorAvatar name={selectedMentor.name} size="md" />
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              {selectedMentor.name}
            </h2>
            <p className="text-xs text-muted-foreground">{selectedMentor.title}</p>
            <p className="text-xs text-primary font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Active Now
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Message Area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Welcome message when chat is empty */}
        {chatHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 max-w-[85%]">
              <MentorAvatar name={selectedMentor.name} size="sm" />
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm p-5">
                <p className="text-white text-sm leading-relaxed">
                  Hello! I&apos;m <strong>{selectedMentor.name}</strong> — {selectedMentor.bio}
                </p>
                <p className="text-white text-sm leading-relaxed mt-3">
                  I specialise in <em>{selectedMentor.expertise_areas.slice(0, 3).join(", ")}</em>.
                  I&apos;ll teach you in my{" "}
                  <em>{selectedMentor.teaching_style}</em> style.
                  What would you like to explore today?
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        <AnimatePresence initial={false}>
          {chatHistory.map((msg, idx) => (
            <motion.div
              key={`${msg.role}-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "user" ? (
                <div className="max-w-[70%] bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-5 py-4">
                  <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="flex gap-3 max-w-[85%]">
                  <MentorAvatar name={selectedMentor.name} size="sm" />
                  <div className="space-y-1">
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4 relative group">
                      <div className="text-white text-sm leading-relaxed">
                        {renderContent(msg.content)}
                      </div>
                      {/* Copy action */}
                      <button
                        onClick={() => copyMessage(msg.content, idx)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                        title="Copy message"
                      >
                        {copied === idx ? (
                          <span className="text-xs text-success">Copied!</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground px-1">
                      {selectedMentor.name.split(" ")[0]} •{" "}
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <TypingIndicator />
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-danger/10 border border-danger/30 text-danger rounded-2xl px-4 py-3 max-w-[85%]"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="px-4 pb-6 pt-2 bg-gradient-to-t from-[#09090B] via-[#09090B] to-transparent">
        <div className="max-w-4xl mx-auto">
          {/* Suggested questions (shown when chat is empty) */}
          {chatHistory.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggested.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="px-4 py-2 rounded-full bg-[#111111] border border-white/5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="relative bg-[#111111] border border-white/10 rounded-3xl p-2 shadow-2xl focus-within:border-primary/50 focus-within:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] transition-all flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedMentor.name.split(" ")[0]} anything…`}
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 p-3 text-white placeholder:text-muted-foreground text-sm"
              rows={1}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-full transition-all flex-shrink-0 mb-1 mr-1 ${
                input.trim() && !isTyping
                  ? "bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-105"
                  : "bg-white/5 text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-2">
            Press <kbd className="text-white/30">Enter</kbd> to send · <kbd className="text-white/30">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
