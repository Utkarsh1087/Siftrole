"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  totalMatchesCount?: number;
  filterQuery?: string;
  extractedSkills?: string[];
  requiresAuth?: boolean;
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
  isLoggedIn?: boolean;
}

const COMMON_TECH_SKILLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
  "Go", "Golang", "Rust", "Java", "C++", "AWS", "Docker", "Kubernetes",
  "PostgreSQL", "MongoDB", "SQL", "TailwindCSS", "GraphQL", "Redis",
  "Figma", "FastAPI", "Django", "Vue", "Angular", "Express", "GCP", "Azure"
];

function renderFormattedMessage(text: string, isUser: boolean) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1" />;
        }
        const isBullet = line.trim().startsWith("•") || line.trim().startsWith("- ") || line.trim().startsWith("* ");
        const cleanLine = isBullet ? line.trim().replace(/^[-*•]\s*/, "") : line;

        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
        const formattedLine = parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const content = part.slice(2, -2);
            return (
              <strong
                key={i}
                className={`font-black ${isUser ? "text-white" : "text-[#121816]"}`}
              >
                {content}
              </strong>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1">
              <span className={`text-[0.65rem] mt-0.5 ${isUser ? "text-white/80" : "text-[#3c7818]"}`}>•</span>
              <div className="flex-1">{formattedLine}</div>
            </div>
          );
        }

        return <div key={lineIdx}>{formattedLine}</div>;
      })}
    </div>
  );
}

