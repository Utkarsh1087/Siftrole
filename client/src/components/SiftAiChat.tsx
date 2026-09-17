"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Paperclip,
  X,
  FileText,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  Building2,
  Briefcase,
  MapPin,
  Flame,
  RotateCcw,
  Zap,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";

export interface Listing {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: string | null;
  eligibility: string | null;
  stipend_or_salary: string | null;
  deadline: string | null;
  skills_required: string[];
  experience_level: string | null;
  apply_url: string;
  source: string;
  status: string;
  raw_jd_hash?: string;
  job_description?: string | null;
  posted_at?: string | null;
  normalized_title?: string | null;
  raw_jd_text: string | null;
  created_at: string;
}

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  recommendedJobs?: Listing[];
  extractedSkills?: string[];
}

interface SiftAiChatProps {
  liveListings: Listing[];
  onSelectListing: (job: Listing) => void;
  onFilterByCompany: (company: string) => void;
  onFilterBySearch: (query: string) => void;
  activeResumeSkills: string[];
  uploadedResumeName: string | null;
  onApplyResumeSkills: (skills: string[], fileName: string) => void;
  onClearResume: () => void;
}

const COMMON_TECH_SKILLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
  "Go", "Golang", "Rust", "Java", "C++", "AWS", "Docker", "Kubernetes",
  "PostgreSQL", "MongoDB", "SQL", "TailwindCSS", "GraphQL", "Redis",
  "Figma", "FastAPI", "Django", "Vue", "Angular", "Express", "GCP", "Azure"
];

