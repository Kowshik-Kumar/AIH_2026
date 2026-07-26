"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Send, 
  Mic, 
  Paperclip, 
  Copy, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  Bot
} from "lucide-react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    "Can you explain the intuition behind Self-Attention?",
    "How do I implement a Transformer in PyTorch?",
    "Review my recent code snippet for bugs."
  ];

  return (
    <div className="flex flex-col h-screen bg-[#09090B]">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#111111]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg mr-4">
            A
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Andrej Karpathy</h2>
            <p className="text-xs text-primary font-medium flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-success mr-2 animate-pulse" />
              Active Now
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="p-2 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {/* Timestamp */}
        <div className="flex justify-center">
          <span className="text-xs font-medium text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
            Today at 10:42 AM
          </span>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="max-w-[70%] bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm p-4">
            <p className="text-white text-sm leading-relaxed">
              I'm trying to understand how positional encoding works in the Transformer architecture. Why use sine and cosine functions instead of just integers?
            </p>
          </div>
        </div>

        {/* Mentor Message */}
        <div className="flex justify-start">
          <div className="flex max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mr-4 mt-1">
              A
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm p-5 relative group">
                <p className="text-white text-sm leading-relaxed mb-4">
                  Great question! If we just used integers (0, 1, 2, ...), the values would grow arbitrarily large for long sequences. This could cause issues with gradient stability.
                </p>
                <p className="text-white text-sm leading-relaxed mb-4">
                  By using sine and cosine functions of different frequencies, we map positions to a continuous, bounded space `[-1, 1]`. The beautiful part is that this allows the model to easily learn to attend by relative positions, because for any fixed offset `k`, `PE(pos+k)` can be represented as a linear function of `PE(pos)`.
                </p>
                
                {/* Code Snippet */}
                <div className="rounded-xl overflow-hidden bg-[#09090B] border border-white/10 mt-4">
                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                    <span className="text-xs font-mono text-muted-foreground">python</span>
                    <button className="text-muted-foreground hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code className="text-sm font-mono text-emerald-400">
                      {`def get_positional_encoding(seq_len, d_model):
    pos = np.arange(seq_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))
    
    pe = np.zeros((seq_len, d_model))
    pe[:, 0::2] = np.sin(pos * div_term)
    pe[:, 1::2] = np.cos(pos * div_term)
    
    return pe`}
                    </code>
                  </pre>
                </div>

                {/* Message Actions */}
                <div className="absolute top-2 -right-12 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg bg-[#111111] border border-white/10 text-muted-foreground hover:text-white hover:border-white/30 shadow-lg">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-[#111111] border border-white/10 text-muted-foreground hover:text-white hover:border-white/30 shadow-lg">
                    <Share className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mr-4 mt-1">
                A
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm p-4 flex items-center space-x-2">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 rounded-full bg-primary" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-gradient-to-t from-[#09090B] via-[#09090B] to-transparent">
        <div className="max-w-4xl mx-auto">
          {/* Suggested */}
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedQuestions.map((q, i) => (
              <button key={i} className="px-4 py-2 rounded-full bg-[#111111] border border-white/5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="relative bg-[#111111] border border-white/10 rounded-3xl p-2 shadow-2xl focus-within:border-primary/50 focus-within:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] transition-all flex items-end">
            <button className="p-3 text-muted-foreground hover:text-white transition-colors mb-1">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Andrej anything..."
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 p-3 text-white placeholder:text-muted-foreground text-sm"
              rows={1}
            />
            <div className="flex items-center space-x-2 mb-1 mr-1">
              <button className="p-3 bg-white/5 text-muted-foreground rounded-full hover:bg-white/10 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { if(input) { setInput(""); setIsTyping(true); setTimeout(() => setIsTyping(false), 3000); } }}
                className={`p-3 rounded-full transition-all ${input ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-muted-foreground'}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
