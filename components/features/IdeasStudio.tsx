"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { FlipIdeaCard } from "@/components/effects/FlipIdeaCard";
import { ChatMessage } from "@/types";

const QUICK_CHIPS = [
  "Budget-friendly decor",
  "Surprise ideas",
  "Rainy-day backup plan",
  "Menu for 200 guests",
  "Sangeet performance ideas",
];

export function IdeasStudio() {
  const { activeEvent, addCustomIdea, addToast } = useUtsav();

  const [activeTab, setActiveTab] = useState<"chat" | "saved">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "assistant",
      content: `Namaste! I am your Utsav AI Creative Director. I'm tailored with the context of "${activeEvent?.name || "your celebration"}" in ${activeEvent?.city || "India"}. Click one of the quick chips below or ask me anything about decor styling, royal menus, entertainment surprises, or return gifts!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isStreaming) return;

    setInputText("");

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const assistantMsgId = `msg-${Date.now()}-ai`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: activeEvent
            ? {
                eventName: activeEvent.name,
                eventType: activeEvent.type,
                city: activeEvent.city,
                guestCount: activeEvent.guestCount,
                totalBudget: activeEvent.totalBudget,
                vibe: activeEvent.vibe,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      if (!res.body) {
        throw new Error("No response stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulated } : m)),
        );
      }
    } catch (err) {
      console.warn("Streaming chat error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  "I experienced a brief connection hiccup. Please try asking again or select one of the suggestion chips!",
              }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    addToast({ type: "info", title: "Copied to Clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToIdeasBoard = (content: string) => {
    // Extract title (first line or phrase)
    const firstLine = content.split("\n")[0].replace(/[*#]/g, "").trim().substring(0, 50);
    addCustomIdea({
      category: "decor",
      title: firstLine || "Creative Celebration Concept",
      description: content.substring(0, 300),
      culturalTouch: "Handpicked via AI Ideas Studio conversation.",
      saved: true,
    });
    addToast({
      type: "success",
      title: "Saved to Ideas Board",
      message: "Idea is now visible on your 3D flip card board.",
    });
  };

  const savedIdeas = activeEvent ? activeEvent.ideas : [];

  return (
    <div className="space-y-6">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100">
            AI Ideas Studio
          </h1>
          <p className="text-xs text-ivory-300 mt-1">
            Real-time streaming creative brainstorming &amp; 3D Saved Ideas Board
          </p>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-plum-900/60 border border-plum-700/50">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "chat"
                ? "bg-saffron-500 text-plum-950 shadow-sm"
                : "text-ivory-300 hover:text-ivory-100"
            }`}
          >
            Streaming Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "saved"
                ? "bg-saffron-500 text-plum-950 shadow-sm"
                : "text-ivory-300 hover:text-ivory-100"
            }`}
          >
            Saved Ideas ({savedIdeas.length})
          </button>
        </div>
      </div>

      {activeTab === "chat" ? (
        <div className="rounded-3xl border border-plum-700/50 bg-plum-900/40 backdrop-blur-md shadow-glass flex flex-col h-[650px] overflow-hidden">
          {/* Quick Suggestion Chips */}
          <div className="p-3 bg-plum-950/70 border-b border-plum-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-saffron-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Prompt:
            </span>
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isStreaming}
                className="px-3 py-1 rounded-full text-xs font-medium bg-plum-900 border border-plum-700/70 text-ivory-200 hover:border-saffron-400 hover:text-saffron-300 whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                      isUser
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-saffron-500/20 text-saffron-300 border border-saffron-500/30 shadow-glass-glow"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-glass rounded-tr-none"
                        : "bg-plum-950/80 text-ivory-100 border border-plum-800 shadow-glass rounded-tl-none whitespace-pre-line"
                    }`}
                  >
                    {m.content ? (
                      m.content
                    ) : (
                      <span className="flex items-center gap-2 text-saffron-400 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" /> Composing personalized
                        inspiration...
                      </span>
                    )}

                    {!isUser && m.content && (
                      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-plum-800/80 text-xs">
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.content)}
                          className="flex items-center gap-1 text-ivory-400 hover:text-ivory-100 transition-colors"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveToIdeasBoard(m.content)}
                          className="flex items-center gap-1 text-saffron-400 hover:text-saffron-300 transition-colors"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save as Idea</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-plum-950/80 border-t border-plum-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask for themes, decor, surprise entries, menus, or Sangeet tracks..."
              disabled={isStreaming}
              className="flex-1 px-4 py-2.5 rounded-xl bg-plum-900/60 border border-plum-700/60 text-ivory-100 placeholder:text-ivory-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
            <button
              type="submit"
              disabled={isStreaming || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-400 disabled:opacity-50 text-plum-950 font-bold text-sm flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-400"
              aria-label="Send message"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      ) : (
        /* Saved Ideas Board with 3D Flip Cards */
        <div className="space-y-4">
          <p className="text-xs text-ivory-300">
            Click <strong>&quot;View details&quot;</strong> on any card to flip it and explore regional cultural
            touches.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedIdeas.map((idea) => (
              <FlipIdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

