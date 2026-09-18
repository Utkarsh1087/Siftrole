"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Send,
  RefreshCw,
  User,
  Building2,
  FileCode,
  Zap,
} from "lucide-react";
import { HRContact, markContactAsMailed } from "@/lib/hrContacts";
import { CompanyLogo } from "@/components/CompanyLogo";

interface ColdMailModalProps {
  contact: HRContact | null;
  onClose: () => void;
}

export function ColdMailModal({ contact, onClose }: ColdMailModalProps) {
  const [candidateName, setCandidateName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [background, setBackground] = useState("");
  const [highlight, setHighlight] = useState("");
  const [tone, setTone] = useState("concise-human");

  const [generatedSubject, setGeneratedSubject] = useState("");
  const [generatedBody, setGeneratedBody] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!contact) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Set default target role from contact hiring list
    const initialRole = contact.hiring_for[0] || "";
    setTargetRole(initialRole);

    let initialName = "";
    let initialBackground = "";
    let initialHighlight = "";

    // 1. First priority: Check parsed resume
    try {
      const storedResume = localStorage.getItem("siftrole_parsed_resume");
      if (storedResume) {
        const resume = JSON.parse(storedResume);
        if (resume.candidateName || resume.name) {
          initialName = resume.candidateName || resume.name;
        }

        const degree =
          resume.degree ||
          resume.education?.[0]?.degree ||
          (resume.education?.[0]?.major ? `Degree in ${resume.education[0].major}` : "");
        const gradYear =
          resume.graduationYear ||
          resume.grad_year ||
          resume.education?.[0]?.graduationYear ||
          resume.education?.[0]?.grad_year;

        if (degree) {
          initialBackground = `${degree}${gradYear ? ` (Graduating ${gradYear})` : ""}`;
        } else if (resume.headline) {
          initialBackground = resume.headline;
        } else if (resume.summary) {
          initialBackground = resume.summary.slice(0, 100);
        }

        if (resume.projects && resume.projects.length > 0) {
          const p = resume.projects[0];
          initialHighlight = p.name
            ? `${p.name}${p.description ? `: ${p.description}` : ""}`
            : p.description || "";
        } else if (resume.experience && resume.experience.length > 0) {
          const exp = resume.experience[0];
          initialHighlight = `${exp.role || "Role"} at ${exp.company || "company"}`;
        }
      }
    } catch {}

    // 2. Fallback to user profile if not in resume
    try {
      const storedUser = localStorage.getItem("siftrole_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (!initialName && u.name && u.name !== "Candidate") {
          initialName = u.name;
        }
        if (!initialBackground && u.degree) {
          initialBackground = `${u.degree}${u.grad_year ? ` (Class of ${u.grad_year})` : ""}`;
        }
      }
    } catch {}

    setCandidateName(initialName);
    setBackground(initialBackground);
    setHighlight(initialHighlight);

    // Auto-generate initial draft with resolved parameters
    handleGenerate(initialRole, initialName, initialBackground, initialHighlight);

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [contact]);

  const handleGenerate = async (
    overrideRole?: string,
    overrideName?: string,
    overrideBackground?: string,
    overrideHighlight?: string
  ) => {
    if (!contact) return;
    setIsGenerating(true);
    setCopied(false);

    const activeRole = overrideRole || targetRole || contact.hiring_for?.[0] || "";
    const activeName = overrideName !== undefined ? overrideName : candidateName;
    const activeBackground = overrideBackground !== undefined ? overrideBackground : background;
    const activeHighlight = overrideHighlight !== undefined ? overrideHighlight : highlight;

    try {
      const res = await fetch("/api/ai/cold-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruiterName: contact.name,
          recruiterEmail: contact.email,
          company: contact.company,
          roleAppliedFor: activeRole,
          userCandidateName: activeName || "Candidate",
          userBackground: activeBackground || "",
          keyHighlight: activeHighlight || "",
          tone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedSubject(data.subject);
        setGeneratedBody(data.body);
        setMailtoUrl(data.mailtoUrl);
      }
    } catch (e) {
      console.error("Failed to generate cold email:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `Subject: ${generatedSubject}\n\n${generatedBody}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (contact?.id) {
        markContactAsMailed(contact.id);
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!contact) return null;

  return (
    <div
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      style={{ overscrollBehavior: "contain" }}
    >
      <div
        data-lenis-prevent="true"
        tabIndex={0}
        onWheel={(e) => e.stopPropagation()}
        className="bg-white rounded-[28px] max-w-[760px] w-full max-h-[90vh] overflow-y-auto overscroll-contain border border-neutral-200 shadow-2xl p-6 sm:p-8 relative focus:outline-none scrollbar-thin"
        style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-neutral-100">
          <div className="flex items-center gap-3.5">
            <CompanyLogo company={contact.company} size="md" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3c7818]">
                  AI Outreach Drafter
                </span>
                <span className="rounded-full bg-[#eef8e5] border border-[#cce8be] text-[#14281a] text-[0.68rem] font-black px-2.5 py-0.5 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#58a826]" /> Groq AI Human Mode
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#121816] mt-0.5">
                Draft Cold Mail for {contact.name}
              </h3>
              <p className="text-xs text-[#55615b] mt-0.5">
                {contact.title} at <span className="font-bold text-[#121816]">{contact.company}</span> &bull; {contact.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-sm font-bold transition shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 text-[#55615b]" />
          </button>
        </div>

        {/* Customization Inputs Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#f8f7f5] p-4 rounded-2xl border border-neutral-200/80">
          <div>
            <label className="block text-[0.7rem] font-black uppercase tracking-wider text-[#55615b] mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#121816] outline-none focus:border-[#84d64f]"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-black uppercase tracking-wider text-[#55615b] mb-1">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SWE Intern Summer 2026"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#121816] outline-none focus:border-[#84d64f]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[0.7rem] font-black uppercase tracking-wider text-[#55615b] mb-1">
              Key Highlight / Project Link
            </label>
            <input
              type="text"
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              placeholder="e.g. built a WebGL real-time renderer with 50k monthly users"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#121816] outline-none focus:border-[#84d64f]"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-[#79857f]">
              Generates a punchy, 3-5 sentence human-sounding email (under 100 words).
            </span>
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#14281a] hover:bg-[#1f3d27] text-[#84d64f] px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Drafting..." : "Regenerate Draft"}</span>
            </button>
          </div>
        </div>

        {/* AI Draft Preview Area */}
        <div className="mt-5 space-y-3">
          {/* Subject Line */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[0.7rem] font-black uppercase tracking-wider text-[#55615b]">
                Subject Line
              </label>
            </div>
            <input
              type="text"
              value={generatedSubject}
              onChange={(e) => setGeneratedSubject(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-[#fdfdfd] px-3.5 py-2.5 text-xs font-bold text-[#121816] outline-none focus:border-[#84d64f]"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[0.7rem] font-black uppercase tracking-wider text-[#55615b]">
                Email Body
              </label>
              <span className="text-[0.68rem] font-bold text-[#3c7818] bg-[#eef8e5] px-2 py-0.5 rounded-md">
                ~{generatedBody.split(/\s+/).filter(Boolean).length} words &bull; High Response Format
              </span>
            </div>
            <textarea
              rows={7}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              value={generatedBody}
              onChange={(e) => setGeneratedBody(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-[#fdfdfd] p-3.5 text-xs font-mono leading-relaxed text-[#24302a] outline-none focus:border-[#84d64f] overscroll-contain resize-none"
              style={{ overscrollBehavior: "contain" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 px-5 py-3 text-xs font-bold text-[#121816] transition shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#3c7818]" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#55615b]" />
                  <span>Copy Subject & Body</span>
                </>
              )}
            </button>
          </div>

          <a
            href={
              mailtoUrl ||
              `mailto:${contact.email}?subject=${encodeURIComponent(generatedSubject)}&body=${encodeURIComponent(generatedBody)}`
            }
            onClick={() => {
              if (contact?.id) {
                markContactAsMailed(contact.id);
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-7 py-3 text-xs sm:text-sm font-heading font-extrabold shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Open in Email App (Gmail/Mail)</span>
          </a>
        </div>

      </div>
    </div>
  );
}
