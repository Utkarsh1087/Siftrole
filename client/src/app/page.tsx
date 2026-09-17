"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Layers,
  BellRing,
  ClipboardCheck,
  ArrowRight,
  ChevronDown,
  Clock,
  DollarSign,
  GraduationCap,
  SlidersHorizontal,
  Flame,
  Zap,
  TrendingUp,
  X,
  Share2,
  Bookmark,
  FileText,
  CheckCircle2,
  Check,
} from "lucide-react";
import { CompanyLogo, getCompanyDomain } from "@/components/CompanyLogo";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";
import { useAppliedJobs } from "@/lib/appliedJobs";
import { useAuth } from "@/lib/useAuth";

interface Listing {
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
  raw_jd_hash: string;
  raw_jd_text: string | null;
  created_at: string;
}

const COMPANY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Figma: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-200" },
  Stripe: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-200" },
  Spotify: { bg: "bg-[#84d64f]/15", text: "text-[#3c7818]", border: "border-[#84d64f]/30" },
  Linear: { bg: "bg-slate-800/10", text: "text-slate-800", border: "border-slate-200" },
  Notion: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-200" },
  SmartRecruiters: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-200" },
};

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [totalListingsCount, setTotalListingsCount] = useState<number>(0);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [selectedListingModal, setSelectedListingModal] = useState<Listing | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState(false);
  const { appliedJobIds, toggleApplied, isApplied } = useAppliedJobs();
  const { isLoggedIn, isLoaded } = useAuth();

  const metrics = [
    { value: "100%", label: "Direct from company career feeds", caption: "Zero scraped third-party reposts" },
    { value: "990+", label: "Verified active tech opportunities", caption: "Synced across Greenhouse, Lever, Ashby" },
    { value: "0", label: "Dead links or expired ghost postings", caption: "Auto-removed the second a role closes" },
  ];

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    setIsLoadingListings(true);
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        const listings: Listing[] = data.listings || [];
        setTotalListingsCount(listings.length);
        setFeaturedListings(listings.slice(0, 5));
      }
    } catch (e) {
      console.error("Failed to fetch featured listings:", e);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const toggleSaveJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = (job: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(job.apply_url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const faqs = [
    {
      q: "How does Siftrole guarantee every listing is real?",
      a: "Every listing on Siftrole is pulled directly from a company's official career page via public ATS JSON APIs (Greenhouse, Lever, Ashby, SmartRecruiters) or verified before publishing. No scraped-from-nowhere postings, no unverified spam.",
    },
    {
      q: "What happens when a company closes an opening?",
      a: "Listings are kept in sync automatically. The moment a role is filled or closed on the company's own career site, it disappears from Siftrole, eliminating dead links sitting around for weeks.",
    },
    {
      q: "Is Siftrole free for students and developers?",
      a: "Yes, 100% free. You can search, filter, and jump directly to official application portals without registration fees, paywalls, or recruiter middlemen.",
    },
    {
      q: "How does the upcoming Resume Matching work?",
      a: "You upload your resume once, and our engine ranks open roles into High, Medium, and Low fit buckets based on your skills and graduation year. Instead of searching every day, you get notified when strong matches open.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 selection:text-[#14281a]">
      {/* Background Subtle Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#84d64f]/15 via-[#84d64f]/5 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-4 pb-20">
        
        {/* ======================================================== */}
        {/* PREMIUM FLOATING NAVBAR */}
        {/* ======================================================== */}
        <header className="sticky top-4 z-50 rounded-[20px] border border-neutral-200/80 bg-white/85 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-[1.85rem] font-black tracking-[-0.04em] text-[#121816]">
                Sift<span className="text-[#58a826] transition-colors group-hover:text-[#4a911e]">role</span>
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-[0.95rem] font-semibold text-[#55615b]">
              <Link href="/jobs" className="text-[#3c7818] font-bold hover:text-[#58a826] transition-colors">
                All Jobs
              </Link>
              <Link href="/about" className="hover:text-[#121816] transition-colors">
                About
              </Link>
              <a href="#faq" className="hover:text-[#121816] transition-colors">
                FAQ
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/jobs"
                    className="hidden sm:inline-flex text-xs font-bold text-[#55615b] hover:text-[#121816] px-3 py-2 transition"
                  >
                    Browse Roles
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-5 py-2.5 text-xs sm:text-[0.9rem] font-heading font-bold text-[#14281a] shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98] inline-flex items-center gap-2"
                  >
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5 text-[#14281a]" />
                  </Link>
                </>
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
        {/* HERO SECTION */}
        {/* ======================================================== */}
        <section className="relative mt-8 sm:mt-12 lg:mt-14 pb-12 lg:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr]">
            
            {/* Left Column: Heading & Core Angle */}
            <div className="relative z-10">
              <h1 className="font-heading text-[3.2rem] sm:text-[4.4rem] lg:text-[4.9rem] font-extrabold tracking-[-0.035em] text-[#121816] leading-[1.05]">
                Thinking you applied to them all?<br />
                <span className="text-[#58a826]">Check the master list.</span>
              </h1>

              <p className="mt-6 max-w-[580px] text-[1.1rem] sm:text-[1.2rem] leading-[1.75] text-[#55615b]">
                Leave the job hunting to us, you just apply. We continuously monitor official career feeds across big tech companies, then use AI to match and rank the highest-fit roles for your resume in seconds.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/jobs"
                  className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-8 py-4 text-[1.05rem] font-heading font-bold text-[#14281a] shadow-[0_12px_28px_rgba(132,214,79,0.35)] transition active:scale-[0.98] inline-flex items-center gap-2"
                >
                  Explore Verified Roles <ArrowRight className="w-4 h-4 text-[#14281a]" />
                </Link>

                <Link
                  href="/jobs"
                  className="rounded-full border border-neutral-300/90 bg-white px-6 py-4 text-[1.02rem] font-heading font-bold text-[#14281a] hover:border-[#84d64f] hover:bg-[#eef8e5] transition shadow-sm inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#58a826]" />
                  Match With Resume
                </Link>
              </div>
            </div>

            {/* Right Column: Transparent Girl Cutout with Laptop */}
            <div className="relative flex items-center justify-center min-h-[480px] sm:min-h-[560px] lg:min-h-[620px]">
              {/* Soft ambient glow behind cutout */}
              <div className="absolute w-[440px] h-[440px] rounded-full bg-[#84d64f]/15 blur-3xl pointer-events-none -translate-y-3 sm:-translate-y-5 lg:-translate-y-7" />

              {/* Fully transparent cut-out image */}
              <div className="relative w-full max-w-[580px] h-[500px] sm:h-[580px] lg:h-[640px] -translate-y-3 sm:-translate-y-5 lg:-translate-y-7 transition-transform duration-300">
                <Image
                  src="/images/student_hero_green_sweater.png?v=2"
                  alt="Student developer finding verified tech roles on Siftrole"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-bottom sm:object-center drop-shadow-[0_25px_40px_rgba(0,0,0,0.12)] scale-105 sm:scale-110 lg:scale-115"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* METRICS ROW */}
        {/* ======================================================== */}
        <section className="border-t border-neutral-200/80 py-10 mt-4">
          <div className="grid gap-8 md:grid-cols-3">
            {metrics.map((metric, i) => (
              <div
                key={metric.value}
                className={`flex flex-col justify-center px-4 sm:px-8 py-2 ${
                  i < 2 ? "md:border-r md:border-neutral-200/80" : ""
                }`}
              >
                <div className="text-[3.2rem] sm:text-[4rem] font-black tracking-[-0.04em] text-[#121816] leading-none">
                  {metric.value}
                </div>
                <div className="mt-2 text-base font-bold text-[#121816]">
                  {metric.label}
                </div>
                <div className="mt-1 text-xs text-[#55615b]">
                  {metric.caption}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* WHY SIFTROLE BENTO GRID */}
        {/* ======================================================== */}
        <section id="about" className="py-16 scroll-mt-20">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-end">
            <div>
              <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#3c7818]">
                Why Siftrole
              </span>
              <h2 className="mt-2 text-[2.8rem] sm:text-[3.8rem] font-black leading-[1.06] tracking-[-0.04em] text-[#121816]">
                Built for signal, not noise.
              </h2>
            </div>
            <div className="pt-2 lg:pt-6 text-[1.15rem] leading-[1.8] text-[#55615b]">
              Every other platform competes on volume: more listings, more noise, more expired reposts. We compete on signal: every listing here is real, current, and verifiable directly back to its source.
            </div>
          </div>

          {/* Bento Layout Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Bento 1: Sourced, Not Scraped */}
            <div className="md:col-span-2 rounded-[28px] border border-neutral-200/80 bg-[#f2eee9] p-8 sm:p-10 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#eef8e5] border border-[#cce8be] text-[#14281a] text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                    Always Current
                  </span>
                  <span className="rounded-md bg-neutral-200/80 text-[#121915] text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                    Auto-Expiring
                  </span>
                </div>
                <h3 className="text-[2.2rem] sm:text-[2.6rem] font-black leading-[1.1] tracking-[-0.03em] text-[#121816] mt-4">
                  Sourced, not scraped.
                </h3>
                <p className="mt-4 text-[1.05rem] leading-[1.7] text-[#55615b] max-w-[620px]">
                  Every listing traces directly back to the company's official career page. The moment a role closes on the company's own site, it vanishes from ours: eliminating dead links sitting around for weeks.
                </p>
              </div>

              <div className="mt-8 relative h-[220px] rounded-[20px] overflow-hidden shadow-sm">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                  alt="Students collaborating on projects"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Bento 2: Zero Spam & Verified Startups */}
            <div className="rounded-[28px] bg-[#14281a] p-8 text-white flex flex-col justify-between shadow-md">
              <div>
                <span className="rounded-md bg-[#84d64f]/20 text-[#84d64f] text-xs font-bold px-2.5 py-1 uppercase tracking-wider border border-[#84d64f]/30">
                  Zero Spam
                </span>
                <h3 className="text-[2rem] font-black leading-[1.15] tracking-[-0.03em] text-white mt-4">
                  Verified startups only.
                </h3>
                <p className="mt-3 text-sm leading-[1.7] text-[#eef8e5]/90">
                  Every non-top-company post is manually checked before going live. No anonymous postings, no fake recruitment ads.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-[#84d64f]">100% Verified Source Gate</span>
                <ShieldCheck className="w-5 h-5 text-[#84d64f]" />
              </div>
            </div>

            {/* Bento 3: One Feed */}
            <div className="rounded-[28px] border border-neutral-200/80 bg-white p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#eef8e5] text-[#3c7818] flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-[1.8rem] font-black tracking-[-0.02em] text-[#121816]">
                  One feed, not fifty tabs.
                </h4>
                <p className="mt-3 text-sm leading-[1.65] text-[#55615b]">
                  Top tech company openings across Greenhouse, Lever, Ashby, and SmartRecruiters in one clean stream.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#14281a]">
                <ShieldCheck className="w-4 h-4 text-[#3c7818]" />
                <span>Direct ATS sync</span>
              </div>
            </div>

            {/* Bento 4: Resume-Matched */}
            <div className="rounded-[28px] border border-neutral-200/80 bg-white p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-[#eef8e5] border border-[#cce8be] text-[#14281a] text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    Smart Rank
                  </span>
                  <Sparkles className="w-4 h-4 text-[#58a826]" />
                </div>
                <div className="text-[1.8rem] font-black tracking-[-0.02em] text-[#121816]">
                  Resume-matched.
                </div>
                <p className="mt-2 text-sm leading-[1.65] text-[#55615b]">
                  Upload your resume once. Open roles are ranked as High, Medium, or Low fit based on your exact profile.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#14281a]">
                  <BellRing className="w-4 h-4 text-[#58a826]" />
                  <span>Passive discovery alerts</span>
                </div>
              </div>
            </div>

            {/* Bento 5: Application Tracking */}
            <div className="rounded-[28px] border border-neutral-200/80 bg-white p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-10 w-10 rounded-xl bg-neutral-100 text-[#121816] flex items-center justify-center mb-3">
                  <ClipboardCheck className="w-5 h-5 text-[#3c7818]" />
                </div>
                <h4 className="text-[1.7rem] font-black tracking-[-0.02em] text-[#121816]">
                  Application tracking.
                </h4>
                <p className="mt-2 text-sm leading-[1.65] text-[#55615b]">
                  One unified place to track applied, interviewed, offered, and rejected across every role you pursue.
                </p>
              </div>
              <Link
                href="/jobs"
                className="mt-6 text-xs font-bold text-[#3c7818] inline-flex items-center gap-1 hover:text-[#58a826]"
              >
                Explore opportunities <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* FEATURED OPPORTUNITIES SECTION (CURATED PREVIEW) */}
        {/* ======================================================== */}
        <section id="jobs" className="pt-16 pb-20 scroll-mt-20">
          {/* Section Heading with Direct CTA */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#3c7818]">
                Featured Roles
              </span>
              <h2 className="mt-2 text-[2.6rem] sm:text-[3.4rem] font-black leading-[1.06] tracking-[-0.04em] text-[#121816]">
                Recently Verified Openings
              </h2>
              <p className="mt-2 text-sm font-medium text-[#55615b]">
                A preview of active roles parsed with AI. Explore the full board for 990+ live positions.
              </p>
            </div>

            <Link
              href="/jobs"
              className="text-xs sm:text-sm font-extrabold text-[#3c7818] hover:text-[#58a826] inline-flex items-center gap-1.5 transition group"
            >
              <span>View all {totalListingsCount || "990+"} live listings</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Job Preview Feed */}
          <div className="space-y-4">
            {isLoadingListings ? (
              <div className="py-20 text-center bg-white rounded-[26px] border border-neutral-200/80 text-[#79857f]">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#84d64f] border-t-transparent mb-3" />
                <p className="text-xs font-bold">Loading verified positions...</p>
              </div>
            ) : featuredListings.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-[26px] border border-neutral-200/80 p-8">
                <Briefcase className="w-10 h-10 text-[#b0bcba] mx-auto mb-2" />
                <h3 className="font-extrabold text-base text-[#121816]">Checking company career feeds...</h3>
                <Link
                  href="/jobs"
                  className="mt-4 inline-block rounded-xl bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] text-xs font-bold px-5 py-2.5 shadow-sm"
                >
                  Open Full Job Board
                </Link>
              </div>
            ) : (
              featuredListings.map((job, idx) => {
                const applied = isApplied(job.id);
                return (
                  <Link
                    key={job.id || job.raw_jd_hash || idx}
                    href={`/jobs/${job.id}`}
                    className={`block group rounded-[24px] border p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-[#84d64f] hover:bg-[#eef8e5] hover:shadow-md cursor-pointer relative overflow-hidden ${
                      applied
                        ? "border-[#84d64f]/70 bg-[#f7fcf3]"
                        : "border-neutral-200/90 bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left Block */}
                      <div className="flex-1 min-w-0">
                        {/* Company Logo + Domain + Applied Badge */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <CompanyLogo
                            company={job.company}
                            size="sm"
                            className="!h-5 !w-5 !p-0 rounded-md border-0 bg-transparent shadow-none"
                          />
                          <span className="text-xs sm:text-sm font-bold text-[#14281a] tracking-tight">
                            {getCompanyDomain(job.company)}
                          </span>

                          {applied && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#14281a] text-[#84d64f] text-[0.68rem] font-extrabold px-2.5 py-0.5 shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-[#84d64f]" />
                              Applied
                            </span>
                          )}
                        </div>

                        {/* Job Title */}
                        <h3 className="text-xl sm:text-[1.35rem] font-black text-[#121816] tracking-tight mt-2 mb-3.5 group-hover:text-[#3c7818] transition-colors">
                          {job.title}
                        </h3>

                        {/* Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2">
                          {job.experience_level && (
                            <span className="rounded-full border border-neutral-300/80 bg-white/70 px-4 py-1 text-xs font-semibold text-[#14281a] shadow-2xs">
                              {job.experience_level.toLowerCase().includes("experience")
                                ? job.experience_level
                                : `${job.experience_level} Experience`}
                            </span>
                          )}
                          {job.employment_type && (
                            <span className="rounded-full border border-neutral-300/80 bg-white/70 px-4 py-1 text-xs font-semibold text-[#14281a] shadow-2xs">
                              {job.employment_type}
                            </span>
                          )}
                          {job.eligibility && (
                            <span className="rounded-full border border-neutral-300/80 bg-white/70 px-4 py-1 text-xs font-semibold text-[#14281a] shadow-2xs">
                              {job.eligibility}
                            </span>
                          )}
                          {job.skills_required &&
                            job.skills_required.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-neutral-300/80 bg-white/70 px-4 py-1 text-xs font-semibold text-[#14281a] shadow-2xs"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Right Block: Compensation & Location & Mark Applied Button */}
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

                        {/* Mark as Applied Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleApplied(job.id, e)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer z-10 ${
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
                  </Link>
                );
              })
            )}
          </div>

          {/* Centered See More Job Pill Button */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/jobs"
              className="rounded-full border border-[#14281a] hover:bg-[#84d64f] hover:border-[#84d64f] hover:text-[#14281a] text-[#14281a] px-9 py-3 text-xs sm:text-sm font-bold transition-all shadow-2xs inline-flex items-center gap-2 active:scale-[0.98]"
            >
              See More Job
            </Link>
          </div>
        </section>

        {/* ======================================================== */}
        {/* FAQ SECTION */}
        {/* ======================================================== */}
        <section id="faq" className="py-16 scroll-mt-20 border-t border-neutral-200/80">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-10">
              <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#3c7818]">
                Got Questions?
              </span>
              <h2 className="mt-2 text-[2.4rem] sm:text-[3.2rem] font-black tracking-[-0.03em] text-[#121816]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-[20px] border border-neutral-200/80 bg-white overflow-hidden shadow-sm transition"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full text-left p-6 font-black text-base sm:text-lg text-[#121816] flex items-center justify-between gap-4"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#79857f] transition-transform duration-200 shrink-0 ${
                          isOpen ? "rotate-180 text-[#3c7818]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-sm leading-[1.75] text-[#55615b] border-t border-neutral-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* EXACT EMERALD SILK NEWSLETTER CARD */}
        {/* ======================================================== */}
        <section
          data-footer-zone="true"
          className="mt-16 sm:mt-24 relative overflow-hidden rounded-[32px] sm:rounded-[38px] min-h-[340px] sm:min-h-[380px] flex flex-col justify-center items-center text-center p-8 sm:p-14 lg:p-16 shadow-2xl border border-[#14281a]"
        >
          {/* Interactive 3D WebGL Liquid Silk Background */}
          <LiquidSilkBackground imageSrc="/images/emerald_silk_horizontal.jpg" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a180e]/50 via-transparent to-[#0a180e]/50 pointer-events-none" />

          {/* Headline */}
          <h2 className="relative z-10 text-[2rem] sm:text-[2.75rem] lg:text-[3.15rem] font-medium sm:font-semibold tracking-[-0.02em] leading-[1.18] text-white/95 max-w-[720px] mx-auto drop-shadow-sm">
            Subscribe to our newsletter to get job updates.
          </h2>

          {/* Form Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribedEmail(true);
              setTimeout(() => setSubscribedEmail(false), 3500);
            }}
            className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-[640px] mx-auto"
          >
            <div className="relative w-full sm:w-[400px]">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-full border border-white/40 bg-black/25 backdrop-blur-xs px-6 py-3.5 text-sm text-white placeholder:text-white/70 outline-none focus:border-white/90 transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-6 py-3 text-sm font-bold transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.98]"
            >
              <span>{subscribedEmail ? "Subscribed!" : "Subscribe"}</span>
              <span className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[#14281a] shrink-0 shadow-2xs">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </form>
        </section>

        {/* ======================================================== */}
        {/* FOOTER NAVIGATION & OPTIONS */}
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
                <li><Link href="/jobs" className="hover:text-[#3c7818] transition">Career</Link></li>
                <li><Link href="/#faq" className="hover:text-[#3c7818] transition">Contact</Link></li>
                <li><Link href="/jobs" className="hover:text-[#3c7818] transition">Blog</Link></li>
              </ul>
            </div>

            {/* Col: Support */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Support
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/dashboard" className="hover:text-[#3c7818] transition">License</Link></li>
                <li><Link href="/#about" className="hover:text-[#3c7818] transition">Style Guide</Link></li>
                <li><Link href="/jobs" className="hover:text-[#3c7818] transition">Changelog</Link></li>
              </ul>
            </div>

            {/* Col: Social */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">
                Social
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#3c7818] transition">LinkedIn</a></li>
                <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#3c7818] transition">Instagram</a></li>
              </ul>
            </div>
          </div>

          {/* Sub-row */}
          <div className="pt-8 border-t border-neutral-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#55615b]">
            <div>100% Direct Official Feeds</div>
            <div>support@siftrole.com</div>
            <div>&copy; {new Date().getFullYear()} Siftrole Legal</div>
          </div>

          {/* ======================================================== */}
          {/* MASSIVE BOTTOM SIFTROLE WORDMARK */}
          {/* ======================================================== */}
          <div className="pt-10 pb-4 select-none overflow-hidden text-center text-[#14281a]">
            <span className="text-[13vw] sm:text-[14vw] font-black tracking-[-0.04em] leading-none uppercase select-none text-[#14281a] inline-block">
              SIFTROLE
            </span>
          </div>
        </footer>

      </div>

      {/* ======================================================== */}
      {/* ROLE DETAIL SLIDING MODAL (VIEW FULL JD) */}
      {/* ======================================================== */}
      {selectedListingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-7 sm:p-9 shadow-2xl border border-neutral-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <CompanyLogo company={selectedListingModal.company} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3c7818]">
                      {selectedListingModal.company}
                    </span>
                    <span className="rounded-full bg-[#eef8e5] border border-[#cce8be] text-[#14281a] text-[0.65rem] font-bold px-2.5 py-0.5 inline-flex items-center gap-1">
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
                className="h-9 w-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-sm font-bold transition shrink-0"
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
                <div className="flex items-center gap-1.5 text-[#14281a]">
                  <DollarSign className="w-3.5 h-3.5 text-[#3c7818]" />
                  <span>{selectedListingModal.stipend_or_salary}</span>
                </div>
              )}
              {selectedListingModal.experience_level && (
                <div className="flex items-center gap-1.5 text-[#55615b]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{selectedListingModal.experience_level}</span>
                </div>
              )}
            </div>

            {/* Full Job Description Section */}
            <div className="mt-6">
              <div className="flex items-center gap-1.5 mb-2.5">
                <FileText className="w-4 h-4 text-[#3c7818]" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#121816]">
                  Job Description & Role Overview
                </h4>
              </div>
              <div className="bg-[#fbfaf8] border border-neutral-200/80 rounded-2xl p-5 text-xs font-sans leading-[1.8] text-[#44504b] whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {selectedListingModal.raw_jd_text || (
                  <div className="space-y-3">
                    <p>
                      This role is actively listed and verified on {selectedListingModal.company}'s official careers ATS portal.
                    </p>
                    <p>
                      Location: {selectedListingModal.location}. Employment Type: {selectedListingModal.employment_type || "Direct Hire"}.
                    </p>
                    <p>
                      Click "Apply Directly on Official Portal" below to submit your application directly on the employer's portal with zero third-party intermediaries.
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
                    <span key={s} className="rounded-xl bg-[#eef8e5] text-[#14281a] font-bold text-xs px-3 py-1.5 border border-[#cce8be]">
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
                className="rounded-xl border border-neutral-200/80 hover:bg-neutral-100 px-4 py-3 text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? "Link Copied!" : "Share Link"}
              </button>

              <a
                href={selectedListingModal.apply_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center rounded-[14px] bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] py-3.5 font-extrabold text-sm shadow-[0_8px_20px_rgba(132,214,79,0.3)] transition inline-flex items-center justify-center gap-2"
              >
                Apply on Official Portal
                <ExternalLink className="w-4 h-4 text-[#14281a]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
