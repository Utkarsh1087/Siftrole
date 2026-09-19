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
        <div className="p-6 sm:p-7 pb-4 border-b border-neutral-100 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-center p-2.5 shrink-0 shadow-xs">
                <CompanyLogo company={listing.company} size="lg" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#3c7818]">
                    {listing.company}
                  </span>
                  <span className="rounded-full bg-[#eef8e5] border border-[#cce8be] text-[#2d6113] text-[0.65rem] font-bold px-2.5 py-0.5 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#3c7818]" /> Verified Official ATS Feed
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#121816] tracking-tight mt-1 leading-snug break-words">
                  {listing.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="h-9 w-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 text-sm font-bold transition shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Key Attribute Pills Bar */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#14281a]">
            {listing.location && (
              <div className="flex items-center gap-1.5 bg-[#f6f5f2] border border-neutral-200/80 rounded-xl px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#79857f]" />
                <span className="truncate max-w-[220px]">{listing.location}</span>
              </div>
            )}
            {listing.employment_type && (
              <div className="flex items-center gap-1.5 bg-[#f6f5f2] border border-neutral-200/80 rounded-xl px-3 py-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#79857f]" />
                <span>{listing.employment_type}</span>
              </div>
            )}
            {listing.stipend_or_salary && (
              <div className="flex items-center gap-1.5 bg-[#eef8e5] border border-[#cce8be] text-[#24580d] rounded-xl px-3 py-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#3c7818]" />
                <span>{listing.stipend_or_salary}</span>
              </div>
            )}
            {listing.experience_level && (
              <div className="flex items-center gap-1.5 bg-[#f6f5f2] border border-neutral-200/80 rounded-xl px-3 py-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#79857f]" />
                <span>{listing.experience_level}</span>
              </div>
            )}
            {formattedDeadline && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Deadline: {formattedDeadline}</span>
              </div>
            )}
            {listing.eligibility && (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-3 py-1.5">
                <Award className="w-3.5 h-3.5 text-blue-700" />
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
            <div className="rounded-2xl border border-[#84d64f]/50 bg-[#f4faee] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3c7818]" />
                  <span className="text-xs font-black text-[#14281a]">
                    AI Compatibility Score: {resumeMatch.score}%
                  </span>
                </div>
                <span className="text-[0.68rem] font-bold text-[#2d6113]">
                  {resumeMatch.matchedCount} of {resumeMatch.totalCount} Skills Matched
                </span>
              </div>

              {resumeMatch.matchedSkills.length > 0 && (
                <div className="mt-3">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#2d6113] block mb-1.5">
                    Matching Skills on Your Resume:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeMatch.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-[#d7f3be] text-[#1e480d] border border-[#84d64f] px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-[#1e480d]" /> {s}
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
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#79857f] mb-2.5 flex items-center gap-1.5">
              <span>About the Role & Mission</span>
            </h4>
            <div className="rounded-2xl bg-[#faf9f6] border border-neutral-200/70 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-[#35413c]">
              {parsed.summary || (
                <p>
                  This position is actively hiring at <strong className="text-[#121816]">{listing.company}</strong>. Applications are submitted directly to the verified employer portal without third-party recruitment agencies.
                </p>
              )}
            </div>
          </div>

          {/* Section: Key Responsibilities */}
          {parsed.responsibilities.length > 0 && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#79857f] mb-3">
                Key Responsibilities
              </h4>
              <div className="space-y-2.5">
                {parsed.responsibilities.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#35413c] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#3c7818] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Qualifications & Eligibility */}
          {parsed.qualifications.length > 0 && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#79857f] mb-3">
                Qualifications & Requirements
              </h4>
              <div className="space-y-2.5">
                {parsed.qualifications.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#35413c] leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3c7818] shrink-0 mt-2" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Benefits & Perks */}
          {parsed.benefits.length > 0 && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#79857f] mb-3">
                Benefits & Compensation Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsed.benefits.map((b, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl bg-[#f0fae8] text-[#24580d] border border-[#cce8be] px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-[#3c7818]" /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: Required Skills & Tech Stack */}
          {listing.skills_required && listing.skills_required.length > 0 && (
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#79857f] mb-3">
                Required Skills & Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {listing.skills_required.map((s) => (
                  <span
                    key={s}
                    className="rounded-xl bg-[#eef8e5] text-[#24580d] font-bold text-xs px-3 py-1.5 border border-[#cce8be]"
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
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#79857f] mb-2.5">
                Full Role Details
              </h4>
              <div className="rounded-2xl bg-[#faf9f6] border border-neutral-200/70 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-[#35413c] whitespace-pre-line max-h-[300px] overflow-y-auto">
                {parsed.cleanDescription}
              </div>
            </div>
          )}

          {/* Expandable Official Posting Notes */}
          {parsed.cleanDescription && parsed.hasStructuredData && (
            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowFullRaw(!showFullRaw)}
                className="text-xs font-bold text-[#3c7818] hover:text-[#2d6113] inline-flex items-center gap-1 cursor-pointer"
              >
                {showFullRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showFullRaw ? "Hide Full Posting Text" : "View Full Career Posting Text"}
              </button>

              {showFullRaw && (
                <div className="mt-3 rounded-2xl bg-[#faf9f6] border border-neutral-200/70 p-4 text-xs leading-relaxed text-[#55615b] whitespace-pre-line max-h-[260px] overflow-y-auto">
                  {parsed.cleanDescription}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. STICKY ACTION FOOTER */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-6 border-t border-neutral-100 bg-[#fdfdfc] flex items-center justify-between gap-3">
          <button
            onClick={handleShare}
            className="rounded-xl border border-neutral-200/90 hover:bg-neutral-100/80 px-4 py-3 text-xs font-bold text-[#14281a] inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? "Link Copied!" : "Share Link"}
          </button>

          <a
            href={listing.apply_url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onApplyClick && onApplyClick(listing)}
            className="flex-1 text-center rounded-full bg-[#84d64f] hover:bg-[#7ec942] text-[#14261b] py-3.5 font-heading font-extrabold text-sm shadow-[0_8px_20px_rgba(132,214,79,0.28)] transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            Apply on Official Portal
            <ExternalLink className="w-4 h-4 text-[#14261b]" />
          </a>
        </div>
      </div>
    </div>
  );
}
