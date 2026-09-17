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
import {
  HR_CONTACTS_DATA,
  HRContact,
  FREE_CONTACTS_LIMIT,
  isProUser,
  getMailedContactIds,
  toggleMailedContactId,
  markContactAsMailed,
} from "@/lib/hrContacts";
import { ColdMailModal } from "@/components/ColdMailModal";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";
import { useAuth } from "@/lib/useAuth";

export default function ColdEmailPage() {
  const [contacts, setContacts] = useState<HRContact[]>(HR_CONTACTS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [mailedFilter, setMailedFilter] = useState<"all" | "unmailed" | "mailed">("all");
  const [selectedContactForAi, setSelectedContactForAi] = useState<HRContact | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [mailedContactIds, setMailedContactIds] = useState<Set<string>>(new Set());

  // Pagination state
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    setIsPro(isProUser());
    setMailedContactIds(getMailedContactIds());

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
  }, []);

  const handleCopyEmail = (contact: HRContact, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contact.email);
      setCopiedEmailId(contact.id);
      setTimeout(() => setCopiedEmailId(null), 2000);
    }
  };

  const handleToggleMailed = (contactId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
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
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 selection:text-[#14281a]">
      {/* Background Ambient Glow */}
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
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 text-xs font-bold text-[#121816] transition"
              >
                <ChevronLeft className="w-4 h-4 text-[#3c7818]" /> Home
              </Link>

              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-[1.7rem] font-black tracking-[-0.04em] text-[#121816]">
                  Sift<span className="text-[#58a826] transition-colors group-hover:text-[#4a911e]">role</span>
                </span>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-[0.95rem] font-semibold text-[#55615b]">
              <Link href="/jobs" className="hover:text-[#121816] transition-colors">
                All Jobs
              </Link>
              <Link href="/cold-email" className="text-[#3c7818] font-bold hover:text-[#58a826] transition-colors">
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
                  className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-5 py-2.5 text-xs sm:text-[0.9rem] font-heading font-bold text-[#14281a] shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98] inline-flex items-center gap-2"
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
                    className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-4 sm:px-5 py-2.5 text-xs sm:text-[0.9rem] font-heading font-bold text-[#14281a] shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98] inline-flex items-center gap-1.5"
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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-[2.8rem] sm:text-[3.8rem] font-black leading-[1.05] tracking-[-0.04em] text-[#121816]">
                Direct HR Outreach Hub
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#55615b] max-w-[680px]">
                Connect directly with technical recruiters and university talent leads. Generate punchy, human-sounding cold emails with AI in one click and track sent applications.
              </p>
            </div>

            {/* Pro Status Badge / Upgrade Trigger */}
            <div className="shrink-0">
              {isPro ? (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-[#14281a] text-[#84d64f] px-5 py-3 text-xs font-bold border border-[#84d64f]/30 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#84d64f]" />
                  <span>Pro Access Active &bull; All 500+ Contacts Unlocked</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="rounded-2xl bg-[#14281a] hover:bg-[#1f3d27] text-white p-4 sm:px-6 flex items-center gap-4 shadow-md transition cursor-pointer border border-[#84d64f]/25"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#84d64f]/20 flex items-center justify-center text-[#84d64f]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>Unlock 500+ Recruiter Contacts</span>
                      <span className="bg-[#84d64f] text-[#14281a] text-[0.65rem] px-2 py-0.5 rounded-full">₹49 Only</span>
                    </div>
                    <div className="text-[0.7rem] text-[#eef8e5]/80">First 10 contacts are free for registered builders</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* STATS STRIP */}
        {/* ======================================================== */}
        <section className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[22px] border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-[#121816]">500+</div>
            <div className="text-xs font-bold text-[#14281a] mt-1">Direct HR & Recruiter Emails</div>
            <div className="text-[0.7rem] text-[#55615b]">Verified across Stripe, OpenAI, Figma, Spotify, Linear</div>
          </div>
          <div className="rounded-[22px] border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-[#121816]">3.4x</div>
            <div className="text-xs font-bold text-[#14281a] mt-1">Higher Response Rate</div>
            <div className="text-[0.7rem] text-[#55615b]">Short, human-form AI emails vs generic cover letters</div>
          </div>
          <div className="rounded-[22px] border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-[#121816]">
              {mailedContactIds.size} Mailed
            </div>
            <div className="text-xs font-bold text-[#14281a] mt-1">Your Outreach Progress</div>
            <div className="text-[0.7rem] text-[#55615b]">Real-time tracking of sent recruiter emails</div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEARCH & FILTERS */}
        {/* ======================================================== */}
        <section className="my-6">
          <div className="rounded-[22px] border border-neutral-200/80 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-[420px]">
              <Search className="w-4 h-4 text-[#79857f] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recruiter, company, or target role..."
                className="w-full rounded-xl border border-neutral-200/80 bg-[#fbfaf8] pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition focus:border-[#84d64f] focus:bg-white focus:ring-2 focus:ring-[#84d64f]/20"
              />
            </div>

            {/* Department & Status Selects */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Department */}
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="appearance-none rounded-xl border border-neutral-200/90 bg-white hover:bg-[#fbfaf8] hover:border-neutral-300 pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#121816] shadow-2xs outline-none transition focus:border-[#84d64f] focus:ring-2 focus:ring-[#84d64f]/20 cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering Talent</option>
                  <option value="Early Career / University">Early Career / University</option>
                  <option value="AI & Research">AI & Research</option>
                  <option value="Product & Design">Product & Design</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#55615b] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Status (Mailed vs Unmailed) */}
              <div className="relative">
                <select
                  value={mailedFilter}
                  onChange={(e) => setMailedFilter(e.target.value as "all" | "unmailed" | "mailed")}
                  className="appearance-none rounded-xl border border-neutral-200/90 bg-white hover:bg-[#fbfaf8] hover:border-neutral-300 pl-3.5 pr-8 py-2.5 text-xs font-bold text-[#121816] shadow-2xs outline-none transition focus:border-[#84d64f] focus:ring-2 focus:ring-[#84d64f]/20 cursor-pointer"
                >
                  <option value="all">Status: All Contacts</option>
                  <option value="unmailed">Status: Not Mailed Yet</option>
                  <option value="mailed">Status: Mailed ({mailedContactIds.size})</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#55615b] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {(searchQuery.trim() || selectedDepartment !== "all" || mailedFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartment("all");
                    setMailedFilter("all");
                  }}
                  className="rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#121816] px-3 py-2.5 text-xs font-bold transition cursor-pointer"
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
            <div className="rounded-[24px] border border-dashed border-neutral-300 bg-white p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-[#55615b] mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#121816]">No matching HR contacts found</h3>
              <p className="text-xs text-[#55615b] mt-1 max-w-sm mx-auto">
                Try searching for a different company name, department, or keyword to find verified recruiter leads.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("all");
                  setMailedFilter("all");
                }}
                className="mt-4 rounded-xl bg-[#14281a] text-[#84d64f] px-4 py-2 text-xs font-bold shadow-xs cursor-pointer hover:bg-[#1f3d27] transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {paginatedContacts.map((contact, index) => {
                const globalIndex = startIndex + index;
                const isLocked = !isPro && globalIndex >= FREE_CONTACTS_LIMIT;
                const isMailed = mailedContactIds.has(contact.id);

                return (
                  <div
                    key={contact.id}
                    className={`rounded-[24px] border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all relative overflow-hidden flex flex-col justify-between ${
                      isLocked
                        ? "bg-[#fbfaf8] border-neutral-200/90"
                        : isMailed
                        ? "border-[#84d64f]/70 bg-[#f7fcf3] hover:shadow-md"
                        : "border-neutral-200/90 bg-white hover:border-[#84d64f] hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Top Row: Company Logo + Title + Status + Mailed Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CompanyLogo company={contact.company} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3c7818]">
                                {contact.company}
                              </span>
                              <span className="rounded-full bg-[#eef8e5] border border-[#cce8be] text-[#14281a] text-[0.65rem] font-bold px-2 py-0.5 inline-flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-[#3c7818]" /> Verified HR
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-[#121816] mt-0.5">
                              {isLocked ? `${contact.name.split(" ")[0]} ••••••` : contact.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Interactive Mailed Checkbox Button */}
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={(e) => handleToggleMailed(contact.id, e)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                                isMailed
                                  ? "bg-[#14281a] text-[#84d64f] shadow-xs hover:bg-[#1f3d27]"
                                  : "border border-neutral-300 bg-white text-[#55615b] hover:border-[#84d64f] hover:text-[#14281a] hover:bg-[#eef8e5]"
                              }`}
                              title={isMailed ? "Click to unmark as mailed" : "Mark as mailed"}
                            >
                              {isMailed ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#84d64f]" />
                                  <span>Mailed</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-3.5 h-3.5 rounded border border-neutral-400 bg-white inline-block" />
                                  <span>Mark Mailed</span>
                                </>
                              )}
                            </button>
                          )}

                          <span className="text-[0.7rem] font-bold text-[#55615b] bg-[#f8f7f5] px-2.5 py-1 rounded-lg border border-neutral-200/60 shrink-0">
                            {contact.department}
                          </span>
                        </div>
                      </div>

                      {/* Role Title & Location */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-[#121816]">{contact.title}</p>
                        <p className="text-[0.75rem] text-[#55615b] mt-0.5">{contact.location}</p>
                      </div>

                      {/* Hiring For Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {contact.hiring_for.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-neutral-200 bg-[#f8f7f5] px-3 py-0.5 text-[0.7rem] font-semibold text-[#14281a]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Email Row */}
                      <div className="mt-4 p-3 rounded-xl bg-[#f8f7f5] border border-neutral-200/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#14281a] truncate">
                          <Mail className="w-3.5 h-3.5 text-[#3c7818] shrink-0" />
                          <span className="truncate">
                            {isLocked ? "••••••••••••@company.com" : contact.email}
                          </span>
                        </div>

                        {!isLocked && (
                          <button
                            onClick={(e) => handleCopyEmail(contact, e)}
                            className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#55615b] transition cursor-pointer shrink-0"
                            title="Copy email"
                          >
                            {copiedEmailId === contact.id ? (
                              <Check className="w-3.5 h-3.5 text-[#3c7818]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                      {!isLocked ? (
                        <>
                          <button
                            onClick={() => setSelectedContactForAi(contact)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Draft AI Mail</span>
                          </button>

                          <a
                            href={`mailto:${contact.email}?subject=${encodeURIComponent(`Quick question re: ${contact.hiring_for[0]} at ${contact.company}`)}`}
                            onClick={() => markContactAsMailed(contact.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 hover:border-[#84d64f] hover:bg-[#eef8e5] text-[#121816] px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-[#3c7818]" />
                            <span>Direct Mail</span>
                          </a>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between gap-3">
                          <span className="text-[0.75rem] font-bold text-[#55615b] inline-flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pro Contact #{globalIndex + 1}</span>
                          </span>

                          <button
                            onClick={() => setIsUpgradeModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#14281a] hover:bg-[#1f3d27] text-[#84d64f] px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Unlock Full Contact</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Paywall Blur Overlay for Locked Contacts */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none flex items-center justify-center p-4">
                        <div className="bg-[#14281a]/90 text-white rounded-2xl p-4 shadow-xl border border-[#84d64f]/40 text-center pointer-events-auto max-w-[280px]">
                          <Lock className="w-5 h-5 text-[#84d64f] mx-auto mb-1.5" />
                          <h4 className="text-xs font-black text-white">Pro Contact Locked</h4>
                          <p className="text-[0.68rem] text-[#eef8e5]/80 mt-1">
                            Upgrade to unlock this recruiter and 500+ other verified hiring leads.
                          </p>
                          <button
                            onClick={() => setIsUpgradeModalOpen(true)}
                            className="mt-3 w-full rounded-xl bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] py-2 text-xs font-bold shadow-sm cursor-pointer"
                          >
                            Unlock for ₹49 only
                          </button>
                        </div>
                      </div>
                    )}
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
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[22px] border border-neutral-200/80 bg-white p-4 sm:px-6 shadow-sm">
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
                          ? "bg-[#14281a] text-white shadow-sm scale-105"
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

      {/* AI Cold Mail Drafter Modal */}
      <ColdMailModal
        contact={selectedContactForAi}
        onClose={() => setSelectedContactForAi(null)}
      />

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={() => setIsPro(true)}
      />
    </main>
  );
}
