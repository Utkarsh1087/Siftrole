"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  GraduationCap,
  SlidersHorizontal,
  Clock,
  X,
  Share2,
  Bookmark,
  FileText,
  Sparkles,
  MessageSquare,
  Zap,
  CheckCircle2,
  Check,
  ChevronDown,
  Lock,
  RotateCcw,
} from "lucide-react";
import { CompanyLogo, getCompanyDomain } from "@/components/CompanyLogo";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";
import { NewsletterSection } from "@/components/NewsletterSection";
import { SiftAiChat, Listing } from "@/components/SiftAiChat";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";
import { JobDetailModal } from "@/components/JobDetailModal";
import { AuthGateModal } from "@/components/AuthGateModal";
import { useAppliedJobs } from "@/lib/appliedJobs";
import { useAuth } from "@/lib/useAuth";

const companyBrandStyles: Record<string, { bg: string; text: string; border: string }> = {
  Greenhouse: { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-200" },
  Lever: { bg: "bg-teal-500/10", text: "text-teal-700", border: "border-teal-200" },
  Ashby: { bg: "bg-indigo-500/10", text: "text-indigo-700", border: "border-indigo-200" },
  Figma: { bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-200" },
  Stripe: { bg: "bg-violet-500/10", text: "text-violet-700", border: "border-violet-200" },
  Spotify: { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-200" },
  Linear: { bg: "bg-slate-800/10", text: "text-slate-800", border: "border-slate-200" },
  Notion: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-200" },
  SmartRecruiters: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-200" },
};

function formatLocation(loc: string | null | undefined): string {
  if (!loc) return "Remote / Unspecified";
  const trimmed = loc.trim();
  if (/multiple locations/i.test(trimmed)) {
    const prefix = trimmed.split("(")[0].trim();
    return prefix ? `${prefix} (Multiple Locations)` : "Multiple Locations";
  }
  if (trimmed.length > 35) {
    const parts = trimmed.split(/[;,]/);
    if (parts.length > 1 && parts[0].trim().length >= 3) {
      return `${parts[0].trim()} +more`;
    }
    return trimmed.slice(0, 32) + "...";
  }
  return trimmed;
}

type QuickFilterKey = "internships" | "newgrad" | "remote" | "highmatch";

export default function JobsPage() {
  const [liveListings, setLiveListings] = useState<Listing[]>([]);
  const [companiesList, setCompaniesList] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedRoleType, setSelectedRoleType] = useState<string>("all");
  const [appliedFilter, setAppliedFilter] = useState<"all" | "saved" | "unapplied" | "applied">("all");
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<Set<QuickFilterKey>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [selectedListingModal, setSelectedListingModal] = useState<Listing | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [appliedToastJob, setAppliedToastJob] = useState<Listing | null>(null);
  const { appliedJobIds, savedJobIds, toggleApplied, toggleSaved, isApplied, isSaved } = useAppliedJobs();
  const { isLoggedIn } = useAuth();
  const [authGateConfig, setAuthGateConfig] = useState<{
    isOpen: boolean;
    title?: string;
    description?: string;
    badge?: string;
    primaryCta?: string;
  }>({ isOpen: false });

  const handleToggleAppliedWithAuth = (job: Listing, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isLoggedIn) {
      setAuthGateConfig({
        isOpen: true,
        title: "Sign in to Track Applications",
        description: "Create a free account or sign in to mark roles as applied, save your application history, and keep track of your career progress.",
        badge: "Free Instant Access",
        primaryCta: "Get Free Instant Access",
      });
      return;
    }
    toggleApplied(job, e);
  };

  const handleToggleSavedWithAuth = (job: Listing, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isLoggedIn) {
      setAuthGateConfig({
        isOpen: true,
        title: "Sign in to Bookmark Roles",
        description: "Create a free account or sign in to save verified job opportunities to your personal dashboard.",
        badge: "Sign In Required",
      });
      return;
    }
    toggleSaved(job, e);
  };

  // Resume Matching State with Local Storage persistence
  const [activeResumeSkills, setActiveResumeSkills] = useState<string[]>([]);
  const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const toggleQuickFilter = (key: QuickFilterKey) => {
    setSelectedQuickFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setCurrentPage(1);
  };

  const clearQuickFilters = () => {
    setSelectedQuickFilters(new Set());
    setCurrentPage(1);
  };

  // Load persistent resume skills on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSkills = localStorage.getItem("siftrole_resume_skills");
        const savedName = localStorage.getItem("siftrole_resume_filename");
        if (savedSkills) {
          const parsed = JSON.parse(savedSkills);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActiveResumeSkills(parsed);
            setUploadedResumeName(savedName || "My Resume.pdf");
          }
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (selectedListingModal || authGateConfig.isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedListingModal, authGateConfig.isOpen]);

  useEffect(() => {
    setCurrentPage(1);
    fetchListings();
  }, [selectedCompany, selectedRoleType, searchQuery, appliedFilter, selectedQuickFilters]);

  const fetchListings = async () => {
    setIsLoadingListings(true);
    try {
      const params = new URLSearchParams();
      if (selectedCompany !== "all") params.set("company", selectedCompany);
      if (selectedRoleType !== "all") params.set("roleType", selectedRoleType);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLiveListings(data.listings || []);
        if (data.companies?.length > 0) {
          setCompaniesList(data.companies);
        }
      }
    } catch (e) {
      console.error("Failed to fetch listings:", e);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const handleApplyResumeSkills = (skills: string[], fileName: string) => {
    setActiveResumeSkills(skills);
    setUploadedResumeName(fileName);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("siftrole_resume_skills", JSON.stringify(skills));
        localStorage.setItem("siftrole_resume_filename", fileName);
      } catch {}
    }
    setCurrentPage(1);
  };

  const handleClearResume = () => {
    setActiveResumeSkills([]);
    setUploadedResumeName(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("siftrole_resume_skills");
        localStorage.removeItem("siftrole_resume_filename");
        localStorage.removeItem("siftrole_parsed_resume");
      } catch {}
    }
  };

  const handleShare = (job: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(job.apply_url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleApplyClick = (job: Listing) => {
    setAppliedToastJob(job);
    setTimeout(() => {
      setAppliedToastJob((curr) => (curr?.id === job.id ? null : curr));
    }, 7000);
  };

  // Helper to compute multi-factor match score and skill breakdown for a job
  const getJobMatch = (job: Listing) => {
    if (activeResumeSkills.length === 0) return null;
    const jobSkills = job.skills_required || [];
    const matched = jobSkills.filter((s) =>
      activeResumeSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
    );
    const missing = jobSkills.filter(
      (s) => !activeResumeSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
    );

    // Multi-factor JD match calculation (skills + title & stack alignment)
    const skillRatio = jobSkills.length > 0 ? matched.length / jobSkills.length : 0.6;
    let bonus = 0;
    const jobTitleL = job.title.toLowerCase();
    const jobJdL = ((job.raw_jd_text || "") + " " + (job.job_description || "")).toLowerCase();

    // Check if candidate skills are directly mentioned in the JD body or title
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

  // Sort and filter listings
  const processedListings = React.useMemo(() => {
    let list = liveListings;

    // Filter by Application Status
    if (appliedFilter === "saved") {
      list = list.filter((job) => savedJobIds.has(job.id));
    } else if (appliedFilter === "unapplied") {
      list = list.filter((job) => !appliedJobIds.has(job.id));
    } else if (appliedFilter === "applied") {
      list = list.filter((job) => appliedJobIds.has(job.id));
    }

    // Filter by Quick Multi-Select Filters
    if (selectedQuickFilters.size > 0) {
      list = list.filter((job) => {
        const hasInternship = selectedQuickFilters.has("internships");
        const hasNewGrad = selectedQuickFilters.has("newgrad");

        const matchesInternship =
          (job.employment_type && job.employment_type.toLowerCase().includes("intern")) ||
          (job.title && job.title.toLowerCase().includes("intern")) ||
          (job.eligibility && job.eligibility.toLowerCase().includes("student"));

        const matchesNewGrad =
          (job.experience_level &&
            (job.experience_level.toLowerCase().includes("entry") ||
              job.experience_level.toLowerCase().includes("0-2") ||
              job.experience_level.toLowerCase().includes("grad"))) ||
          (job.title &&
            (job.title.toLowerCase().includes("grad") ||
              job.title.toLowerCase().includes("junior") ||
              job.title.toLowerCase().includes("associate")));

        // Early-career role type condition
        if (hasInternship && hasNewGrad) {
          if (!matchesInternship && !matchesNewGrad) return false;
        } else if (hasInternship) {
          if (!matchesInternship) return false;
        } else if (hasNewGrad) {
          if (!matchesNewGrad) return false;
        }

        // Remote condition
        if (selectedQuickFilters.has("remote")) {
          const isRemote = job.location && job.location.toLowerCase().includes("remote");
          if (!isRemote) return false;
        }

        // High fit match condition
        if (selectedQuickFilters.has("highmatch") && activeResumeSkills.length > 0) {
          const score = getJobMatch(job)?.score || 0;
          if (score < 80) return false;
        }

        return true;
      });
    }

    // Sort by Match Score if resume is uploaded
    if (activeResumeSkills.length === 0) return list;
    return [...list].sort((a, b) => {
      const scoreA = getJobMatch(a)?.score || 0;
      const scoreB = getJobMatch(b)?.score || 0;
      return scoreB - scoreA;
    });
  }, [liveListings, activeResumeSkills, appliedFilter, selectedQuickFilters, appliedJobIds, savedJobIds]);

  // Calculate Pagination Slices
  const totalListings = processedListings.length;
  const totalPages = Math.ceil(totalListings / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalListings);
  const currentListings = processedListings.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (!isLoggedIn && newPage > 1) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("siftrole_redirect_after_auth", window.location.pathname + window.location.search);
      }
      setAuthGateConfig({
        isOpen: true,
        title: `Unlock All ${totalListings}+ Verified Roles`,
        description: "Free account registration is required to discover openings past the first 10 roles, save your checklist, and use Sift AI matching.",
        badge: "Free Instant Access",
        primaryCta: "Unlock All Live Roles (Free)",
      });
      return;
    }
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  };

  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const handleResetAllFilters = () => {
    setSelectedCompany("all");
    setSelectedRoleType("all");
    setAppliedFilter("all");
    setSelectedQuickFilters(new Set());
    setSearchQuery("");
    handleClearResume();
  };

  const hasActiveFilters =
    selectedCompany !== "all" ||
    selectedRoleType !== "all" ||
    appliedFilter !== "all" ||
    selectedQuickFilters.size > 0 ||
    searchQuery.trim().length > 0 ||
    activeResumeSkills.length > 0;
    searchQuery.trim().length > 0 ||
    activeResumeSkills.length > 0;

  return (
    <main className="min-h-screen bg-[#fdfcf9] bg-canvas-white text-[#02110c] font-sans antialiased selection:bg-[#008561]/20 selection:text-[#02110c]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#008561]/8 via-transparent to-transparent blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-4 pb-20">
        
        {/* ======================================================== */}
        {/* TOP NAVBAR */}
        {/* ======================================================== */}
        <header className="sticky top-4 z-50 rounded-[20px] border border-[#eadecc] bg-white/95 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(2,17,12,0.04)] transition-all">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              {!isLoggedIn && (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#faf8f5] hover:bg-white border border-[#eadecc] px-3.5 py-2 text-xs font-lora font-bold text-[#02110c] transition"
                >
                  <ChevronLeft className="w-4 h-4 text-[#008561]" /> Home
                </Link>
              )}

              <Link href="/" className="flex items-center gap-2.5 group">
                <SiftroleLogoMark size={28} />
                <span className="font-bodoni-moda text-[1.85rem] font-extrabold italic tracking-[-0.02em] text-[#02110c]">
                  Sift<span className="text-[#008561] transition-colors group-hover:text-[#02110c]">role</span>
                </span>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-[1rem] font-lora font-medium text-[#083D2E]/85">
              <Link href="/jobs" className="text-[#083D2E] font-bold hover:text-[#008561] transition-colors">
                All Jobs
              </Link>
              <Link href="/cold-email" className="hover:text-[#083D2E] transition-colors">
                HR Outreach
              </Link>
              <Link href="/about" className="hover:text-[#083D2E] transition-colors">
                About
              </Link>
              <Link href="/#faq" className="hover:text-[#083D2E] transition-colors">
                FAQ
              </Link>
            </nav>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#00D793] hover:bg-[#00bf83] px-5 py-2.5 text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] shadow-md shadow-[#00D793]/25 transition active:scale-[0.98] inline-flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-3.5 h-3.5 text-[#083D2E]" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] hover:text-[#008561] px-3 py-2 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="rounded-full bg-[#00D793] hover:bg-[#00bf83] px-4 sm:px-5 py-2.5 text-xs sm:text-[0.92rem] font-lora font-bold text-[#083D2E] shadow-md shadow-[#00D793]/25 transition active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    Sign Up <ArrowRight className="w-3.5 h-3.5 text-[#083D2E]" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* HERO TITLE HEADER */}
        {/* ======================================================== */}
        <section className="mt-8 sm:mt-12 pb-4">
          <div>
            <h1 className="font-pochaevsk text-[3rem] sm:text-[4.2rem] leading-[1.05] tracking-[-0.02em] text-[#02110c]">
              Explore Verified Tech Roles
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-[#495e54] max-w-[680px]">
              Browse real-time open positions parsed with AI and synced continuously across official top tech company feeds.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEARCH & FILTERS CONTROLS BAR */}
        {/* ======================================================== */}
        <section className="mb-6 rounded-[24px] border border-[#eadecc] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(2,17,12,0.03)] space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#495e54]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role title, technical skill, technology, or keywords..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-[#eadecc] bg-[#faf8f5] hover:border-[#008561]/40 focus:bg-white focus:border-[#008561] outline-none text-[#02110c] font-medium transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#495e54] hover:text-[#02110c] p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters Group */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Company Select */}
              <div className="relative flex-1 sm:flex-none sm:min-w-[150px]">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#eadecc] bg-white hover:bg-[#faf8f5] hover:border-[#008561] pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#02110c] shadow-2xs outline-none transition focus:border-[#008561] cursor-pointer"
                >
                  <option value="all">All Companies ({companiesList.length || 6})</option>
                  {companiesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#495e54] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Role Type Select */}
              <div className="relative flex-1 sm:flex-none sm:min-w-[140px]">
                <select
                  value={selectedRoleType}
                  onChange={(e) => setSelectedRoleType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#eadecc] bg-white hover:bg-[#faf8f5] hover:border-[#008561] pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#02110c] shadow-2xs outline-none transition focus:border-[#008561] cursor-pointer"
                >
                  <option value="all">All Role Types</option>
                  <option value="FullTime">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#495e54] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Application & Bookmark Status Filter */}
              <div className="relative">
                <select
                  value={appliedFilter}
                  onChange={(e) => setAppliedFilter(e.target.value as "all" | "saved" | "unapplied" | "applied")}
                  className="appearance-none rounded-xl border border-[#eadecc] bg-white hover:bg-[#faf8f5] hover:border-[#008561] pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#02110c] shadow-2xs outline-none transition focus:border-[#008561] cursor-pointer"
                >
                  <option value="all">Status: All Roles</option>
                  <option value="saved">Status: Saved Shortlist ({savedJobIds.size})</option>
                  <option value="unapplied">Status: Not Applied Yet</option>
                  <option value="applied">Status: Applied ({appliedJobIds.size})</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#495e54] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetAllFilters}
                  className="rounded-xl bg-[#faf8f5] hover:bg-white border border-[#eadecc] text-[#02110c] px-3 py-2.5 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                  title="Reset all search queries and active filters"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#495e54]" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Early-Career Pill Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[0.72rem] font-bold text-[#495e54]/70 uppercase tracking-wider shrink-0 mr-1">
              Quick:
            </span>
            <button
              onClick={clearQuickFilters}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedQuickFilters.size === 0
                  ? "bg-[#008561] text-white shadow-xs font-black"
                  : "bg-white border border-[#eadecc] text-[#495e54] hover:border-[#008561] hover:text-[#02110c]"
              }`}
            >
              All Openings
            </button>
            <button
              onClick={() => toggleQuickFilter("internships")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                selectedQuickFilters.has("internships")
                  ? "bg-[#008561] text-white shadow-xs font-black"
                  : "bg-white border border-[#eadecc] text-[#495e54] hover:border-[#008561] hover:text-[#02110c]"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Internships (Summer 2026)</span>
              {selectedQuickFilters.has("internships") && (
                <Check className="w-3 h-3 text-white stroke-[3]" />
              )}
            </button>
            <button
              onClick={() => toggleQuickFilter("newgrad")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                selectedQuickFilters.has("newgrad")
                  ? "bg-[#008561] text-white shadow-xs font-black"
                  : "bg-white border border-[#eadecc] text-[#495e54] hover:border-[#008561] hover:text-[#02110c]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>New Grad (2026)</span>
              {selectedQuickFilters.has("newgrad") && (
                <Check className="w-3 h-3 text-white stroke-[3]" />
              )}
            </button>
            <button
              onClick={() => toggleQuickFilter("remote")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                selectedQuickFilters.has("remote")
                  ? "bg-[#008561] text-white shadow-xs font-black"
                  : "bg-white border border-[#eadecc] text-[#495e54] hover:border-[#008561] hover:text-[#02110c]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Remote Only</span>
              {selectedQuickFilters.has("remote") && (
                <Check className="w-3 h-3 text-white stroke-[3]" />
              )}
            </button>
            {activeResumeSkills.length > 0 && (
              <button
                onClick={() => toggleQuickFilter("highmatch")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                  selectedQuickFilters.has("highmatch")
                    ? "bg-[#008561] text-white shadow-xs font-black"
                    : "bg-[#faf8f5] border border-[#eadecc] text-[#02110c] hover:bg-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>High Fit (80%+)</span>
                {selectedQuickFilters.has("highmatch") && (
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                )}
              </button>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* RESUME MATCH ACTIVE NOTIFICATION BANNER */}
        {/* ======================================================== */}
        {uploadedResumeName && (
          <div className="mb-6 rounded-2xl border border-[#eadecc] bg-white p-4 sm:px-5 text-[#02110c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_2px_12px_rgba(2,17,12,0.03)]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#faf8f5] border border-[#eadecc] flex items-center justify-center text-[#02110c] shrink-0">
                <FileText className="w-4 h-4 text-[#008561]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#02110c]">
                  Resume Matched: <span className="font-extrabold text-[#02110c]">{uploadedResumeName}</span>
                </h4>
                <p className="text-xs text-[#495e54] mt-0.5">
                  Job feed is sorted by compatibility percentage with your stack ({activeResumeSkills.slice(0, 5).join(", ")}...).
                </p>
              </div>
            </div>

            <button
              onClick={handleClearResume}
              className="rounded-xl border border-[#eadecc] hover:border-[#008561] hover:bg-[#faf8f5] text-[#495e54] hover:text-[#02110c] px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer"
            >
              Clear Match
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN GRID: LISTINGS (LEFT) + SIFT AI CHAT (RIGHT) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: LISTINGS FEED + PAGINATION */}
          {/* ======================================================== */}
          <div id="jobs-feed-section" className="lg:col-span-8 space-y-4">
            {isLoadingListings ? (
              <div className="py-24 text-center bg-white rounded-[26px] border border-[#eadecc] text-[#495e54]">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#008561] border-t-transparent mb-3" />
                <p className="text-xs font-bold">Querying live verified database...</p>
              </div>
            ) : currentListings.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[26px] border border-[#eadecc] p-8">
                <Briefcase className="w-12 h-12 text-[#495e54]/50 mx-auto mb-3" />
                <h3 className="font-extrabold text-base text-[#02110c]">No matching roles found</h3>
                <p className="text-xs text-[#495e54] mt-1 max-w-[340px] mx-auto">
                  Try clearing your filters or searching with different keywords.
                </p>
                <button
                  onClick={handleResetAllFilters}
                  className="mt-4 rounded-full bg-[#008561] hover:bg-[#006e50] text-white text-xs font-bold px-5 py-2.5 shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All Filters
                </button>
              </div>
            ) : (
              currentListings.map((job, idx) => {
                const matchInfo = getJobMatch(job);
                const applied = isApplied(job.id);
                const saved = isSaved(job.id);
                return (
                  <div
                    key={job.id || job.raw_jd_hash || idx}
                    onClick={() => setSelectedListingModal(job)}
                    className={`group rounded-2xl border p-5 sm:p-6 shadow-[0_2px_12px_rgba(2,17,12,0.03)] transition-all duration-150 hover:border-[#008561] hover:shadow-md cursor-pointer relative ${
                      applied ? "border-[#008561] bg-[#faf8f5]" : "border-[#eadecc] bg-white"
                    }`}
                  >
                    {/* Top Row: Company Logo & Name & Verified Badge, Actions */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                        <CompanyLogo
                          company={job.company}
                          size="sm"
                          className="!h-6 !w-6 !p-0.5 rounded-md border border-[#eadecc] bg-white shadow-none shrink-0"
                        />
                        <span className="text-xs sm:text-sm font-bold text-[#02110c] tracking-tight truncate">
                          {job.company}
                        </span>
                        <span className="rounded-full bg-[#00D793]/15 text-[#083D2E] text-[0.65rem] font-bold px-2.5 py-0.5 border border-[#00D793]/40 inline-flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-[#008561]" /> Verified
                        </span>

                        {matchInfo && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#008561] text-white text-[0.65rem] font-extrabold px-2.5 py-0.5 shadow-2xs shrink-0">
                            <Sparkles className="w-3 h-3 text-white" />
                            {matchInfo.score}% Match
                          </span>
                        )}
                      </div>

                      {/* Bookmark & Apply Actions */}
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleSavedWithAuth(job, e)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                            saved
                              ? "bg-[#02110c] text-white border-[#02110c]"
                              : "bg-white border-[#eadecc] text-[#495e54] hover:text-[#02110c] hover:border-[#008561]"
                          }`}
                          title={saved ? "Saved" : "Save"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-white" : ""}`} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleToggleAppliedWithAuth(job, e)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-bold transition-all shadow-2xs cursor-pointer ${
                            applied
                              ? "bg-[#008561] text-white"
                              : "border border-[#eadecc] bg-[#faf8f5] hover:border-[#008561] hover:text-[#02110c] hover:bg-white text-[#495e54]"
                          }`}
                        >
                          {applied ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              <span>Applied</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 text-[#495e54]" />
                              <span>Mark Applied</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Second Row: Job Title */}
                    <h3 className="font-lora text-xl sm:text-[1.35rem] font-bold text-[#02110c] tracking-tight group-hover:text-[#008561] transition-colors leading-snug mb-3 line-clamp-2">
                      {job.title}
                    </h3>

                    {/* Third Row: Key Important Details Pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-3.5">
                      {/* Location */}
                      <div className="inline-flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-lg px-2.5 py-1 text-xs font-medium text-[#02110c]">
                        <MapPin className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                        <span className="truncate max-w-[240px]">{formatLocation(job.location)}</span>
                      </div>

                      {/* Employment Type */}
                      {job.employment_type && (
                        <div className="inline-flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-lg px-2.5 py-1 text-xs font-medium text-[#02110c]">
                          <Briefcase className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                          <span>{job.employment_type}</span>
                        </div>
                      )}

                      {/* Salary */}
                      {job.stipend_or_salary && (
                        <div className="inline-flex items-center gap-1.5 bg-[#00D793]/15 border border-[#00D793]/40 text-[#083D2E] rounded-lg px-2.5 py-1 text-xs font-bold">
                          <DollarSign className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                          <span>{job.stipend_or_salary}</span>
                        </div>
                      )}

                      {/* Experience Level */}
                      {job.experience_level && (
                        <div className="inline-flex items-center gap-1.5 bg-[#faf8f5] border border-[#eadecc] rounded-lg px-2.5 py-1 text-xs font-medium text-[#02110c]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                          <span>{job.experience_level}</span>
                        </div>
                      )}
                    </div>

                    {/* Fourth Row: Skills + View Details Link */}
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#eadecc]/70 flex-wrap">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {job.skills_required.slice(0, 5).map((skill) => {
                            const isMatched = activeResumeSkills.some(
                              (rs) => rs.toLowerCase() === skill.toLowerCase()
                            );
                            return (
                              <span
                                key={skill}
                                className={`rounded-md px-2 py-0.5 text-[0.7rem] font-semibold border ${
                                  isMatched
                                    ? "bg-[#008561]/15 text-[#008561] border-[#008561]/30 font-bold"
                                    : "bg-[#faf8f5] text-[#495e54] border-[#eadecc]"
                                }`}
                              >
                                {isMatched && <Check className="w-2.5 h-2.5 text-[#008561] inline mr-1 stroke-[3]" />}
                                {skill}
                              </span>
                            );
                          })}
                          {job.skills_required.length > 5 && (
                            <span className="text-[0.68rem] text-[#495e54] font-medium">
                              +{job.skills_required.length - 5} more
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-[#008561] group-hover:underline inline-flex items-center gap-1 shrink-0 ml-auto">
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* ======================================================== */}
            {/* ACCOUNT REGISTRATION GATE FOR >10 JOBS */}
            {/* ======================================================== */}
            {!isLoggedIn && totalListings > 10 && (
              <div className="mt-8 rounded-[26px] border border-[#1a422f]/50 bg-gradient-to-br from-[#02110c] via-[#1a422f] to-[#02110c] p-6 sm:p-8 text-[#f3ebd6] shadow-xl text-center relative overflow-hidden">
                <div className="relative z-10 max-w-lg mx-auto space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f3ebd6]/15 border border-[#f3ebd6]/30 px-3.5 py-1 text-xs font-black text-[#f3ebd6] uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5" /> Free Account Required
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Discover All {totalListings}+ Verified Roles
                  </h3>
                  <p className="text-xs sm:text-sm text-[#f3ebd6]/85 leading-relaxed">
                    You have viewed 10 free verified openings. Register a free account to unlock full multi-page browsing, AI resume fit scoring, and application pipeline tracking.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/login?mode=signup"
                      className="rounded-full bg-[#f3ebd6] hover:bg-white text-[#02110c] font-heading font-black text-xs sm:text-sm px-6 py-3 shadow-md transition active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      Sign Up Free <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 transition cursor-pointer"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PAGINATION CONTROLS BAR */}
            {/* ======================================================== */}
            {!isLoadingListings && totalListings > 0 && totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[22px] border border-[#eedfc9] bg-white p-4 sm:px-6 shadow-sm">
                {/* Status counter */}
                <div className="text-xs font-semibold text-[#495e54]">
                  Showing <span className="font-extrabold text-[#02110c]">{startIndex + 1} to {endIndex}</span> of{" "}
                  <span className="font-extrabold text-[#02110c]">{totalListings}</span> open verified roles
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#eedfc9] bg-white px-3.5 py-2 text-xs font-bold text-[#02110c] shadow-2xs hover:bg-[#fff6eb] hover:border-[#008561] transition disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[#eedfc9] disabled:hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#008561]" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {getPaginationPages().map((page, i) =>
                      typeof page === "number" ? (
                        <button
                          key={i}
                          onClick={() => handlePageChange(page)}
                          className={`h-9 w-9 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                            currentPage === page
                              ? "bg-[#008561] text-white shadow-sm scale-105"
                              : "bg-white border border-[#eedfc9] text-[#495e54] hover:border-[#008561] hover:text-[#02110c] shadow-2xs"
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={i} className="h-9 w-6 flex items-center justify-center text-xs font-bold text-[#495e54]/70 select-none">
                          {page}
                        </span>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#eedfc9] bg-white px-3.5 py-2 text-xs font-bold text-[#02110c] shadow-2xs hover:bg-[#fff6eb] hover:border-[#008561] transition disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[#eedfc9] disabled:hover:bg-white cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 text-[#008561]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: SIFT AI CHAT & RESUME MATCHER */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 sticky top-24 self-start">
            <SiftAiChat
              liveListings={liveListings}
              onSelectListing={(job) => setSelectedListingModal(job)}
              onFilterByCompany={(comp) => setSelectedCompany(comp)}
              onFilterBySearch={(query) => setSearchQuery(query)}
              activeResumeSkills={activeResumeSkills}
              uploadedResumeName={uploadedResumeName}
              onApplyResumeSkills={handleApplyResumeSkills}
              onClearResume={handleClearResume}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* EXACT EMERALD SILK NEWSLETTER CARD */}
        {/* ======================================================== */}
        <NewsletterSection />

        {/* ======================================================== */}
        {/* EXACT ORIGINAL BRAND FOOTER WITH NATURAL TRACKING */}
        {/* ======================================================== */}
        <footer data-footer-zone="true" className="mt-16 sm:mt-20 pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
            {/* Left: Mission description */}
            <div className="lg:col-span-2 space-y-3">
              <p className="text-xs sm:text-sm font-medium text-[#55615b] leading-relaxed max-w-[340px]">
                Siftrole is your trusted platform for discovering verified tech job opportunities that match your skills, experience, and career aspirations.
              </p>
            </div>

            {/* Col: Company */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/about" className="hover:text-[#1a422f] transition">About</Link></li>
                <li><Link href="/jobs" className="hover:text-[#1a422f] transition">Opportunities</Link></li>
                <li><Link href="/#faq" className="hover:text-[#1a422f] transition">FAQ</Link></li>
                <li><Link href="/cold-email" className="hover:text-[#1a422f] transition">Recruiter Outreach</Link></li>
              </ul>
            </div>

            {/* Col: Support */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Legal & Support
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/privacy" className="hover:text-[#1a422f] transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#1a422f] transition">Terms of Service</Link></li>
                <li><Link href="/cold-email" className="hover:text-[#1a422f] transition">Recruiter Network</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#1a422f] transition">Member Dashboard</Link></li>
              </ul>
            </div>

            {/* Col: Social */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Social
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#1a422f] transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          {/* Sub-row */}
          <div className="pt-8 border-t border-neutral-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#55615b]">
            <div>
              &copy; {new Date().getFullYear()} Siftrole. All rights reserved.
            </div>
            <div>
              <a href="mailto:support@siftrole.in" className="hover:text-[#1a422f] transition">
                support@siftrole.in
              </a>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MASSIVE BOTTOM SIFTR[O]LE WORDMARK WITH EMBEDDED LOGO */}
          {/* ======================================================== */}
          <div className="pt-10 pb-4 select-none overflow-hidden flex items-center justify-center font-black uppercase text-[#14281a] leading-none tracking-[-0.04em]">
            <span className="text-[12.5vw] sm:text-[13.5vw]">SIFTR</span>
            <span className="inline-flex items-center justify-center w-[10vw] h-[10vw] sm:w-[11vw] sm:h-[11vw] max-w-[190px] max-h-[190px] min-w-[42px] min-h-[42px] mx-[0.03em] relative shrink-0">
              <Image
                src="/images/siftrole-logo.png"
                alt="O"
                width={400}
                height={400}
                className="w-full h-full object-contain drop-shadow-[0_10px_24px_rgba(0,133,97,0.22)]"
                unoptimized
              />
            </span>
            <span className="text-[12.5vw] sm:text-[13.5vw]">LE</span>
          </div>
        </footer>

      </div>

      {/* ======================================================== */}
      {/* JOB DESCRIPTION MODAL DRAWER */}
      {/* ======================================================== */}
      {selectedListingModal && (
        <JobDetailModal
          listing={selectedListingModal}
          onClose={() => setSelectedListingModal(null)}
          activeResumeSkills={activeResumeSkills}
          onApplyClick={handleApplyClick}
        />
      )}

      {/* ======================================================== */}
      {/* QUICK TRACKING TOAST ON APPLY */}
      {/* ======================================================== */}
      {appliedToastJob && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-[#02110c] border border-[#1a422f]/60 p-4 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#f3ebd6]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Opened {appliedToastJob.company} Application</span>
              </div>
              <p className="text-xs text-[#f3ebd6]/90 mt-1">
                Did you submit? Mark it to update your Dashboard tracker.
              </p>
            </div>
            <button
              onClick={() => setAppliedToastJob(null)}
              className="text-white/60 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                toggleApplied(appliedToastJob);
                setAppliedToastJob(null);
              }}
              className="flex-1 rounded-xl bg-[#1a422f] hover:bg-[#245b41] text-[#f3ebd6] py-2 text-xs font-black transition cursor-pointer"
            >
              Mark as Applied
            </button>
            <button
              onClick={() => setAppliedToastJob(null)}
              className="rounded-xl border border-white/20 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AUTH GATE MODAL */}
      {/* ======================================================== */}
      <AuthGateModal
        isOpen={authGateConfig.isOpen}
        onClose={() => setAuthGateConfig({ isOpen: false })}
        title={authGateConfig.title}
        description={authGateConfig.description}
        badge={authGateConfig.badge}
        primaryCta={authGateConfig.primaryCta}
      />
    </main>
  );
}
