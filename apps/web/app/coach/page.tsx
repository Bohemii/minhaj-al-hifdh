"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Send, Loader2, User, Bot } from "lucide-react";
import { TOTAL_AYAH } from "@minhaj/core";
import { useStatus } from "../hooks/useStatus";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "ما هي أولويات المراجعة اليوم؟",
  "لديّ وقت 20 دقيقة، ماذا أحفظ؟",
  "What should I focus on this week?",
  "Help me create a 3-month plan",
];

export default function CoachPage() {
  const { status } = useStatus();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [plan, setPlan] = useState<{ pagesPerDay: number; targetDate: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Compute progress stats from status
  const today = new Date().toISOString().slice(0, 10);
  const totalDone = Object.values(status).filter(
    (v) => v?.state === "memorized" || v?.state === "mastered"
  ).length;
  const dueCount = Object.values(status).filter(
    (v) =>
      v?.state === "due" ||
      (v?.dueDate && v.dueDate <= today && (v.state === "memorized" || v.state === "mastered"))
  ).length;
  const stumbedCount = Object.values(status).filter((v) => v?.state === "stumbled").length;
  const pct = Math.round((totalDone / TOTAL_AYAH) * 100);

  // Load active plan
  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          const active = Array.isArray(data) ? data.find((p: { active: boolean }) => p.active) : null;
          if (active) {
            setPlan({
              pagesPerDay: parseFloat(active.pagesPerDay ?? "0"),
              targetDate: active.targetDate ?? "",
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const buildContext = () => ({
    totalDone,
    totalAyahs: TOTAL_AYAH,
    dueCount,
    stumbedCount,
    activePlan: plan,
  });

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setIsStreaming(true);

      // Add empty assistant message to stream into
      const assistantIndex = nextMessages.length;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            context: buildContext(),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIndex] = {
              role: "assistant",
              content: err.error ?? "حدث خطأ. يرجى المحاولة مرة أخرى.",
            };
            return updated;
          });
          setIsStreaming(false);
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIndex] = { role: "assistant", content: accumulated };
            return updated;
          });
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = {
            role: "assistant",
            content: "حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, isStreaming, totalDone, dueCount, stumbedCount, plan]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div
      dir="rtl"
      className="max-w-[740px] mx-auto my-6 flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        boxShadow: "0 10px 40px -12px rgba(33,31,26,.25)",
        height: "calc(100vh - 48px)",
        maxHeight: "820px",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--line)", background: "#EFE8D8" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: "var(--emerald)" }} />
          <div>
            <h1 className="text-[17px] font-black m-0 leading-tight">المساعد الذكي</h1>
            <p className="text-[11px] m-0" style={{ color: "#8b8474" }}>
              Minhāj Coach
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/revision"
            className="text-[11px] px-3 py-[6px] rounded-lg font-bold"
            style={{ background: "var(--emerald)", color: "#fff" }}
          >
            المراجعة
          </Link>
          <Link
            href="/plan"
            className="text-[11px] px-3 py-[6px] rounded-lg font-bold"
            style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--line)" }}
          >
            الخطة
          </Link>
          <Link
            href="/"
            className="text-[11px] px-3 py-[6px] rounded-lg font-bold"
            style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--line)" }}
          >
            ← الرئيسية
          </Link>
        </div>
      </header>

      {/* Context card */}
      <div
        className="px-5 py-3 shrink-0 flex gap-4 flex-wrap text-[12px]"
        style={{ borderBottom: "1px solid var(--line)", background: "#FDFAF4" }}
      >
        <span>
          <strong>{totalDone.toLocaleString("ar-EG")}</strong>
          <span style={{ color: "#8b8474" }}> / {TOTAL_AYAH.toLocaleString("ar-EG")} آية · </span>
          <strong>{pct}٪</strong>
        </span>
        <span style={{ color: dueCount > 0 ? "#D9A93B" : "#8b8474" }}>
          للمراجعة: <strong>{dueCount}</strong>
        </span>
        <span style={{ color: stumbedCount > 0 ? "#C25A3A" : "#8b8474" }}>
          تعثّر: <strong>{stumbedCount}</strong>
        </span>
        {plan && (
          <span style={{ color: "var(--emerald)" }}>
            الخطة: <strong>{plan.pagesPerDay} صفحة/يوم</strong>
            {plan.targetDate && (
              <span style={{ color: "#8b8474" }}> · ينتهي {plan.targetDate}</span>
            )}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-center text-[13px]" style={{ color: "#8b8474" }}>
              اختر سؤالاً أو اكتب رسالتك
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-[13px] text-right px-4 py-3 rounded-xl font-medium transition-opacity hover:opacity-80"
                  style={{
                    background: "#EFE8D8",
                    color: "var(--ink)",
                    border: "1px solid var(--line)",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    lineHeight: "1.5",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1"
              style={{
                background: msg.role === "user" ? "var(--emerald)" : "#EFE8D8",
                border: "1px solid var(--line)",
              }}
            >
              {msg.role === "user" ? (
                <User size={14} color="#fff" />
              ) : (
                <Bot size={14} style={{ color: "var(--emerald)" }} />
              )}
            </div>

            {/* Bubble */}
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed"
              style={{
                background: msg.role === "user" ? "var(--emerald)" : "#fff",
                color: msg.role === "user" ? "#fff" : "var(--ink)",
                border: msg.role === "user" ? "none" : "1px solid var(--line)",
                borderTopRightRadius: msg.role === "user" ? "6px" : "18px",
                borderTopLeftRadius: msg.role === "user" ? "18px" : "6px",
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
              }}
            >
              {msg.content}
              {msg.role === "assistant" && isStreaming && i === messages.length - 1 && (
                <span
                  className="inline-block w-[2px] h-[14px] rounded-full mr-1 animate-pulse"
                  style={{ background: "var(--emerald)", verticalAlign: "middle" }}
                />
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <div
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "#EFE8D8", border: "1px solid var(--line)" }}
            >
              <Bot size={14} style={{ color: "var(--emerald)" }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl text-[13px]"
              style={{ background: "#fff", border: "1px solid var(--line)" }}
            >
              <Loader2 size={14} className="animate-spin" style={{ color: "var(--emerald)" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 shrink-0 flex gap-2 items-end"
        style={{ borderTop: "1px solid var(--line)", background: "#EFE8D8" }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب سؤالك هنا… / Type your question…"
          rows={1}
          disabled={isStreaming}
          className="flex-1 resize-none px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{
            background: "#fff",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            fontFamily: "inherit",
            minHeight: "44px",
            maxHeight: "120px",
            overflowY: "auto",
          }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
          }}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isStreaming || !input.trim() ? "#ccc" : "var(--emerald)",
            border: "none",
            cursor: isStreaming || !input.trim() ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {isStreaming ? (
            <Loader2 size={16} color="#fff" className="animate-spin" />
          ) : (
            <Send size={16} color="#fff" />
          )}
        </button>
      </form>

      {/* Disclaimer */}
      <div
        className="px-5 py-2 text-center text-[10px] shrink-0"
        style={{ color: "#aaa", borderTop: "1px solid var(--line)", background: "#FDFAF4" }}
      >
        لا يُولّد المساعد نصاً قرآنياً — يستشهد بالآيات بالرقم فقط · The coach never generates Quranic text — it cites by reference only.
      </div>
    </div>
  );
}
