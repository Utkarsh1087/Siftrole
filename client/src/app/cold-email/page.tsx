"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Mail,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Lock,
  ArrowRight,
  Filter,
  Send,
  Building2,
  Users,
  CheckCircle2,
  CheckSquare2,
  Square,
  Zap,
  ChevronDown,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";
import {
  HR_CONTACTS_DATA,
  HRContact,
  FREE_CONTACTS_LIMIT,
  isProUser,
  getMailedContactIds,
  toggleMailedContactId,
  markContactAsMailed,
  syncMailedContactsFromDatabase,
} from "@/lib/hrContacts";
import { ColdMailModal } from "@/components/ColdMailModal";
import { AuthGateModal } from "@/components/AuthGateModal";
import { useAuth } from "@/lib/useAuth";

export default function ColdEmailPage() {
  const [contacts, setContacts] = useState<HRContact[]>(HR_CONTACTS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [mailedFilter, setMailedFilter] = useState<"all" | "unmailed" | "mailed">("all");
  const [selectedContactForAi, setSelectedContactForAi] = useState<HRContact | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [mailedContactIds, setMailedContactIds] = useState<Set<string>>(new Set());
  const [authGateConfig, setAuthGateConfig] = useState<{
    isOpen: boolean;
    title?: string;
    description?: string;
    badge?: string;
    primaryCta?: string;
  }>({ isOpen: false });

  // Pagination state
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    setIsPro(isProUser());
    setMailedContactIds(getMailedContactIds());
    if (isLoggedIn) {
      syncMailedContactsFromDatabase().then((ids) => setMailedContactIds(ids));
    }

    const handleProChange = () => {
      setIsPro(isProUser());
    };

    const handleMailedChange = () => {
      setMailedContactIds(getMailedContactIds());
    };

    window.addEventListener("siftrole-pro-change", handleProChange);
    window.addEventListener("siftrole-mailed-change", handleMailedChange);
    window.addEventListener("storage", handleProChange);
    window.addEventListener("storage", handleMailedChange);

    return () => {
      window.removeEventListener("siftrole-pro-change", handleProChange);
      window.removeEventListener("siftrole-mailed-change", handleMailedChange);
      window.removeEventListener("storage", handleProChange);
      window.removeEventListener("storage", handleMailedChange);
    };
  }, [isLoggedIn]);

  const handleDraftAiMail = (contact: HRContact) => {
    if (!isLoggedIn) {
      setAuthGateConfig({
        isOpen: true,
        title: "Sign in to Use AI Cold Email Drafter",
        description: "Create a free account or sign in to generate personalized, high-converting cold outreach emails to verified tech recruiters.",
        badge: "Free Instant Access",
        primaryCta: "Sign In to Draft AI Email",
      });
      return;
    }
    setSelectedContactForAi(contact);
  };

  const handleDirectMail = (contact: HRContact, e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setAuthGateConfig({
        isOpen: true,
        title: "Sign in for Direct Recruiter Outreach",
        description: "Create a free account or sign in to reach verified tech recruiter contacts and track your outreach history.",
        badge: "Free Instant Access",
        primaryCta: "Sign In for Direct Outreach",
      });
      return;
    }
    markContactAsMailed(contact.id);
  };

  const handleToggleMailed = (contactId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isLoggedIn) {
      setAuthGateConfig({
        isOpen: true,
        title: "Sign in to Track Outreach",
        description: "Create a free account or sign in to mark recruiter conversations as mailed, track your response pipeline, and keep your applications organized.",
        badge: "Free Instant Access",
        primaryCta: "Sign In to Track Outreach",
      });
      return;
    }
    toggleMailedContactId(contactId);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.hiring_for.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        selectedDepartment === "all" || c.department === selectedDepartment;

      let matchesMailed = true;
      if (mailedFilter === "unmailed") {
        matchesMailed = !mailedContactIds.has(c.id);
      } else if (mailedFilter === "mailed") {
        matchesMailed = mailedContactIds.has(c.id);
      }

      return matchesSearch && matchesDept && matchesMailed;
    });
  }, [contacts, searchQuery, selectedDepartment, mailedFilter, mailedContactIds]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment, mailedFilter]);

  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filteredContacts.length);

  const paginatedContacts = useMemo(() => {
    return filteredContacts.slice(startIndex, endIndex);
  }, [filteredContacts, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (!isLoggedIn && page > 1) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("siftrole_redirect_after_auth", window.location.pathname + window.location.search);
      }
      setAuthGateConfig({
        isOpen: true,
        title: `Unlock All ${contacts.length}+ Verified Recruiter Leads`,
        description: "Free account registration is required to discover recruiter contacts past page 1 and use AI cold emailing for all roles.",
        badge: "Free Instant Access",
        primaryCta: "Unlock All Recruiter Leads (Free)",
      });
      return;
    }
    setCurrentPage(page);
    const el = document.getElementById("hr-contacts-heading");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

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
              <Link href="/jobs" className="hover:text-[#083D2E] transition-colors">
                All Jobs
              </Link>
              <Link href="/cold-email" className="text-[#083D2E] font-bold hover:text-[#008561] transition-colors">
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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="font-pochaevsk text-[3rem] sm:text-[4.2rem] leading-[1.05] tracking-[-0.02em] text-[#02110c]">
                Direct HR Outreach Hub
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#495e54] max-w-[680px]">
                Connect directly with technical recruiters and university talent leads. Generate punchy, human-sounding cold emails with AI in one click and track sent applications.
              </p>
            </div>

            {/* Directory Count Badge */}
            <div className="shrink-0">
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#eadecc] bg-white px-3.5 py-2 text-xs text-[#495e54] shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#008561]" />
                <span className="font-semibold text-[#02110c]">{contacts.length}+ Verified Contacts</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* STATS STRIP */}
        {/* ======================================================== */}
        <section className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[22px] border border-[#eadecc] bg-white p-5 shadow-[0_2px_12px_rgba(2,17,12,0.03)]">
            <div className="text-2xl sm:text-3xl font-black text-[#02110c]">{contacts.length}+</div>
            <div className="text-xs font-bold text-[#02110c] mt-1">Direct HR & Recruiter Emails</div>
            <div className="text-[0.7rem] text-[#495e54]">Verified across Stripe, OpenAI, Figma, Spotify, Linear</div>
          </div>
          <div className="rounded-[22px] border border-[#eadecc] bg-white p-5 shadow-[0_2px_12px_rgba(2,17,12,0.03)]">
            <div className="text-2xl sm:text-3xl font-black text-[#02110c]">3.4x</div>
            <div className="text-xs font-bold text-[#02110c] mt-1">Higher Response Rate</div>
            <div className="text-[0.7rem] text-[#495e54]">Short, human-form AI emails vs generic cover letters</div>
          </div>
          <div className="rounded-[22px] border border-[#eadecc] bg-white p-5 shadow-[0_2px_12px_rgba(2,17,12,0.03)]">
            <div className="text-2xl sm:text-3xl font-black text-[#02110c]">
              {mailedContactIds.size} Mailed
            </div>
            <div className="text-xs font-bold text-[#02110c] mt-1">Your Outreach Progress</div>
            <div className="text-[0.7rem] text-[#495e54]">Real-time tracking of sent recruiter emails</div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEARCH & FILTERS */}
        {/* ======================================================== */}
        <section className="my-6">
          <div className="rounded-[22px] border border-[#eadecc] bg-white p-4 shadow-[0_2px_12px_rgba(2,17,12,0.03)] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-[420px]">
              <Search className="w-4 h-4 text-[#495e54]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recruiter, company, or target role..."
                className="w-full rounded-xl border border-[#eadecc] bg-[#faf8f5] pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition hover:border-[#008561]/40 focus:border-[#008561] focus:bg-white focus:ring-2 focus:ring-[#008561]/15 text-[#02110c]"
              />
            </div>

            {/* Department & Status Selects */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Department */}
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="appearance-none rounded-xl border border-[#eadecc] bg-white hover:bg-[#faf8f5] hover:border-[#008561] pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#02110c] shadow-2xs outline-none transition focus:border-[#008561] focus:ring-2 focus:ring-[#008561]/15 cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering Talent</option>
                  <option value="Early Career / University">Early Career / University</option>
                  <option value="AI & Research">AI & Research</option>
                  <option value="Product & Design">Product & Design</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#495e54] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Status (Mailed vs Unmailed) */}
              <div className="relative">
                <select
                  value={mailedFilter}
                  onChange={(e) => setMailedFilter(e.target.value as "all" | "unmailed" | "mailed")}
                  className="appearance-none rounded-xl border border-[#eadecc] bg-white hover:bg-[#faf8f5] hover:border-[#008561] pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#02110c] shadow-2xs outline-none transition focus:border-[#008561] focus:ring-2 focus:ring-[#008561]/15 cursor-pointer"
                >
                  <option value="all">Status: All Contacts</option>
                  <option value="unmailed">Status: Not Mailed Yet</option>
                  <option value="mailed">Status: Mailed ({mailedContactIds.size})</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#495e54] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {(searchQuery.trim() || selectedDepartment !== "all" || mailedFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartment("all");
                    setMailedFilter("all");
                  }}
                  className="rounded-xl bg-[#faf8f5] hover:bg-white border border-[#eadecc] text-[#02110c] px-3 py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* RECRUITER CONTACTS GRID */}
        {/* ======================================================== */}
        <div id="hr-contacts-heading" className="scroll-mt-24">
          {filteredContacts.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#eadecc] bg-white p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-[#faf8f5] flex items-center justify-center mx-auto text-[#495e54] mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#02110c]">No matching HR contacts found</h3>
              <p className="text-xs text-[#495e54] mt-1 max-w-sm mx-auto">
                Try searching for a different company name, department, or keyword to find verified recruiter leads.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("all");
                  setMailedFilter("all");
                }}
                className="mt-4 rounded-xl bg-[#02110c] text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer hover:bg-[#008561] transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {paginatedContacts.map((contact) => {
                const isMailed = mailedContactIds.has(contact.id);

                return (
                  <div
                    key={contact.id}
                    className={`rounded-[24px] border p-6 shadow-[0_2px_12px_rgba(2,17,12,0.03)] transition-all relative overflow-hidden flex flex-col justify-between ${
                      isMailed
                        ? "border-[#008561]/40 bg-[#faf8f5] hover:shadow-md"
                        : "border-[#eadecc] bg-white hover:border-[#008561] hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Top Row: Company Logo + Title + Status + Mailed Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CompanyLogo company={contact.company} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-[#008561]">
                                {contact.company}
                              </span>
                              <span className="rounded-full bg-[#00D793]/15 border border-[#00D793]/40 text-[#083D2E] text-[0.65rem] font-bold px-2 py-0.5 inline-flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-[#008561]" /> Verified HR
                              </span>
                            </div>
                            <h3 className="font-lora text-xl font-bold text-[#02110c] mt-0.5 tracking-tight">
                              {contact.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Interactive Mailed Checkbox Button */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleMailed(contact.id, e)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                              isMailed
                                ? "bg-[#02110c] text-white shadow-xs hover:bg-[#008561]"
                                : "border border-[#eadecc] bg-white text-[#495e54] hover:border-[#008561] hover:text-[#02110c] hover:bg-[#faf8f5]"
                            }`}
                            title={isMailed ? "Click to unmark as mailed" : "Mark as mailed"}
                          >
                            {isMailed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                <span>Mailed</span>
                              </>
                            ) : (
                              <>
                                <span className="w-3.5 h-3.5 rounded border border-[#eadecc] bg-white inline-block" />
                                <span>Mark Mailed</span>
                              </>
                            )}
                          </button>

                          <span className="text-[0.7rem] font-bold text-[#495e54] bg-[#faf8f5] px-2.5 py-1 rounded-lg border border-[#eadecc] shrink-0">
                            {contact.department}
                          </span>
                        </div>
                      </div>

                      {/* Role Title & Location */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-[#02110c]">{contact.title}</p>
                        <p className="text-[0.75rem] text-[#495e54] mt-0.5">{contact.location}</p>
                      </div>

                      {/* Hiring For Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {contact.hiring_for.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#eadecc] bg-[#faf8f5] px-3 py-0.5 text-[0.7rem] font-semibold text-[#02110c]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Email Row */}
                      <div className="mt-4 p-3 rounded-xl bg-[#faf8f5] border border-[#eadecc] flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#008561] shrink-0" />
                        <span className="text-xs font-mono font-bold text-[#02110c] truncate">{contact.email}</span>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-5 pt-4 border-t border-[#eadecc]/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleDraftAiMail(contact)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#008561] hover:bg-[#006e50] text-white px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Draft AI Mail</span>
                      </button>

                      <a
                        href={isLoggedIn ? `mailto:${contact.email}?subject=${encodeURIComponent(`Quick question re: ${contact.hiring_for[0]} at ${contact.company}`)}` : "#"}
                        onClick={(e) => handleDirectMail(contact, e)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#eadecc] hover:border-[#008561] hover:bg-[#faf8f5] text-[#02110c] px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-[#008561]" />
                        <span>Direct Mail</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* PAGINATION CONTROLS BAR */}
        {/* ======================================================== */}
        {filteredContacts.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[22px] border border-[#eedfc9] bg-white p-4 sm:px-6 shadow-sm">
            {/* Status counter */}
            <div className="text-xs font-semibold text-[#55615b]">
              Showing <span className="font-extrabold text-[#121816]">{startIndex + 1} to {endIndex}</span> of{" "}
              <span className="font-extrabold text-[#121816]">{filteredContacts.length}</span> verified tech recruiter contacts
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#eedfc9] bg-white px-3.5 py-2 text-xs font-bold text-[#121816] shadow-2xs hover:bg-[#fff6eb] hover:border-[#008561] transition disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[#eedfc9] disabled:hover:bg-white cursor-pointer"
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
                          : "bg-white border border-[#eedfc9] text-[#55615b] hover:border-[#008561] hover:text-[#02110c] shadow-2xs"
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#eedfc9] bg-white px-3.5 py-2 text-xs font-bold text-[#121816] shadow-2xs hover:bg-[#fff6eb] hover:border-[#008561] transition disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[#eedfc9] disabled:hover:bg-white cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 text-[#008561]" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* AI Cold Mail Drafter Modal */}
      <ColdMailModal
        contact={selectedContactForAi}
        onClose={() => setSelectedContactForAi(null)}
      />

      {/* Auth Gate Modal */}
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
