"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles, HelpCircle, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How does verification work?",
  "How do I report a pothole?",
  "What is my citizen score?",
  "What is the 3-people consensus rule?",
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your Civic AI Assistant. Ask me anything about reporting civic issues, map visibility, verification guidelines, or contribution rewards!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        messages: [...messages, userMessage],
      });
      const reply = response.data.data.content;

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("AI Chat failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered a temporary connection issue. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed z-40 bottom-20 right-4 lg:bottom-6 lg:right-24">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-lg border cursor-pointer",
            "transition-all duration-300 relative overflow-hidden",
            isOpen
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          )}
          aria-label="Civic AI Assistant"
        >
          {/* Glowing Aura Effect */}
          {!isOpen && (
            <span className="absolute inset-0 bg-white/10 animate-ping rounded-full pointer-events-none" />
          )}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center relative"
              >
                <Bot size={20} className="relative z-10" />
                <Sparkles size={10} className="absolute -top-1.5 -right-1.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Slide-out Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "fixed z-40 bottom-36 right-4 left-4 sm:left-auto sm:right-6 sm:w-[380px] h-[500px]",
              "bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden text-left"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center relative">
                  <Bot size={16} />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Civic AI Assistant</h3>
                  <span className="text-[10px] text-blue-100 font-semibold uppercase tracking-wider block leading-none mt-0.5">Online Support</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-2.5 max-w-[85%]",
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <Bot size={14} />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm font-medium",
                        isUser
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                      )}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input & Footer Suggestions */}
            <div className="border-t border-slate-100 p-3 bg-white">
              {/* Suggestion Chips */}
              {messages.length === 1 && !isLoading && (
                <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-2 scrollbar-none no-scrollbar">
                  {SUGGESTIONS.map((text, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(text)}
                      className="px-2.5 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-200 cursor-pointer shrink-0 transition-colors"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about guidelines, verification, rewards..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage(inputValue);
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-slate-50/50 border border-slate-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-semibold"
                />
                <Button
                  size="sm"
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center p-0 rounded-lg shrink-0 shadow-sm"
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
