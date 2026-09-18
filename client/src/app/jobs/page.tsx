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
import { useAppliedJobs } from "@/lib/appliedJobs";
import { useAuth } from "@/lib/useAuth";

const companyBrandStyles: Record<string, { bg: string; text: string; border: string }> = {
  Greenhouse: { bg: "bg-[#84d64f]/15", text: "text-[#3c7818]", border: "border-[#84d64f]/30" },
  Lever: { bg: "bg-teal-500/10", text: "text-teal-700", border: "border-teal-200" },
  Ashby: { bg: "bg-indigo-500/10", text: "text-indigo-700", border: "border-indigo-200" },
  Figma: { bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-200" },
  Stripe: { bg: "bg-violet-500/10", text: "text-violet-700", border: "border-violet-200" },
  Spotify: { bg: "bg-[#84d64f]/15", text: "text-[#3c7818]", border: "border-[#84d64f]/30" },
  Linear: { bg: "bg-slate-800/10", text: "text-slate-800", border: "border-slate-200" },
  Notion: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-200" },
  SmartRecruiters: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-200" },
};

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
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);

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
    if (selectedListingModal || showAuthGateModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedListingModal, showAuthGateModal]);

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
      setShowAuthGateModal(true);
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
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 selection:text-[#14281a]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#84d64f]/15 via-[#84d64f]/5 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-4 pb-20">
        
        {/* ======================================================== */}
        {/* TOP NAVBAR */}
        {/* ======================================================== */}
        <header className="sticky top-4 z-50 rounded-[20px] border border-neutral-200/80 bg-white/85 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              {!isLoggedIn && (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 text-xs font-bold text-[#121816] transition"
                >
                  <ChevronLeft className="w-4 h-4 text-[#3c7818]" /> Home
                </Link>
              )}

              <Link href="/" className="flex items-center gap-2.5 group">
                <SiftroleLogoMark size={28} />
                <span className="text-[1.7rem] font-black tracking-[-0.04em] text-[#121816]">
                  Sift<span className="text-[#58a826] transition-colors group-hover:text-[#4a911e]">role</span>
                </span>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-[0.95rem] font-semibold text-[#55615b]">
              <Link href="/jobs" className="text-[#3c7818] font-bold hover:text-[#58a826] transition-colors">
                All Jobs
              </Link>
              <Link href="/cold-email" className="hover:text-[#121816] transition-colors">
                HR Outreach
              </Link>
              <Link href="/about" className="hover:text-[#121816] transition-colors">
                About
              </Link>
              <Link href="/#faq" className="hover:text-[#121816] transition-colors">
                FAQ
              </Link>
            </nav>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-5 py-2.5 text-xs sm:text-[0.9rem] font-heading font-black text-[#14281a] shadow-xs transition active:scale-[0.98] inline-flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-3.5 h-3.5 text-[#14281a]" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs sm:text-[0.9rem] font-bold text-[#55615b] hover:text-[#121816] px-3 py-2 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-4 sm:px-5 py-2.5 text-xs sm:text-[0.9rem] font-heading font-black text-[#14281a] shadow-xs transition active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    Sign Up <ArrowRight className="w-3.5 h-3.5 text-[#14281a]" />
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
            <h1 className="text-[2.8rem] sm:text-[3.8rem] font-black leading-[1.05] tracking-[-0.04em] text-[#121816]">
              Explore Verified Tech Roles
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-[#55615b] max-w-[680px]">
              Browse real-time open positions parsed with AI and synced continuously across official top tech company feeds.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEARCH & FILTERS CONTROLS BAR */}
        {/* ======================================================== */}
        <section className="mb-6 rounded-[24px] border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role title, technical skill, technology, or keywords..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-[#fbfaf8] hover:border-neutral-300 focus:bg-white focus:border-neutral-400 outline-none text-[#121816] font-medium transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
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
                  className="w-full appearance-none rounded-xl border border-neutral-200/90 bg-white hover:bg-[#fbfaf8] hover:border-neutral-300 pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#121816] shadow-2xs outline-none transition focus:border-neutral-400 cursor-pointer"
                >
                  <option value="all">All Companies ({companiesList.length || 6})</option>
                  {companiesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#55615b] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Role Type Select */}
              <div className="relative flex-1 sm:flex-none sm:min-w-[140px]">
                <select
                  value={selectedRoleType}
                  onChange={(e) => setSelectedRoleType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-neutral-200/90 bg-white hover:bg-[#fbfaf8] hover:border-neutral-300 pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#121816] shadow-2xs outline-none transition focus:border-neutral-400 cursor-pointer"
                >
                  <option value="all">All Role Types</option>
                  <option value="FullTime">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#55615b] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Application & Bookmark Status Filter */}
              <div className="relative">
                <select
                  value={appliedFilter}
                  onChange={(e) => setAppliedFilter(e.target.value as "all" | "saved" | "unapplied" | "applied")}
                  className="appearance-none rounded-xl border border-neutral-200/90 bg-white hover:bg-[#fbfaf8] hover:border-neutral-300 pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#121816] shadow-2xs outline-none transition focus:border-neutral-400 cursor-pointer"
                >
                  <option value="all">Status: All Roles</option>
                  <option value="saved">Status: Saved Shortlist ({savedJobIds.size})</option>
                  <option value="unapplied">Status: Not Applied Yet</option>
                  <option value="applied">Status: Applied ({appliedJobIds.size})</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#55615b] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetAllFilters}
                  className="rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#121816] px-3 py-2.5 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                  title="Reset all search queries and active filters"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#55615b]" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Early-Career Pill Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[0.72rem] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
              Quick:
            </span>
            <button
              onClick={clearQuickFilters}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedQuickFilters.size === 0
                  ? "bg-[#84d64f] text-[#14281a] shadow-xs font-black"
                  : "bg-white border border-neutral-200 text-[#55615b] hover:border-neutral-300 hover:text-[#121816]"
              }`}
            >
              All Openings
            </button>
            <button
              onClick={() => toggleQuickFilter("internships")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                selectedQuickFilters.has("internships")
                  ? "bg-[#84d64f] text-[#14281a] shadow-xs font-black"
                  : "bg-white border border-neutral-200 text-[#55615b] hover:border-neutral-300 hover:text-[#121816]"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Internships (Summer 2026)</span>
              {selectedQuickFilters.has("internships") && (
                <Check className="w-3 h-3 text-[#14281a] stroke-[3]" />
              )}
            </button>
            <button
              onClick={() => toggleQuickFilter("newgrad")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                selectedQuickFilters.has("newgrad")
                  ? "bg-[#84d64f] text-[#14281a] shadow-xs font-black"
                  : "bg-white border border-neutral-200 text-[#55615b] hover:border-neutral-300 hover:text-[#121816]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>New Grad (2026)</span>
              {selectedQuickFilters.has("newgrad") && (
                <Check className="w-3 h-3 text-[#14281a] stroke-[3]" />
              )}
            </button>
            <button
              onClick={() => toggleQuickFilter("remote")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                selectedQuickFilters.has("remote")
                  ? "bg-[#84d64f] text-[#14281a] shadow-xs font-black"
                  : "bg-white border border-neutral-200 text-[#55615b] hover:border-neutral-300 hover:text-[#121816]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Remote Only</span>
              {selectedQuickFilters.has("remote") && (
                <Check className="w-3 h-3 text-[#14281a] stroke-[3]" />
              )}
            </button>
            {activeResumeSkills.length > 0 && (
              <button
                onClick={() => toggleQuickFilter("highmatch")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                  selectedQuickFilters.has("highmatch")
                    ? "bg-[#84d64f] text-[#14281a] shadow-xs font-black"
                    : "bg-neutral-100 border border-neutral-200 text-neutral-800 hover:bg-neutral-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>High Fit (80%+)</span>
                {selectedQuickFilters.has("highmatch") && (
                  <Check className="w-3 h-3 text-[#14281a] stroke-[3]" />
                )}
              </button>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* RESUME MATCH ACTIVE NOTIFICATION BANNER */}
        {/* ======================================================== */}
        {uploadedResumeName && (
          <div className="mb-6 rounded-2xl border border-neutral-200/90 bg-white p-4 sm:px-5 text-[#121816] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-[#121816] shrink-0">
                <FileText className="w-4 h-4 text-[#55615b]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#121816]">
                  Resume Matched: <span className="font-extrabold text-[#121816]">{uploadedResumeName}</span>
                </h4>
                <p className="text-xs text-[#55615b] mt-0.5">
                  Job feed is sorted by compatibility percentage with your stack ({activeResumeSkills.slice(0, 5).join(", ")}...).
                </p>
              </div>
            </div>

            <button
              onClick={handleClearResume}
              className="rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/80 text-[#55615b] hover:text-[#121816] px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer"
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
              <div className="py-24 text-center bg-white rounded-[26px] border border-neutral-200/80 text-[#79857f]">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#84d64f] border-t-transparent mb-3" />
                <p className="text-xs font-bold">Querying live verified database...</p>
              </div>
            ) : currentListings.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[26px] border border-neutral-200/80 p-8">
                <Briefcase className="w-12 h-12 text-[#b0bcba] mx-auto mb-3" />
                <h3 className="font-extrabold text-base text-[#121816]">No matching roles found</h3>
                <p className="text-xs text-[#55615b] mt-1 max-w-[340px] mx-auto">
                  Try clearing your filters or searching with different keywords.
                </p>
                <button
                  onClick={handleResetAllFilters}
                  className="mt-4 rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] text-xs font-bold px-5 py-2.5 shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
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
                    className={`block group rounded-[24px] border p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-[#84d64f] hover:bg-[#f7fcf4] hover:shadow-md relative overflow-hidden ${
                      applied
                        ? "border-[#84d64f]/70 bg-[#f7fcf3]"
                        : "border-neutral-200/90 bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left Block */}
                      <div className="flex-1 min-w-0">
                        {/* Company Logo + Domain + Match Badge */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <CompanyLogo
                            company={job.company}
                            size="sm"
                            className="!h-5 !w-5 !p-0 rounded-md border-0 bg-transparent shadow-none"
                          />
                          <span className="text-xs sm:text-sm font-bold text-[#121816] tracking-tight">
                            {getCompanyDomain(job.company)}
                          </span>

                          {matchInfo && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#84d64f] text-[#14281a] text-[0.68rem] font-black px-2.5 py-0.5 shadow-2xs">
                              <Sparkles className="w-3 h-3 text-[#14281a]" />
                              {matchInfo.score}% Match ({matchInfo.matchedCount}/{matchInfo.totalCount} Skills)
                            </span>
                          )}
                        </div>

                        {/* Job Title */}
                        <h3
                          onClick={() => setSelectedListingModal(job)}
                          className="text-xl sm:text-[1.35rem] font-black text-[#121816] tracking-tight mt-2 mb-3.5 group-hover:text-black transition-colors cursor-pointer hover:underline"
                        >
                          {job.title}
                        </h3>

                        {/* Experience / Type Pills */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {job.experience_level && (
                            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-0.5 text-xs font-semibold text-[#55615b]">
                              {job.experience_level.toLowerCase().includes("experience")
                                ? job.experience_level
                                : `${job.experience_level} Experience`}
                            </span>
                          )}
                          {job.employment_type && (
                            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-0.5 text-xs font-semibold text-[#55615b]">
                              {job.employment_type}
                            </span>
                          )}
                          {job.eligibility && (
                            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-0.5 text-xs font-semibold text-[#55615b]">
                              {job.eligibility}
                            </span>
                          )}
                        </div>

                        {/* Skills Breakdown Tags: Matched vs Missing */}
                        {job.skills_required && job.skills_required.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {job.skills_required.slice(0, 6).map((skill) => {
                              const isMatched = activeResumeSkills.some(
                                (rs) => rs.toLowerCase() === skill.toLowerCase()
                              );
                              return (
                                <span
                                  key={skill}
                                  className={`rounded-lg px-2.5 py-0.5 text-[0.72rem] font-bold border transition-colors ${
                                    isMatched
                                      ? "bg-[#d7f3be] text-[#1e480d] border-[#84d64f] inline-flex items-center gap-1"
                                      : activeResumeSkills.length > 0
                                      ? "bg-white text-neutral-400 border-neutral-200/60"
                                      : "bg-neutral-50 text-[#55615b] border-neutral-200/80"
                                  }`}
                                >
                                  {isMatched && <Check className="w-2.5 h-2.5 text-[#1e480d] stroke-[3]" />}
                                  {skill}
                                </span>
                              );
                            })}
                            {job.skills_required.length > 6 && (
                              <span className="text-[0.68rem] text-[#79857f] font-semibold">
                                +{job.skills_required.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Block: Compensation & Location & Bookmark / Applied Actions */}
                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-3 shrink-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                        <div className="text-left sm:text-right">
                          <div className="text-lg sm:text-xl font-black text-[#121816] tracking-tight">
                            {job.stipend_or_salary ? (
                              job.stipend_or_salary.toLowerCase().includes("year") ||
                              job.stipend_or_salary.toLowerCase().includes("/yr") ||
                              job.stipend_or_salary.toLowerCase().includes("/mo") ? (
                                job.stipend_or_salary
                              ) : (
                                <>
                                  {job.stipend_or_salary}
                                  <span className="text-xs sm:text-sm font-semibold text-[#55615b]">/Yearly</span>
                                </>
                              )
                            ) : (
                              <>
                                $140K<span className="text-xs sm:text-sm font-semibold text-[#55615b]">/Yearly</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-[#55615b] mt-0.5">
                            {job.location}
                          </div>
                        </div>

                        {/* Action Buttons: Save & Mark Applied */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => toggleSaved(job, e)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                              saved
                                ? "bg-[#14281a] text-[#84d64f] border-[#14281a]"
                                : "bg-white border-neutral-300 text-[#79857f] hover:text-[#14281a] hover:border-[#84d64f]"
                            }`}
                            title={saved ? "Saved to shortlist (Click to remove)" : "Save to shortlist"}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#84d64f]" : ""}`} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => toggleApplied(job, e)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                              applied
                                ? "bg-[#14281a] text-[#84d64f] hover:bg-[#1f3d27]"
                                : "border border-neutral-300 bg-white/90 text-[#45524d] hover:border-[#84d64f] hover:text-[#14281a] hover:bg-[#eef8e5]"
                            }`}
                            title={applied ? "Click to unmark as applied" : "Mark as applied"}
                          >
                            {applied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#84d64f]" />
                                <span>Applied</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#79857f]" />
                                <span>Mark Applied</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* ======================================================== */}
            {/* ACCOUNT REGISTRATION GATE FOR >10 JOBS */}
            {/* ======================================================== */}
            {!isLoggedIn && totalListings > 10 && (
              <div className="mt-8 rounded-[26px] border border-[#84d64f]/40 bg-gradient-to-br from-[#14281a] via-[#1a3322] to-[#14281a] p-6 sm:p-8 text-white shadow-xl text-center relative overflow-hidden">
                <div className="relative z-10 max-w-lg mx-auto space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#84d64f]/20 border border-[#84d64f]/30 px-3.5 py-1 text-xs font-black text-[#84d64f] uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5" /> Free Account Required
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Discover All {totalListings}+ Verified Roles
                  </h3>
                  <p className="text-xs sm:text-sm text-[#eef8e5]/80 leading-relaxed">
                    You have viewed 10 free verified openings. Register a free account to unlock full multi-page browsing, AI resume fit scoring, and application pipeline tracking.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/login?mode=signup"
                      className="rounded-full bg-[#84d64f] hover:bg-[#7ec942] text-[#14261b] font-heading font-black text-xs sm:text-sm px-6 py-3 shadow-md shadow-black/20 transition active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
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
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[22px] border border-neutral-200/80 bg-white p-4 sm:px-6 shadow-sm">
                {/* Status counter */}
                <div className="text-xs font-semibold text-[#55615b]">
                  Showing <span className="font-extrabold text-[#121816]">{startIndex + 1} to {endIndex}</span> of{" "}
                  <span className="font-extrabold text-[#121816]">{totalListings}</span> open verified roles
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 text-xs font-bold text-[#121816] shadow-2xs hover:bg-neutral-50 hover:border-[#84d64f] transition disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-neutral-200 disabled:hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#3c7818]" />
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
                              ? "bg-[#84d64f] text-[#14281a] shadow-sm scale-105"
                              : "bg-white border border-neutral-200/90 text-[#55615b] hover:border-[#84d64f] hover:text-[#14281a] shadow-2xs"
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={i} className="h-9 w-6 flex items-center justify-center text-xs font-bold text-[#79857f] select-none">
                          {page}
                        </span>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 text-xs font-bold text-[#121816] shadow-2xs hover:bg-neutral-50 hover:border-[#84d64f] transition disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-neutral-200 disabled:hover:bg-white cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 text-[#3c7818]" />
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
                <li><Link href="/about" className="hover:text-[#3c7818] transition">About</Link></li>
                <li><Link href="/jobs" className="hover:text-[#3c7818] transition">Opportunities</Link></li>
                <li><Link href="/#faq" className="hover:text-[#3c7818] transition">FAQ</Link></li>
                <li><Link href="/cold-email" className="hover:text-[#3c7818] transition">Recruiter Outreach</Link></li>
              </ul>
            </div>

            {/* Col: Support */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Legal & Support
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/privacy" className="hover:text-[#3c7818] transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#3c7818] transition">Terms of Service</Link></li>
                <li><Link href="/cold-email" className="hover:text-[#3c7818] transition">Recruiter Network</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#3c7818] transition">Member Dashboard</Link></li>
              </ul>
            </div>

            {/* Col: Social */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Social
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#3c7818] transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          {/* Sub-row */}
          <div className="pt-8 border-t border-neutral-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#55615b]">
            <div>
              &copy; {new Date().getFullYear()} Siftrole. All rights reserved.
            </div>
            <div>
              <a href="mailto:support@siftrole.in" className="hover:text-[#3c7818] transition">
                support@siftrole.in
              </a>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MASSIVE BOTTOM SIFTR[O]LE WORDMARK WITH EMBEDDED LOGO */}
          {/* ======================================================== */}
          <div className="pt-10 pb-4 select-none overflow-hidden flex items-center justify-center font-black uppercase text-[#14281a] leading-none tracking-[-0.04em]">
            <span className="text-[12.5vw] sm:text-[13.5vw]">SIFTR</span>
            <span className="inline-flex items-center justify-center w-[12.5vw] h-[12.5vw] sm:w-[13.5vw] sm:h-[13.5vw] max-w-[240px] max-h-[240px] min-w-[52px] min-h-[52px] mx-[0.02em] relative shrink-0">
              <Image
                src="/images/siftrole-logo.png"
                alt="O"
                width={400}
                height={400}
                className="w-full h-full object-contain drop-shadow-[0_12px_32px_rgba(132,214,79,0.38)]"
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
        <div
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          style={{ overscrollBehavior: "contain" }}
        >
          <div
            data-lenis-prevent="true"
            tabIndex={0}
            onWheel={(e) => e.stopPropagation()}
            className="bg-white rounded-[28px] max-w-[700px] w-full max-h-[90vh] overflow-y-auto overscroll-contain p-7 sm:p-9 shadow-2xl border border-neutral-200 focus:outline-none"
            style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <CompanyLogo company={selectedListingModal.company} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3c7818]">
                      {selectedListingModal.company}
                    </span>
                    <span className="rounded-full bg-[#eef8e5] border border-[#cce8be] text-[#3c7818] text-[0.65rem] font-bold px-2.5 py-0.5 inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#3c7818]" /> Verified Official Feed
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-[#121816] mt-1.5">
                    {selectedListingModal.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedListingModal(null)}
                className="h-9 w-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-sm font-bold transition shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-[#121816] bg-[#f8f7f5] rounded-2xl p-4 border border-neutral-200/80">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#79857f]" />
                <span>{selectedListingModal.location}</span>
              </div>
              {selectedListingModal.employment_type && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#79857f]" />
                  <span>{selectedListingModal.employment_type}</span>
                </div>
              )}
              {selectedListingModal.stipend_or_salary && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#79857f]" />
                  <span>{selectedListingModal.stipend_or_salary}</span>
                </div>
              )}
              {selectedListingModal.experience_level && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#79857f]" />
                  <span>{selectedListingModal.experience_level}</span>
                </div>
              )}
            </div>

            {/* Resume Match Breakdown if uploaded */}
            {activeResumeSkills.length > 0 && (() => {
              const modalMatch = getJobMatch(selectedListingModal);
              if (!modalMatch) return null;
              return (
                <div className="mt-6 rounded-2xl border border-[#84d64f]/40 bg-[#f4faee] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#3c7818]" />
                      <span className="text-xs font-black text-[#14281a]">
                        AI Compatibility Score: {modalMatch.score}%
                      </span>
                    </div>
                    <span className="text-[0.68rem] font-bold text-[#2d6113]">
                      {modalMatch.matchedCount} of {modalMatch.totalCount} Skills Matched
                    </span>
                  </div>

                  {modalMatch.matchedSkills.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#2d6113] block mb-1.5">
                        Matching Skills on Your Resume:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {modalMatch.matchedSkills.map((s) => (
                          <span key={s} className="rounded-lg bg-[#d7f3be] text-[#1e480d] border border-[#84d64f] px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#1e480d]" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {modalMatch.missingSkills.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[0.68rem] font-bold uppercase tracking-wider text-amber-800 block mb-1.5">
                        Skills to Highlight or Add:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {modalMatch.missingSkills.map((s) => (
                          <span key={s} className="rounded-lg bg-amber-500/10 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Full JD Description */}
            <div className="mt-6">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#79857f] mb-2.5">
                Role Summary & Details
              </h4>
              <div
                data-lenis-prevent="true"
                className="prose prose-sm text-[#55615b] leading-relaxed max-h-[260px] overflow-y-auto overscroll-contain pr-2"
                style={{ overscrollBehavior: "contain" }}
              >
                {selectedListingModal.raw_jd_text ? (
                  <p className="whitespace-pre-line text-xs">
                    {selectedListingModal.raw_jd_text}
                  </p>
                ) : (
                  <div className="space-y-3 text-xs">
                    <p>
                      This role is actively listed and verified on {selectedListingModal.company}&apos;s official careers ATS portal.
                    </p>
                    <p>
                      Location: {selectedListingModal.location}. Employment Type: {selectedListingModal.employment_type || "Direct Hire"}.
                    </p>
                    <p>
                      Click &quot;Apply on Official Portal&quot; below to submit your application directly on the employer&apos;s portal with zero third-party intermediaries.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Tags */}
            {selectedListingModal.skills_required?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#79857f] mb-2.5">
                  Required Skills & Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedListingModal.skills_required.map((s) => (
                    <span key={s} className="rounded-xl bg-[#eef8e5] text-[#3c7818] font-bold text-xs px-3 py-1.5 border border-[#cce8be]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply CTA Button */}
            <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
              <button
                onClick={(e) => handleShare(selectedListingModal, e)}
                className="rounded-xl border border-neutral-200/80 hover:bg-neutral-100 px-4 py-3 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? "Link Copied!" : "Share Link"}
              </button>

              <a
                href={selectedListingModal.apply_url}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleApplyClick(selectedListingModal)}
                className="flex-1 text-center rounded-full bg-[#84d64f] hover:bg-[#7ec942] text-[#14261b] py-3.5 font-heading font-extrabold text-sm shadow-[0_8px_20px_rgba(132,214,79,0.25)] transition inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                Apply on Official Portal
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK TRACKING TOAST ON APPLY */}
      {/* ======================================================== */}
      {appliedToastJob && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-[#14281a] border border-[#84d64f]/40 p-4 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#84d64f]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Opened {appliedToastJob.company} Application</span>
              </div>
              <p className="text-xs text-[#eef8e5]/90 mt-1">
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
              className="flex-1 rounded-xl bg-[#84d64f] hover:bg-[#7ec942] text-[#14261b] py-2 text-xs font-black transition cursor-pointer"
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
      {/* AUTH GATE MODAL FOR DISCOVERING > 10 JOBS */}
      {/* ======================================================== */}
      {showAuthGateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAuthGateModal(false)}
        >
          <div
            className="w-full max-w-md rounded-[32px] border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthGateModal(false)}
              className="absolute right-5 top-5 h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#55615b] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-14 w-14 rounded-2xl bg-[#eef8e5] text-[#3c7818] border border-[#cce8be] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#121816] tracking-tight">
                Unlock All {totalListings}+ Verified Roles
              </h3>
              <p className="text-xs sm:text-sm text-[#55615b] mt-2 leading-relaxed">
                Free account registration is required to discover openings past the first 10 roles, save your checklist, and use Sift AI matching.
              </p>
            </div>

            <div className="pt-3 space-y-2.5">
              <Link
                href="/login?mode=signup"
                className="w-full rounded-full bg-[#84d64f] hover:bg-[#7ec942] text-[#14261b] font-heading font-black text-sm py-3.5 shadow-md shadow-black/10 transition active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer block"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full rounded-full border border-neutral-200/90 bg-[#fbfaf8] hover:bg-neutral-100 text-[#121816] font-bold text-xs py-3 transition cursor-pointer inline-flex items-center justify-center block"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