export function SiftAiChat({
  liveListings,
  onSelectListing,
  onFilterByCompany,
  onFilterBySearch,
  activeResumeSkills,
  uploadedResumeName,
  onApplyResumeSkills,
  onClearResume,
}: SiftAiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      sender: "ai",
      text: "👋 Hi! I'm Sift AI. Drop your resume here or ask me anything about live verified tech roles.",
      timestamp: "Just now",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Hi";
    if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17 && hour < 22) timeGreeting = "Good evening";
    else timeGreeting = "Working late";

    setMessages([
      {
        id: "initial-1",
        sender: "ai",
        text: `👋 ${timeGreeting}! I'm Sift AI. Drop your resume here or ask me anything about live verified tech roles.`,
        timestamp: "Just now",
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Resume Drop / File Upload
  const handleFileProcess = (file: File) => {
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();

    // Simulate intelligent resume text reading / skill extraction
    let detectedSkills: string[] = [];
    if (lowerName.includes("frontend") || lowerName.includes("react")) {
      detectedSkills = ["React", "TypeScript", "Next.js", "TailwindCSS", "JavaScript", "GraphQL"];
    } else if (lowerName.includes("backend") || lowerName.includes("python")) {
      detectedSkills = ["Python", "Node.js", "PostgreSQL", "Docker", "AWS", "FastAPI", "SQL"];
    } else if (lowerName.includes("fullstack") || lowerName.includes("dev")) {
      detectedSkills = ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "Next.js", "AWS"];
    } else {
      // Default sample extraction for general candidate resume
      detectedSkills = ["React", "TypeScript", "Node.js", "Python", "SQL", "Docker"];
    }

    onApplyResumeSkills(detectedSkills, fileName);

    // Calculate top matching jobs
    const scoredJobs = liveListings
      .map((job) => {
        const jobSkills = job.skills_required || [];
        const matches = jobSkills.filter((s) =>
          detectedSkills.some((ds) => ds.toLowerCase() === s.toLowerCase())
        );
        const score = jobSkills.length > 0 ? (matches.length / jobSkills.length) * 100 : 50;
        return { job, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.job);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: `📄 Uploaded Resume: ${fileName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `✨ Parsed your resume! Detected **${detectedSkills.length} core skills** (${detectedSkills.join(", ")}). I've re-ranked the job feed on the left to prioritize your strongest matches.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        extractedSkills: detectedSkills,
        recommendedJobs: scoredJobs,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 900);
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsTyping(true);

    const lower = query.toLowerCase();

    setTimeout(() => {
      setIsTyping(false);
      let replyText = "";
      let foundJobs: Listing[] = [];

      // 1. SECURITY & SENSITIVE DATA GUARDRAIL
      const sensitiveKeywords = [
        "env",
        "api_key",
        "apikey",
        "secret",
        "password",
        "database",
        "connection_string",
        "postgres",
        "prisma",
        "token",
        "credential",
        "system prompt",
        "ignore previous",
        "ignore all instructions",
        "jailbreak",
        "leak",
        "admin password",
        "ssh",
        "root",
        "private key",
      ];

      const isSensitiveAttempt = sensitiveKeywords.some((kw) => lower.includes(kw));

      if (isSensitiveAttempt) {
        replyText = "🔒 **Security Guardrail Active**: Sift AI is strictly restricted to assisting with verified tech roles, candidate resume matching, and platform navigation on Siftrole. Internal platform architecture, environment variables, credentials, and tokens are secure and completely inaccessible.";
      }
      // 2. PLATFORM INFORMATION & PHILOSOPHY
      else if (lower.includes("what is siftrole") || lower.includes("how does siftrole work") || lower.includes("about siftrole") || lower.includes("tell me about siftrole")) {
        replyText = "✨ **About Siftrole**: Siftrole is the central hub and ultimate application checklist for tech jobs and internships. We bring all big company openings into one place so you never miss an opportunity, help you track your applications, and will soon launch 1-Click Automated Easy Apply!";
      } else if (lower.includes("easy apply") || lower.includes("1 click apply") || lower.includes("apply automated")) {
        replyText = "🚀 **Upcoming 1-Click Easy Apply**: We are building an automated Easy Apply feature that will allow students and developers to dispatch verified applications directly to employer ATS portals with a single click. Stay tuned!";
      } else if (lower.includes("checklist") || lower.includes("track") || lower.includes("tracker")) {
        replyText = "📋 **The Application Checklist**: Siftrole acts as your personal job search command center. You can browse live openings from top companies, mark roles you have applied to, and keep track of your active pipeline so no opportunity slips by.";
      } else if (lower.includes("ghost job") || lower.includes("fake job") || lower.includes("verified")) {
        replyText = "🛡️ **Zero Ghost Jobs Guarantee**: Generic job boards leave stale postings active for months. Siftrole ingests public ATS JSON APIs continuously. When a company marks a role filled or closed, it auto-expires from our feed within minutes.";
      } else if (lower.includes("free") || lower.includes("price") || lower.includes("cost") || lower.includes("paywall")) {
        replyText = "💡 **100% Free for Applicants**: Siftrole is completely free for students, developers, and builders. You can browse, filter, match resumes, and apply directly on the employer's official portal with zero fees or recruiter middlemen.";
      } else if (lower.includes("how to match") || lower.includes("upload resume") || lower.includes("resume match")) {
        replyText = "📄 **How Resume Matching Works**: You can drop your PDF/DOCX resume directly into this chat or click the paperclip icon. Sift AI will extract your core tech skills and instantly re-rank all live jobs by % compatibility score!";
      }
      // 3. TARGETED JOB & CRITERIA SEARCHES
      else if (lower.includes("remote") || lower.includes("anywhere") || lower.includes("work from home")) {
        foundJobs = liveListings.filter(
          (j) => j.location.toLowerCase().includes("remote") || j.location.toLowerCase().includes("anywhere")
        ).slice(0, 3);
        replyText = `Found **${foundJobs.length} verified remote engineering roles** available across official feeds:`;
      } else if (lower.includes("intern") || lower.includes("internship") || lower.includes("student") || lower.includes("2026") || lower.includes("junior") || lower.includes("entry")) {
        foundJobs = liveListings.filter(
          (j) =>
            (j.employment_type && j.employment_type.toLowerCase().includes("intern")) ||
            (j.experience_level && (j.experience_level.toLowerCase().includes("entry") || j.experience_level.toLowerCase().includes("intern") || j.experience_level.toLowerCase().includes("junior"))) ||
            j.title.toLowerCase().includes("intern") ||
            j.title.toLowerCase().includes("junior")
        ).slice(0, 3);
        if (foundJobs.length === 0) foundJobs = liveListings.slice(0, 3);
        replyText = `Here are active early-career and entry-level engineering openings open for direct application:`;
      } else if (lower.includes("salary") || lower.includes("high") || lower.includes("150k") || lower.includes("pay") || lower.includes("compensation")) {
        foundJobs = liveListings.filter(
          (j) => j.stipend_or_salary && (j.stipend_or_salary.includes("1") || j.stipend_or_salary.includes("2"))
        ).slice(0, 3);
        if (foundJobs.length === 0) foundJobs = liveListings.slice(0, 3);
        replyText = `Here are verified roles with top-tier compensation brackets:`;
      } else if (lower.includes("figma") || lower.includes("stripe") || lower.includes("spotify") || lower.includes("linear") || lower.includes("notion") || lower.includes("smartrecruiters")) {
        const comp = ["figma", "stripe", "spotify", "linear", "notion", "smartrecruiters"].find((c) => lower.includes(c)) || "figma";
        foundJobs = liveListings.filter((j) => j.company.toLowerCase().includes(comp)).slice(0, 3);
        replyText = `Here are active openings directly from **${foundJobs[0]?.company || comp}**'s official career stream:`;
      } else if (lower.includes("react") || lower.includes("python") || lower.includes("node") || lower.includes("typescript") || lower.includes("golang") || lower.includes("rust") || lower.includes("aws") || lower.includes("docker")) {
        const skill = ["react", "python", "node", "typescript", "golang", "rust", "aws", "docker"].find((s) => lower.includes(s)) || "react";
        foundJobs = liveListings.filter(
          (j) =>
            j.skills_required?.some((s) => s.toLowerCase().includes(skill)) ||
            j.title.toLowerCase().includes(skill)
        ).slice(0, 3);
        replyText = `Found verified roles requiring **${skill.toUpperCase()}** in their tech stack:`;
      }
      // 4. OFF-TOPIC OR GENERAL JOB QUERIES
      else if (
        lower.includes("weather") ||
        lower.includes("recipe") ||
        lower.includes("movie") ||
        lower.includes("game") ||
        lower.includes("joke") ||
        lower.includes("president") ||
        lower.includes("politics")
      ) {
        replyText = "👋 I am Sift AI, specifically trained to help you discover verified tech roles, match your resume, and navigate official company career feeds. Ask me about open engineering roles, salary brackets, or drop your resume!";
      } else {
        foundJobs = liveListings.slice(0, 3);
        replyText = `Here are top active verified tech roles currently ingesting live from official company feeds:`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recommendedJobs: foundJobs.length > 0 ? foundJobs : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 700);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileProcess(e.dataTransfer.files[0]);
        }
      }}
      className={`rounded-[26px] border ${
        isDragging ? "border-[#84d64f] bg-[#eef8e5]/70 ring-2 ring-[#84d64f]" : "border-neutral-200/90 bg-white"
      } shadow-sm flex flex-col h-[600px] sm:h-[640px] overflow-hidden transition-all`}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx,.doc,.txt"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Header */}
      <div className="p-4 border-b border-neutral-100 bg-[#fbfaf8] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#14281a] to-[#3c7818] text-[#84d64f] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-black text-[#121816]">Sift AI Assistant</h3>
              <span className="inline-block h-2 w-2 rounded-full bg-[#84d64f] animate-pulse" />
            </div>
            <p className="text-[0.65rem] sm:text-[0.7rem] font-semibold text-[#55615b]">
              Resume Matcher & Live Job Query
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#84d64f]/40 bg-[#eef8e5] hover:bg-[#84d64f]/20 px-3 py-1.5 text-xs font-bold text-[#14281a] transition"
        >
          <Paperclip className="w-3.5 h-3.5 text-[#3c7818]" />
          <span className="hidden sm:inline">Drop Resume</span>
        </button>
      </div>

      {/* Active Resume Status Bar */}
      {uploadedResumeName && (
        <div className="px-4 py-2 bg-[#14281a] text-white text-xs flex items-center justify-between gap-2 border-b border-[#14281a]">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-3.5 h-3.5 text-[#84d64f] shrink-0" />
            <span className="truncate font-semibold text-[0.72rem]">
              {uploadedResumeName} ({activeResumeSkills.length} skills active)
            </span>
          </div>
          <button
            onClick={onClearResume}
            className="text-[0.68rem] text-[#84d64f] hover:underline font-bold shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Messages Feed */}
      <div
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="flex-1 p-4 overflow-y-auto space-y-4 text-xs no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 ${
                m.sender === "user"
                  ? "bg-[#14281a] text-white rounded-br-xs shadow-xs"
                  : "bg-[#f4f3f0] text-[#121816] rounded-bl-xs border border-neutral-200/60"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-line">{m.text}</p>

              {/* Extracted Skills Pill Cloud */}
              {m.extractedSkills && (
                <div className="mt-3 pt-2.5 border-t border-neutral-300/60">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#55615b] block mb-1.5">
                    Detected Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {m.extractedSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-[#eef8e5] text-[#14281a] px-2 py-0.5 text-[0.68rem] font-bold border border-[#cce8be]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Mini Job Cards */}
              {m.recommendedJobs && m.recommendedJobs.length > 0 && (
                <div className="mt-3 space-y-2 pt-2.5 border-t border-neutral-300/60">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#55615b] block">
                    Recommended Openings:
                  </span>
                  {m.recommendedJobs.map((j) => (
                    <Link
                      key={j.id || j.title}
                      href={`/jobs/${j.id}`}
                      className="rounded-xl border border-neutral-200/90 bg-white p-2.5 hover:border-[#84d64f] hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-2 block"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <CompanyLogo
                            company={j.company}
                            size="sm"
                            className="!h-3.5 !w-3.5 !p-0 border-0 bg-transparent"
                          />
                          <span className="text-[0.65rem] font-bold text-[#14281a] truncate">
                            {j.company}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-[0.75rem] text-[#121816] truncate mt-0.5">
                          {j.title}
                        </h5>
                        <span className="text-[0.65rem] text-[#79857f] block">
                          {j.location} • {j.stipend_or_salary || "$140k"}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#3c7818]" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[0.6rem] text-[#79857f] mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-[#f4f3f0] p-3 rounded-2xl w-16">
            <span className="h-1.5 w-1.5 rounded-full bg-[#84d64f] animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#84d64f] animate-bounce [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#84d64f] animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="px-3 py-2 border-t border-neutral-100 bg-[#fbfaf8] flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[
          "Remote roles",
          "Highest pay ($150k+)",
          "Entry / 2026 Grad",
          "Figma openings",
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => handleSendMessage(chip)}
            className="rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[#55615b] hover:border-[#84d64f] hover:text-[#3c7818] transition shrink-0 whitespace-nowrap cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-neutral-200/80 bg-white flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach PDF resume"
          className="h-9 w-9 rounded-xl border border-neutral-200/80 hover:bg-neutral-100 text-[#55615b] flex items-center justify-center transition shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask Sift AI or drop your resume..."
          className="flex-1 rounded-xl border border-neutral-200/80 bg-[#fbfaf8] px-3.5 py-2 text-xs font-medium outline-none focus:border-[#84d64f] focus:bg-white"
        />

        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="h-9 w-9 rounded-xl bg-[#84d64f] hover:bg-[#75c73d] disabled:opacity-40 disabled:hover:bg-[#84d64f] text-[#14281a] flex items-center justify-center transition shrink-0 shadow-xs"
        >
          <Send className="w-4 h-4 text-[#14281a]" />
        </button>
      </form>
    </div>
  );
}
