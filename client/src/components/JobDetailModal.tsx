"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Calendar,
  Share2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Check,
  CheckCircle2,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Listing } from "@/components/SiftAiChat";
import { parseJobDescription } from "@/lib/parseJobDescription";

interface JobDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  activeResumeSkills?: string[];
  onApplyClick?: (listing: Listing) => void;
}

export function JobDetailModal({
  listing,
  onClose,
  activeResumeSkills = [],
  onApplyClick,
}: JobDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "responsibilities" | "qualifications" | "benefits">("overview");
  const [showFullRaw, setShowFullRaw] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!listing) return null;

  const parsed = parseJobDescription(listing.raw_jd_text);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}/jobs?jobId=${listing.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (_) {}
  };

  // Compute resume match if resume skills are present
  const computeResumeMatch = () => {
    if (!activeResumeSkills || activeResumeSkills.length === 0) return null;
    const jobSkills = listing.skills_required || [];
    const matched = jobSkills.filter((s) =>
      activeResumeSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
    );
    const missing = jobSkills.filter(
      (s) => !activeResumeSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
    );

    const skillRatio = jobSkills.length > 0 ? matched.length / jobSkills.length : 0.6;
    let bonus = 0;
    const jobTitleL = listing.title.toLowerCase();
    const jobJdL = ((listing.raw_jd_text || "") + " " + (listing.job_description || "")).toLowerCase();

    const extraSkillHits = activeResumeSkills.filter(
      (s) => jobJdL.includes(s.toLowerCase()) || jobTitleL.includes(s.toLowerCase())
    ).length;

    if (extraSkillHits >= 3) bonus += 8;
    else if (extraSkillHits >= 1) bonus += 4;

    const baseScore = Math.round(55 + skillRatio * 38 + bonus);
    const score = Math.min(99, Math.max(45, baseScore));

    return {
      score,
      matchedCount: matched.length,
      totalCount: jobSkills.length,
      matchedSkills: matched,
      missingSkills: missing,
    };
  };

  const resumeMatch = computeResumeMatch();

  // Format deadline if available
  const formattedDeadline = (() => {
    if (!listing.deadline) return null;
    try {
      const d = new Date(listing.deadline);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch (_) {}
    return listing.deadline;
  })();

  return (
    <div
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      style={{ overscrollBehavior: "contain" }}
      onClick={onClose}
    >
      <div
        data-lenis-prevent="true"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] sm:rounded-[28px] max-w-[740px] w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200/90 focus:outline-none overflow-hidden"
        style={{ overscrollBehavior: "contain" }}
      >
        {/* ======================================================== */}
        {/* 1. HEADER */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-7 pb-4 border-b border-[#eadecc] bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#faf8f5] border border-[#eadecc] flex items-center justify-center p-2.5 shrink-0 shadow-xs">
                <CompanyLogo company={listing.company} size="lg" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#008561]">
                    {listing.company}
                  </span>
                  <span className="rounded-full bg-[#00D793]/15 border border-[#00D793]/40 text-[#083D2E] text-[0.65rem] font-bold px-2.5 py-0.5 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#008561]" /> Verified Official ATS Feed
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-lora font-bold text-[#02110c] tracking-tight mt-1 leading-snug break-words">
                  {listing.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="h-9 w-9 rounded-full bg-[#faf8f5] hover:bg-white border border-[#eadecc] flex items-center justify-center text-[#495e54] hover:text-[#02110c] text-sm font-bold transition shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Key Attribute Pills Bar */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#02110c]">
            {listing.location && (
              <div className="flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-xl px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#008561]" />
                <span className="truncate max-w-[220px]">{listing.location}</span>
              </div>
            )}
            {listing.employment_type && (
              <div className="flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-xl px-3 py-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#008561]" />
                <span>{listing.employment_type}</span>
              </div>
            )}
            {listing.stipend_or_salary && (
              <div className="flex items-center gap-1.5 bg-[#00D793]/15 border border-[#00D793]/40 text-[#083D2E] rounded-xl px-3 py-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#008561]" />
                <span>{listing.stipend_or_salary}</span>
              </div>
            )}
            {listing.experience_level && (
              <div className="flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-xl px-3 py-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#008561]" />
                <span>{listing.experience_level}</span>
              </div>
            )}
            {formattedDeadline && (
              <div className="flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] text-[#02110c] rounded-xl px-3 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#008561]" />
                <span>Deadline: {formattedDeadline}</span>
              </div>
            )}
            {listing.eligibility && (
              <div className="flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] text-[#008561] rounded-xl px-3 py-1.5">
                <Award className="w-3.5 h-3.5 text-[#008561]" />
                <span className="truncate max-w-[240px]">{listing.eligibility}</span>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SCROLLABLE CONTENT BODY */}
        {/* ======================================================== */}
        <div
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-7 space-y-6"
          style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
        >
          {/* Resume Match Breakdown */}
          {resumeMatch && (
            <div className="rounded-2xl border border-[#008561]/30 bg-[#faf8f5] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#008561]" />
                  <span className="text-xs font-black text-[#02110c]">
                    AI Compatibility Score: {resumeMatch.score}%
                  </span>
                </div>
                <span className="text-[0.68rem] font-bold text-[#008561]">
                  {resumeMatch.matchedCount} of {resumeMatch.totalCount} Skills Matched
                </span>
              </div>

              {resumeMatch.matchedSkills.length > 0 && (
                <div className="mt-3">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#008561] block mb-1.5">
                    Matching Skills on Your Resume:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeMatch.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-white text-[#008561] border border-[#008561]/30 px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-[#008561]" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resumeMatch.missingSkills.length > 0 && (
                <div className="mt-3">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-amber-800 block mb-1.5">
                    Skills to Highlight or Add:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeMatch.missingSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-amber-500/10 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Role Summary / Overview */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#495e54] mb-2.5 flex items-center gap-1.5">
              <span>About the Role & Mission</span>
            </h4>
            <div className="rounded-2xl bg-[#faf8f5] border border-[#eadecc] p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-[#02110c]">
              {parsed.summary || (
                <p>
                  This position is actively hiring at <strong className="text-[#02110c]">{listing.company}</strong>. Applications are submitted directly to the verified employer portal without third-party recruitment agencies.
                </p>
              )}
            </div>
          </div>

          {/* Section: Key Responsibilities */}
          {parsed.responsibilities.length > 0 && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#495e54] mb-3">
                Key Responsibilities
              </h4>
              <div className="space-y-2.5">
                {parsed.responsibilities.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#02110c] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#008561] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Qualifications & Eligibility */}
          {parsed.qualifications.length > 0 && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#495e54] mb-3">
                Qualifications & Requirements
              </h4>
              <div className="space-y-2.5">
                {parsed.qualifications.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#02110c] leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#008561] shrink-0 mt-2" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Benefits & Perks */}
          {parsed.benefits.length > 0 && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#495e54] mb-3">
                Benefits & Compensation Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsed.benefits.map((b, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl bg-[#008561]/10 text-[#008561] border border-[#008561]/20 px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-[#008561]" /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: Required Skills & Tech Stack */}
          {listing.skills_required && listing.skills_required.length > 0 && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#495e54] mb-3">
                Required Skills & Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {listing.skills_required.map((s) => (
                  <span
                    key={s}
                    className="rounded-xl bg-[#008561]/10 text-[#008561] font-bold text-xs px-3 py-1.5 border border-[#008561]/25"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fallback Unstructured Clean Description if no sections matched */}
          {!parsed.hasStructuredData && parsed.cleanDescription && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#495e54] mb-2.5">
                Full Role Details
              </h4>
              <div className="rounded-2xl bg-[#faf8f5] border border-[#eadecc] p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-[#02110c] whitespace-pre-line max-h-[300px] overflow-y-auto">
                {parsed.cleanDescription}
              </div>
            </div>
          )}

          {/* Expandable Official Posting Notes */}
          {parsed.cleanDescription && parsed.hasStructuredData && (
            <div className="pt-2 border-t border-[#eadecc]">
              <button
                type="button"
                onClick={() => setShowFullRaw(!showFullRaw)}
                className="text-xs font-bold text-[#008561] hover:text-[#02110c] inline-flex items-center gap-1 cursor-pointer"
              >
                {showFullRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showFullRaw ? "Hide Full Posting Text" : "View Full Career Posting Text"}
              </button>

              {showFullRaw && (
                <div className="mt-3 rounded-2xl bg-[#faf8f5] border border-[#eadecc] p-4 text-xs leading-relaxed text-[#495e54] whitespace-pre-line max-h-[260px] overflow-y-auto">
                  {parsed.cleanDescription}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. STICKY ACTION FOOTER */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-6 border-t border-[#eadecc] bg-white flex items-center justify-between gap-3">
          <button
            onClick={handleShare}
            className="rounded-xl border border-[#eadecc] bg-[#faf8f5] hover:bg-white px-4 py-3 text-xs font-bold text-[#02110c] inline-flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#008561]" />
            {copiedLink ? "Link Copied!" : "Share Link"}
          </button>

          <a
            href={listing.apply_url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onApplyClick && onApplyClick(listing)}
            className="flex-1 text-center rounded-full bg-[#008561] hover:bg-[#006e50] text-white py-3.5 font-bold text-sm shadow-[0_8px_20px_rgba(0,133,97,0.25)] transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            Apply on Official Portal
            <ExternalLink className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
}