export function SiftAiChat({
  liveListings,
  onSelectListing,
  onFilterByCompany,
  onFilterBySearch,
  activeResumeSkills,
  uploadedResumeName,
  onApplyResumeSkills,
  onClearResume,
  isLoggedIn = false,
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
  const [parsedResume, setParsedResume] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("siftrole_parsed_resume");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchDynamicGreeting() {
      try {
        let storedCandidateProfile: any = null;
        let activeParsedResume = parsedResume;
        if (typeof window !== "undefined") {
          try {
            const rawUser = localStorage.getItem("siftrole_user");
            if (rawUser) storedCandidateProfile = JSON.parse(rawUser);
            if (!activeParsedResume) {
              const saved = localStorage.getItem("siftrole_parsed_resume");
              if (saved) activeParsedResume = JSON.parse(saved);
            }
          } catch {}
        }

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "__INITIAL_GREETING__",
            activeResumeSkills,
            uploadedResumeName,
            candidateProfile: storedCandidateProfile,
            parsedResume: activeParsedResume,
            liveListings: liveListings.slice(0, 10),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reply && isMounted) {
            setMessages([
              {
                id: "initial-" + Date.now(),
                sender: "ai",
                text: data.reply,
                timestamp: "Just now",
              },
            ]);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic AI greeting:", err);
      }

      // Smooth dynamic fallback if network is delayed
      if (isMounted) {
        const hour = new Date().getHours();
        let timeDesc = "today";
        if (hour >= 5 && hour < 12) timeDesc = "this morning";
        else if (hour >= 12 && hour < 17) timeDesc = "this afternoon";
        else if (hour >= 17 && hour < 22) timeDesc = "this evening";
        else timeDesc = "tonight";

        const hasResume = Boolean(uploadedResumeName && activeResumeSkills.length > 0);
        const namePart = parsedResume?.candidateName ? ` ${parsedResume.candidateName}` : "";
        const dynamicText = hasResume
          ? `👋 Ready to explore roles matching **${uploadedResumeName}** ${timeDesc}${namePart}? Ask me for your top matches or company openings!`
          : `👋 Welcome to Siftrole! What engineering roles, companies, or tech stacks are you searching for ${timeDesc}?`;

        setMessages([
          {
            id: "initial-" + Date.now(),
            sender: "ai",
            text: dynamicText,
            timestamp: "Just now",
          },
        ]);
      }
    }

    fetchDynamicGreeting();

    return () => {
      isMounted = false;
    };
  }, [uploadedResumeName, activeResumeSkills]);

  useEffect(() => {
    if (!uploadedResumeName) {
      setParsedResume(null);
    } else if (!parsedResume && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("siftrole_parsed_resume");
        if (saved) setParsedResume(JSON.parse(saved));
      } catch {}
    }
  }, [uploadedResumeName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Resume Drop / File Upload with Full AI Parsing
  const handleFileProcess = async (file: File) => {
    const fileName = file.name;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: `📄 Uploaded Resume: ${fileName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    if (!isLoggedIn) {
      setTimeout(() => {
        setIsTyping(false);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "🔒 **Account Registration Required**: You must sign in or create a free account to upload your resume, extract skills, and unlock real-time match scores.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          requiresAuth: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 500);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Get logged in user email if available
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("siftrole_user");
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            if (u.email) formData.append("userEmail", u.email);
          } catch {}
        }
      }

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = data.parsed || {};
        const detectedSkills: string[] = Array.isArray(parsed.skills) ? parsed.skills : [];

        setParsedResume(parsed);
        if (typeof window !== "undefined") {
          localStorage.setItem("siftrole_parsed_resume", JSON.stringify(parsed));
          localStorage.setItem("siftrole_resume_skills", JSON.stringify(detectedSkills));
          localStorage.setItem("siftrole_resume_filename", fileName);

          // Update active user session object with actual resume data
          try {
            const rawUser = localStorage.getItem("siftrole_user");
            let userObj: any = {};
            if (rawUser) {
              try {
                userObj = JSON.parse(rawUser);
              } catch {}
            }

            const degreeValue =
              parsed.degree ||
              parsed.education?.[0]?.degree ||
              (parsed.education?.[0]?.major ? `Degree in ${parsed.education[0].major}` : null);
            const gradYearValue =
              parsed.graduationYear ||
              parsed.grad_year ||
              parsed.education?.[0]?.graduationYear ||
              parsed.education?.[0]?.grad_year ||
              null;

            const updatedUser = {
              ...userObj,
              id: userObj.id || "user-student",
              name: parsed.candidateName || userObj.name || "Candidate",
              email: parsed.email || userObj.email || "student@demo.com",
              degree: degreeValue || userObj.degree || null,
              grad_year: gradYearValue || userObj.grad_year || null,
              skills: detectedSkills,
              resume_name: fileName,
              github_url: parsed.githubUrl || userObj.github_url || null,
              linkedin_url: parsed.linkedinUrl || userObj.linkedin_url || null,
              portfolio_url: parsed.portfolioUrl || userObj.portfolio_url || null,
              phone: parsed.phone || userObj.phone || null,
            };

            localStorage.setItem("siftrole_user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("siftrole_user_updated"));

            // Sync with backend Express DB
            fetch("http://localhost:4000/api/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: updatedUser.id,
                name: updatedUser.name,
                degree: updatedUser.degree,
                grad_year: updatedUser.grad_year,
                skills: updatedUser.skills,
                resume_name: fileName,
                github_url: updatedUser.github_url,
                linkedin_url: updatedUser.linkedin_url,
                phone: updatedUser.phone,
                portfolio_url: updatedUser.portfolio_url,
              }),
            }).catch(() => null);

            // Sync with Next.js profile route
            fetch("/api/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: updatedUser.email,
                name: updatedUser.name,
                graduation_year: updatedUser.grad_year,
                skills: updatedUser.skills,
                resume_url: fileName,
              }),
            }).catch(() => null);
          } catch (storageErr) {
            console.warn("Could not sync user session from parsed resume:", storageErr);
          }
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

        setIsTyping(false);
        const nameGreeting = parsed.candidateName ? `Welcome, **${parsed.candidateName}**! ` : "";
        const expCount = parsed.experience?.length || 0;
        const projCount = parsed.projects?.length || 0;

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `✨ ${nameGreeting}Parsed your resume (**${fileName}**)! Your profile is active and live match scores are updated across all verified roles.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          recommendedJobs: scoredJobs,
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }
    } catch (parseErr) {
      console.warn("Resume parsing service error:", parseErr);
    }

    // Graceful error notification if servers are experiencing issues
    setIsTyping(false);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: "⚠️ **Notice**: Our servers are experiencing trouble processing files at the moment. Please try uploading your resume again in a few moments.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleSendMessage = async (textToSend?: string) => {
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

    if (!isLoggedIn) {
      setTimeout(() => {
        setIsTyping(false);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "🔒 **Account Registration Required**: You must sign in or create a free account to chat with Sift AI, search verified roles, and get tailored recommendations.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          requiresAuth: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 400);
      return;
    }

    const lower = query.toLowerCase();

    // 1. MULTI-LAYER SECURITY GUARDRAIL
    const sensitiveKeywords = [
      "admin password", "admin login", "admin portal", "admin panel",
      "admin dashboard", "admin token", "admin credential", "admin access",
      "admin key", "admin secret", "admin endpoint", "admin route",
      "admin api", "access admin", "login as admin", "become admin",
      "grant admin", "internal api", "api_key", "apikey", "api key",
      "groq_api_key", "groq key", "gemini_api_key", "openai_key",
      "jwt_secret", "session_secret", "auth_secret", "database_url",
      "connection_string", "postgres://", "postgresql://", "mongodb://",
      "mongodb+srv", "prisma schema", "dump database", "user table",
      "all users", "user passwords", "user emails", "candidate passwords",
      "select * from", "drop table", "union select", "process.env",
      ".env", "dotenv", "private_key", "secret_key", "id_rsa", "ssh_key"
    ];

    if (sensitiveKeywords.some((kw) => lower.includes(kw))) {
      setTimeout(() => {
        setIsTyping(false);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "🔒 **Security Guardrail Active**: Sift AI is strictly restricted to assisting candidates with verified tech openings, application tracking, resume matching, and career preparation. Access to administrative systems, credentials, internal architecture, and environment variables is strictly forbidden.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 400);
      return;
    }

    // 2. PASS TO FULL INTELLIGENCE LLM CASCADE VIA /api/ai/chat
    try {
      const chatHistory = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      // Load user profile info & parsed resume from localStorage if available
      let storedUserObj: any = null;
      let activeParsedResume = parsedResume;
      if (typeof window !== "undefined") {
        try {
          const u = localStorage.getItem("siftrole_user");
          if (u) storedUserObj = JSON.parse(u);
          if (!activeParsedResume) {
            const saved = localStorage.getItem("siftrole_parsed_resume");
            if (saved) activeParsedResume = JSON.parse(saved);
          }
        } catch {}
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: chatHistory,
          activeResumeSkills,
          uploadedResumeName,
          candidateProfile: storedUserObj,
          parsedResume: activeParsedResume
            ? {
                ...activeParsedResume,
                candidateName: activeParsedResume.candidateName || storedUserObj?.name || "Candidate",
              }
            : null,
          liveListings: liveListings,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setIsTyping(false);

          let matchedJobs: Listing[] = [];
          if (Array.isArray(data.matchedJobs) && data.matchedJobs.length > 0) {
            matchedJobs = data.matchedJobs;
          } else {
            // Intelligent multi-token local scoring fallback across all liveListings
            const queryTokens = lower
              .replace(/[?!.,;:()\[\]{}"']/g, " ")
              .split(/\s+/)
              .filter((t) => t.length > 2 && !["searching", "looking", "for", "the", "with", "show", "find", "have", "some", "tell", "give", "what", "any", "about", "are", "there"].includes(t));

            if (queryTokens.length > 0) {
              const scored = liveListings.map((job) => {
                let score = 0;
                const titleL = (job.title || "").toLowerCase();
                const compL = (job.company || "").toLowerCase();
                const locL = (job.location || "").toLowerCase();
                const skillsL = (job.skills_required || []).map((s) => s.toLowerCase());

                for (let i = 0; i < queryTokens.length - 1; i++) {
                  const bigram = `${queryTokens[i]} ${queryTokens[i + 1]}`;
                  if (titleL.includes(bigram)) score += 120;
                }

                for (const token of queryTokens) {
                  if (titleL.includes(token)) score += 40;
                  if (compL.includes(token)) score += 50;
                  if (locL.includes(token)) score += 20;
                  if (skillsL.some((s) => s.includes(token))) score += 30;
                }
                return { job, score };
              });

              matchedJobs = scored
                .filter((s) => s.score >= 25)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((s) => s.job);
            }
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            recommendedJobs: matchedJobs.length > 0 ? matchedJobs : undefined,
          };
          setMessages((prev) => [...prev, aiMsg]);
          return;
        }
      }
    } catch (err) {
      console.warn("LLM Chat API request failed, falling back to local NLP engine:", err);
    }

    // 5. LOCAL DETERMINISTIC FALLBACK ENGINE (If offline or LLM unavailable)
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "";
      let foundJobs: Listing[] = [];

      const trimmedLower = lower.trim().replace(/[?!.,]/g, "");
      const isGreeting =
        /^(hi+|hey+|hello+|yo|howdy|sup|hola|greetings|what'?s\s+up|good\s+(morning|afternoon|evening|day))$/i.test(trimmedLower) ||
        /^(hi+|hey+|hello+|yo)\s+(sift|ai|there|bot|siftrole)/i.test(trimmedLower);

      const isHowAreYou =
        /^(how\s+are\s+you|how's\s+it\s+going|how\s+are\s+you\s+doing|how\s+do\s+you\s+do|how\s+are\s+things)/i.test(trimmedLower);

      const isWhoAreYou =
        /^(who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|introduce\s+yourself|help(\s+me)?)$/i.test(trimmedLower) ||
        lower.includes("what can you do") ||
        lower.includes("how can you help");

      const isThanks =
        /^(thanks|thank\s+you|thx|ty|awesome|cool|great|nice|ok|okay|got\s+it|perfect|sweet|good\s+job)$/i.test(trimmedLower);

      const isGoodbye =
        /^(bye|goodbye|see\s+ya|see\s+you|later|cya|take\s+care)$/i.test(trimmedLower);

      const currentHour = new Date().getHours();
      let timeOfDay = "day";
      if (currentHour >= 5 && currentHour < 12) timeOfDay = "morning";
      else if (currentHour >= 12 && currentHour < 17) timeOfDay = "afternoon";
      else if (currentHour >= 17 && currentHour < 22) timeOfDay = "evening";
      else timeOfDay = "night";

      if (isGreeting) {
        if (messages.length > 2) {
          replyText = `👋 Hey again! What else can I help you find or prepare ${timeOfDay === "night" ? "tonight" : "this " + timeOfDay}?`;
        } else {
          replyText = `👋 Good ${timeOfDay}! How can I help with your job search?\n\nYou can:\n• Drop your resume here to extract skills & rank live roles\n• Search by role (e.g. 'remote backend internships', 'frontend new grad')\n• Explore companies (e.g. Stripe, Figma, Notion, Spotify)`;
        }
      } else if (isHowAreYou) {
        replyText = `I'm doing great and ready to help you discover verified tech roles ${timeOfDay === "night" ? "tonight" : "today"}! What kind of opportunities or tech stack are you looking for?`;
      } else if (isWhoAreYou) {
        replyText = "🤖 I'm **Sift AI**, your personal career intelligence copilot on Siftrole.\n\nHere is what I can do for you:\n• **Resume Matcher**: Drop your PDF or DOCX resume to extract technical skills and re-rank live roles by match score\n• **Direct Role Search**: Ask for specific roles (e.g. 'remote Python jobs', 'summer 2026 internships')\n• **Company Intelligence**: Explore verified openings across Stripe, OpenAI, Figma, Spotify, Linear, and more\n• **Recruiter Outreach**: Connect directly with hiring teams\n\nHow can I help you today?";
      } else if (isThanks) {
        replyText = "You're very welcome! Let me know if you want to explore more openings, check your match scores, or prepare recruiter outreach.";
      } else if (isGoodbye) {
        replyText = `Good luck with your applications! Have a wonderful ${timeOfDay === "night" ? "rest of your night" : timeOfDay}, and check back anytime as our feeds sync continuously.`;
      } else if (
        lower.includes("what is siftrole") ||
        lower.includes("how does siftrole work") ||
        lower.includes("about siftrole")
      ) {
        replyText = "✨ **About Siftrole**: Siftrole is the central hub and ultimate application checklist for tech jobs and internships. We bring verified openings from official company career streams into one place with zero ghost jobs.";
      } else {
        // Multi-token search for candidate role query
        const queryTokens = lower
          .replace(/[?!.,;:()\[\]{}"']/g, " ")
          .split(/\s+/)
          .filter((t) => t.length > 2 && !["searching", "looking", "for", "the", "with", "show", "find", "have", "some", "tell", "give", "what", "any", "about", "are", "there"].includes(t));

        if (queryTokens.length > 0) {
          const scored = liveListings.map((job) => {
            let score = 0;
            const titleL = (job.title || "").toLowerCase();
            const compL = (job.company || "").toLowerCase();
            const locL = (job.location || "").toLowerCase();
            const skillsL = (job.skills_required || []).map((s) => s.toLowerCase());

            for (let i = 0; i < queryTokens.length - 1; i++) {
              const bigram = `${queryTokens[i]} ${queryTokens[i + 1]}`;
              if (titleL.includes(bigram)) score += 120;
            }

            for (const token of queryTokens) {
              if (titleL.includes(token)) score += 40;
              if (compL.includes(token)) score += 50;
              if (locL.includes(token)) score += 20;
              if (skillsL.some((s) => s.includes(token))) score += 30;
            }
            return { job, score };
          });

          foundJobs = scored
            .filter((s) => s.score >= 20)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((s) => s.job);
        }

        if (foundJobs.length > 0) {
          replyText = `🎯 Found **${foundJobs.length} verified role${foundJobs.length > 1 ? "s" : ""}** matching your search on Siftrole:`;
        } else {
          foundJobs = liveListings.slice(0, 3);
          replyText = "✨ Here are top active verified tech roles open right now across official feeds. You can search by specific titles, companies, or tech stacks anytime:";
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recommendedJobs: foundJobs.length > 0 ? foundJobs : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 450);
  };


  return (
    <div
      data-lenis-prevent="true"
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
      <div className="p-4 border-b border-neutral-100 bg-[#fbfaf8] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 relative flex items-center justify-center shrink-0">
            <Image
              src="/images/siftrole-logo.png"
              alt="Sift AI"
              width={28}
              height={28}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-black text-[#121816]">Sift AI</h3>
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
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-1.5 text-xs font-bold text-[#121816] shadow-2xs transition cursor-pointer"
        >
          <Paperclip className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden sm:inline">Drop Resume</span>
        </button>
      </div>

      {/* Active Resume Status Bar */}
      {uploadedResumeName && (
        <div className="px-4 py-2 bg-[#18201c] text-white text-xs flex items-center justify-between gap-2 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-3.5 h-3.5 text-[#84d64f] shrink-0" />
            <span className="truncate font-semibold text-[0.72rem] text-neutral-200">
              <span className="text-white font-bold">{uploadedResumeName}</span> attached
            </span>
          </div>
          <button
            onClick={onClearResume}
            className="text-[0.68rem] text-neutral-400 hover:text-white hover:underline font-bold shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Messages Feed */}
      <div
        ref={messagesContainerRef}
        data-lenis-prevent="true"
        tabIndex={0}
        className="flex-1 min-h-0 p-4 overflow-y-auto overscroll-contain space-y-4 text-xs scroll-smooth focus:outline-none"
        style={{
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
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
              <div>{renderFormattedMessage(m.text, m.sender === "user")}</div>

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
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#55615b] block">
                      Top Previews ({Math.min(3, m.recommendedJobs.length)}{m.totalMatchesCount ? ` of ${m.totalMatchesCount}` : ""}):
                    </span>
                  </div>
                  {m.recommendedJobs.map((j) => (
                    <Link
                      key={j.id || j.title}
                      href={`/jobs/${j.id}`}
                      onClick={(e) => {
                        if (onSelectListing) {
                           e.preventDefault();
                          onSelectListing(j);
                        }
                      }}
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

                  {/* View All Matching Roles on Main Checklist Button */}
                  {m.filterQuery && (
                    <button
                      onClick={() => {
                        onFilterBySearch(m.filterQuery!);
                        const el = document.getElementById("jobs-feed-section") || document.getElementById("jobs-filter-section");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="w-full mt-2 rounded-xl bg-[#eef8e5] hover:bg-[#84d64f] border border-[#cce8be] hover:border-[#84d64f] p-2.5 text-[0.72rem] font-black text-[#14281a] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group active:scale-[0.98]"
                    >
                      <span>
                        View all {m.totalMatchesCount || m.recommendedJobs.length} roles on main checklist
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#3c7818] group-hover:text-[#14281a] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              )}

              {/* Account Registration Action Button */}
              {m.requiresAuth && (
                <div className="mt-3 pt-2.5 border-t border-neutral-300/60">
                  <Link
                    href="/login?mode=signup"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#84d64f] hover:bg-[#75c73d] px-3.5 py-2 text-xs font-black text-[#14281a] shadow-xs transition active:scale-[0.98] cursor-pointer"
                  >
                    <span>Create Free Account / Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#14281a]" />
                  </Link>
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
        data-lenis-prevent="true"
        className="px-3 py-2 border-t border-neutral-100 bg-[#fbfaf8] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0"
        style={{ overscrollBehavior: "contain" }}
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
