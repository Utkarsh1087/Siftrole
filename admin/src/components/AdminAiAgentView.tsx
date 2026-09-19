"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Database,
  ShieldCheck,
  Users,
  Briefcase,
  Copy,
  Check,
  Trash2,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "admin" | "ai";
  text: string;
  timestamp: string;
}

interface PlatformStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalUsers: number;
}

const QUICK_PROMPTS = [
  {
    title: "📊 Platform Telemetry",
    prompt: "Provide a complete health check of the platform database, active listings, and user counts.",
  },
  {
    title: "🛡️ Scraper & Review Queue",
    prompt: "Are there any pending job listings requiring manual admin review or verification?",
  },
  {
    title: "👥 Candidate Insights",
    prompt: "How many students/candidates are registered and what advice do you have to drive job applications?",
  },
  {
    title: "✉️ Newsletter Strategy",
    prompt: "Draft an engaging newsletter subject line and opening hook to broadcast our newly synced roles to candidates.",
  },
];

function formatInline(text: string, isUser: boolean) {
  // Splits by bold (**...**) and inline code (`...`)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const content = part.slice(2, -2);
      return (
        <strong
          key={i}
          className={`font-bold ${isUser ? "text-white" : "text-[#083327]"}`}
        >
          {content}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const content = part.slice(1, -1);
      return (
        <code
          key={i}
          className={`px-1.5 py-0.5 rounded font-mono text-[0.7rem] ${
            isUser ? "bg-white/20 text-white" : "bg-slate-200/80 text-[#083327]"
          }`}
        >
          {content}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function renderFormattedText(text: string, isUser: boolean) {
  const rawLines = text.split("\n");
  const blocks: Array<{ type: "table" | "text"; lines: string[] }> = [];
  let currentBlock: { type: "table" | "text"; lines: string[] } = { type: "text", lines: [] };

  for (const line of rawLines) {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|");
    if (isTableLine) {
      if (currentBlock.type !== "table") {
        if (currentBlock.lines.length > 0) blocks.push(currentBlock);
        currentBlock = { type: "table", lines: [] };
      }
      currentBlock.lines.push(trimmed);
    } else {
      if (currentBlock.type !== "text") {
        if (currentBlock.lines.length > 0) blocks.push(currentBlock);
        currentBlock = { type: "text", lines: [] };
      }
      currentBlock.lines.push(line);
    }
  }
  if (currentBlock.lines.length > 0) blocks.push(currentBlock);

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {blocks.map((block, bIdx) => {
        if (block.type === "table") {
          const rows = block.lines.filter((l) => !l.includes("---"));
          if (rows.length === 0) return null;
          const headerRow = rows[0].split("|").slice(1, -1).map((c) => c.trim());
          const bodyRows = rows.slice(1).map((r) => r.split("|").slice(1, -1).map((c) => c.trim()));

          return (
            <div key={bIdx} className="overflow-x-auto my-2 rounded-xl border border-slate-200 shadow-2xs">
              <table className="min-w-full text-[0.72rem] text-left">
                <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    {headerRow.map((col, cIdx) => (
                      <th key={cIdx} className="px-3 py-1.5">
                        {formatInline(col, isUser)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 text-slate-700">
                          {formatInline(cell, isUser)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return block.lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={lineIdx} className="h-1.5" />;
          }

          // Headers
          if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
            const headerText = trimmed.replace(/^#+\s*/, "");
            return (
              <div
                key={lineIdx}
                className={`font-bold text-xs mt-2 mb-1 ${
                  isUser ? "text-emerald-200" : "text-[#083327]"
                }`}
              >
                {formatInline(headerText, isUser)}
              </div>
            );
          }

          // Bullets
          const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
          const cleanLine = isBullet ? trimmed.replace(/^[-*•]\s*/, "") : line;

          if (isBullet) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
                <span className={`text-[0.68rem] leading-tight select-none ${isUser ? "text-emerald-300" : "text-[#083327] font-black"}`}>•</span>
                <div className="flex-1">{formatInline(cleanLine, isUser)}</div>
              </div>
            );
          }

          return <div key={lineIdx}>{formatInline(cleanLine, isUser)}</div>;
        });
      })}
    </div>
  );
}

export function AdminAiAgentView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-agent",
      sender: "ai",
      text: "👋 **Welcome, Admin.** I am your full-control **Siftrole Admin AI Agent**.\n\nI have direct access to live platform telemetry, database listings, candidate registrations, and scraper logs. Ask me anything about platform metrics, database state, listing approvals, newsletter campaigns, or system debugging.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initial load: Fetch platform stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Ping stats", history: [] }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.platformStats) {
          setStats(data.platformStats);
        }
      }
    } catch (e) {
      console.error("Failed to fetch initial admin stats:", e);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsgId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "admin",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: (m.sender === "admin" ? "user" : "bot") as "user" | "bot",
        text: m.text,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (data.platformStats) {
        setStats(data.platformStats);
      }

      const replyText = data.reply || "No response received from the admin AI service.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `⚠️ **Admin Agent Error:** Unable to reach AI services: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (confirm("Clear conversation history with the Admin AI Agent?")) {
      setMessages([
        {
          id: "welcome-agent-reset",
          sender: "ai",
          text: "Conversation reset. How can I assist you with platform operations?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Live Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Total Listings</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-[#083327] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats ? stats.totalListings : "..."}
          </div>
          <p className="text-[0.68rem] text-slate-400 mt-0.5">Central database records</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Active (Live) Roles</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats ? stats.activeListings : "..."}
          </div>
          <p className="text-[0.68rem] text-slate-400 mt-0.5">Visible to candidates</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Pending Review</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats ? stats.pendingListings : "..."}
          </div>
          <p className="text-[0.68rem] text-slate-400 mt-0.5">Awaiting admin action</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Registered Users</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats ? stats.totalUsers : "..."}
          </div>
          <p className="text-[0.68rem] text-slate-400 mt-0.5">Candidates & admins</p>
        </div>
      </div>

      {/* Main Agent Interface */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#083327] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#083327]">Admin AI Agent</h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Full Database Control
                </span>
              </div>
              <p className="text-[0.7rem] text-slate-500">Real-time database grounding • Groq & Gemini multi-key cascade</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              title="Refresh Telemetry"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              title="Clear Chat"
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition border border-slate-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/20 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[0.68rem] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
            Quick Actions:
          </span>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-[#083327] hover:text-white hover:border-[#083327] text-slate-700 font-medium text-xs transition shadow-2xs disabled:opacity-50"
            >
              {qp.title}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="h-8 w-8 rounded-xl bg-[#083327] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                  AI
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed group relative ${
                msg.sender === "admin"
                  ? "bg-[#083327] text-white shadow-xs"
                  : "bg-slate-50 border border-slate-200 text-slate-800"
              }`}>
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className={`text-[0.65rem] font-bold ${
                    msg.sender === "admin" ? "text-emerald-300" : "text-slate-500"
                  }`}>
                    {msg.sender === "admin" ? "Admin" : "Siftrole AI Agent"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[0.62rem] ${
                      msg.sender === "admin" ? "text-slate-300" : "text-slate-400"
                    }`}>
                      {msg.timestamp}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-black/10 rounded"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="font-sans text-xs">
                  {renderFormattedText(msg.text, msg.sender === "admin")}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-500 py-2">
              <div className="h-8 w-8 rounded-xl bg-[#083327] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-300" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Querying database & formulating response...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-200 bg-white"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Admin AI Agent about listings, stats, newsletter, or scrapers..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-[#083327] transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-5 py-2.5 text-xs font-bold transition disabled:opacity-40 shadow-xs flex items-center gap-2 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
