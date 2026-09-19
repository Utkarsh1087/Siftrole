"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Send,
  Mail,
  AlertCircle,
} from "lucide-react";
import { CompanyLogo, getCompanyDomain } from "@/components/CompanyLogo";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";
import { NewsletterSection } from "@/components/NewsletterSection";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";
import { JobDetailModal } from "@/components/JobDetailModal";
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

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [totalListingsCount, setTotalListingsCount] = useState<number>(0);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [selectedListingModal, setSelectedListingModal] = useState<Listing | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribedEmail, setSubscribedEmail] = useState(false);
  const { appliedJobIds, toggleApplied, isApplied } = useAppliedJobs();
  const { isLoggedIn, isLoaded } = useAuth();

  // Contact / Feedback form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCategory, setContactCategory] = useState("Feedback");
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;
    setIsSendingContact(true);
    setContactError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim().toLowerCase(),
          topic: contactCategory,
          message: contactMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      console.error("Contact form error:", err);
      setContactError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSendingContact(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isLoggedIn) {
      router.replace("/jobs");
    }
  }, [isLoaded, isLoggedIn, router]);

  const metrics: { value: React.ReactNode; label: string; caption: string }[] = [
    { value: "100%", label: "Direct from company career feeds", caption: "Zero scraped third-party reposts" },
    {
      value: totalListingsCount > 0 ? (
        `${totalListingsCount.toLocaleString()}+`
      ) : isLoadingListings ? (
        <span className="inline-block w-28 h-10 bg-neutral-200/70 rounded-xl animate-pulse align-middle" />
      ) : (
        "0+"
      ),
      label: "Verified active tech opportunities",
      caption: "Synced across official company career portals",
    },
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
        setTotalListingsCount(typeof data.total === "number" ? data.total : listings.length);
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

  if (isLoaded && isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#14281a] border-t-transparent animate-spin" />
      </div>
    );
  }

  const faqs = [
    {
      q: "How does Siftrole guarantee every job listing is verified and active?",
      a: "Every listing is pulled directly from official company career feeds and applicant tracking systems (like Greenhouse, Lever, Ashby, and SmartRecruiters). The second a role closes on a company's career page, our sync pipeline removes it from Siftrole, eliminating ghost jobs, duplicate reposts, and dead links.",
    },
    {
      q: "How does the AI Resume Match scoring work?",
      a: "Upload your resume or set your target tech stack and graduation year. Our AI parser analyzes the job description's core requirements, skills, and eligibility criteria, ranking roles as High, Medium, or Low fit so you can focus your time on opportunities where you stand out.",
    },
    {
      q: "What is the AI Cold Email & HR Outreach generator?",
      a: "Siftrole includes an AI-powered outreach generator that drafts personalized, high-converting cold emails and LinkedIn messages tailored to each specific company and role, helping you connect directly with hiring managers and recruiters.",
    },
    {
      q: "Can I track my job applications directly on Siftrole?",
      a: "Yes! Siftrole includes a built-in Application Tracker in your dashboard. You can mark jobs as Applied, track your interview stages, take notes, and keep your entire job search organized in one clean interface.",
    },
    {
      q: "How often are new tech opportunities added and updated?",
      a: "Our automated sync pipeline continuously monitors official career feeds throughout the day, bringing in verified internships, new grad roles, and full-time engineering positions within minutes of companies publishing them.",
    },
    {
      q: "Is Siftrole completely free for students and developers?",
      a: "Yes, 100% free. You can search, filter, generate outreach emails, match resumes, and click directly to official application portals without paywalls or subscription gates.",
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
            <Link href="/" className="flex items-center gap-2.5 group">
              <SiftroleLogoMark size={32} />
              <span className="text-[1.85rem] font-black tracking-[-0.04em] text-[#121816]">
                Sift<span className="text-[#58a826] transition-colors group-hover:text-[#4a911e]">role</span>
              </span>
            </Link>

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
        <section className="relative mt-8 sm:mt-12 lg:mt-14 pb-4 sm:pb-6">
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

          {/* ======================================================== */}
          {/* CASCADING GLOWING CHEVRONS SCROLL PROMPT */}
          {/* ======================================================== */}
          <div className="relative z-20 -mt-2 sm:-mt-6 lg:-mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
              aria-label="Scroll down to explore verified opportunities"
              className="group flex flex-col items-center justify-center p-2 transition-all hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
            >
              <div className="flex flex-col items-center -space-y-3 drop-shadow-[0_0_8px_rgba(132,214,79,0.6)]">
                <svg
                  className="w-6 h-6 text-[#84d64f] animate-[pulse_1.4s_infinite_100ms] opacity-60 transition-colors group-hover:opacity-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <svg
                  className="w-6 h-6 text-[#58a826] animate-[pulse_1.4s_infinite_350ms] opacity-80 transition-colors group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <svg
                  className="w-6 h-6 text-[#14281a] animate-[pulse_1.4s_infinite_600ms] transition-colors group-hover:text-[#2d5d11]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>
          </div>
        </section>

        {/* ======================================================== */}
        {/* METRICS ROW */}
        {/* ======================================================== */}
        <section className="border-t border-neutral-200/80 py-10 mt-4">
          <div className="grid gap-8 md:grid-cols-3">
            {metrics.map((metric, i) => (
              <div
                key={metric.label}
                className={`flex flex-col justify-center px-4 sm:px-8 py-2 ${
                  i < 2 ? "md:border-r md:border-neutral-200/80" : ""
                }`}
              >
                <div className="text-[3.2rem] sm:text-[4rem] font-black tracking-[-0.04em] text-[#121816] leading-none min-h-[4rem] flex items-center">
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
        {/* FEATURED OPPORTUNITIES SECTION (CURATED PREVIEW) */}
        {/* ======================================================== */}
        <section id="jobs" className="py-16 scroll-mt-20">
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
                A preview of active roles parsed with AI. Explore the full board for {totalListingsCount > 0 ? `${totalListingsCount.toLocaleString()}+` : "all verified"} live positions.
              </p>
            </div>

            <Link
              href="/jobs"
              className="text-xs sm:text-sm font-extrabold text-[#3c7818] hover:text-[#58a826] inline-flex items-center gap-1.5 transition group"
            >
              <span>View all {totalListingsCount > 0 ? `${totalListingsCount.toLocaleString()}+` : "verified"} live listings</span>
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
                        {/* Company Logo + Domain */}
                        <div className="flex items-center gap-2">
                          <CompanyLogo
                            company={job.company}
                            size="sm"
                            className="!h-5 !w-5 !p-0 rounded-md border-0 bg-transparent shadow-none"
                          />
                          <span className="text-xs sm:text-sm font-bold text-[#14281a] tracking-tight">
                            {getCompanyDomain(job.company)}
                          </span>
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
        {/* WHY SIFTROLE BENTO GRID */}
        {/* ======================================================== */}
        <section id="about" className="py-16 scroll-mt-20">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-end">
            <div>
              <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#3c7818]">
                Why Siftrole
              </span>
              <h2 className="mt-2 text-[2.8rem] sm:text-[3.8rem] font-black leading-[1.06] tracking-[-0.04em] text-[#121816]">
                Only verified jobs. Zero ghost posts.
              </h2>
            </div>
            <div className="pt-2 lg:pt-6 flex flex-col items-start gap-4">
              <p className="text-[1.15rem] leading-[1.8] text-[#55615b]">
                Every role links directly to official company career pages. When a position closes, it's removed immediately so you never waste time on dead links.
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-full bg-[#14281a] hover:bg-[#1f3d27] text-[#84d64f] px-6 py-3 text-xs sm:text-sm font-bold transition shadow-xs"
              >
                <span>Browse Verified Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
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
                  Top tech company openings across official career portals in one clean, unified stream.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#14281a]">
                <ShieldCheck className="w-4 h-4 text-[#3c7818]" />
                <span>Direct company sync</span>
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
        {/* FAQ & WE WOULD LIKE TO HEAR FROM YOU SECTION */}
        {/* ======================================================== */}
        <section id="faq" className="py-16 sm:py-20 scroll-mt-20 border-t border-neutral-200/80">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-14 items-start">
            
            {/* Left Column: FAQ Accordion */}
            <div>
              <div className="mb-8">
                <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#3c7818]">
                  Got Questions?
                </span>
                <h2 className="mt-2 text-[2.2rem] sm:text-[2.8rem] font-black tracking-[-0.03em] text-[#121816] leading-[1.1]">
                  Frequently Asked Questions
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#55615b]">
                  Everything you need to know about our verified feeds, AI tools, and matching.
                </p>
              </div>

              <div className="space-y-3.5">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={faq.q}
                      className={`rounded-[20px] border transition-all duration-300 overflow-hidden shadow-2xs ${
                        isOpen
                          ? "border-[#84d64f]/60 bg-white shadow-sm ring-1 ring-[#84d64f]/20"
                          : "border-neutral-200/80 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full text-left p-5 sm:p-6 font-black text-sm sm:text-base text-[#121816] flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50 transition-colors"
                      >
                        <span className={`leading-snug transition-colors duration-200 ${isOpen ? "text-[#14281a]" : "text-[#121816]"}`}>
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#79857f] transition-transform duration-300 shrink-0 ${
                            isOpen ? "rotate-180 text-[#3c7818]" : ""
                          }`}
                        />
                      </button>

                      {/* Smooth expanding container */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                          isOpen
                            ? "[grid-template-rows:1fr] opacity-100"
                            : "[grid-template-rows:0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 text-xs sm:text-sm leading-[1.75] text-[#55615b] border-t border-neutral-100 bg-[#fafcfa]/60">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: We Would Like to Hear From You Form Card */}
            <div className="lg:sticky lg:top-24 rounded-[28px] border border-neutral-200/90 bg-white p-7 sm:p-9 shadow-md shadow-neutral-200/40 relative overflow-hidden">
              {/* Subtle radiant background accent */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#84d64f]/25 via-[#84d64f]/5 to-transparent rounded-bl-full pointer-events-none" />

              <div>
                <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-[#3c7818]">
                  Get In Touch
                </span>
                <h3 className="mt-2 text-2xl sm:text-[1.75rem] font-black tracking-tight text-[#121816]">
                  We would like to hear from you
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#55615b] leading-relaxed">
                  Have feedback, a feature suggestion, or spotted a company career feed we should track? Send us a message directly.
                </p>
              </div>

              {contactSuccess ? (
                <div className="mt-6 rounded-2xl border border-[#cce8be] bg-[#f7fcf3] p-6 text-center animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-[#3c7818] mx-auto mb-2" />
                  <h4 className="font-extrabold text-sm text-[#14281a]">Thank you for reaching out!</h4>
                  <p className="text-xs text-[#556958] mt-1.5 leading-relaxed">
                    Your message has been sent directly to our team. We read every note and will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactSuccess(false)}
                    className="mt-4 text-xs font-bold text-[#3c7818] hover:text-[#58a826] underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-6 space-y-3.5">
                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-wider text-[#45524d] mb-1.5">
                      Your Name <span className="text-neutral-400 font-normal text-[0.7rem]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value);
                        setContactError(null);
                      }}
                      placeholder="Alex Morgan"
                      className="w-full rounded-xl border border-neutral-200 bg-[#fafcfa] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#121816] placeholder:text-neutral-400 outline-none transition focus:border-[#84d64f] focus:bg-white focus:ring-2 focus:ring-[#84d64f]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-wider text-[#45524d] mb-1.5">
                      Email Address <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        setContactError(null);
                      }}
                      placeholder="you@domain.com"
                      className="w-full rounded-xl border border-neutral-200 bg-[#fafcfa] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#121816] placeholder:text-neutral-400 outline-none transition focus:border-[#84d64f] focus:bg-white focus:ring-2 focus:ring-[#84d64f]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-wider text-[#45524d] mb-1.5">
                      Topic
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Feedback", "Feature Request", "Other"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setContactCategory(cat)}
                          className={`rounded-lg py-1.5 px-2 text-[0.75rem] font-bold transition text-center cursor-pointer border ${
                            contactCategory === cat
                              ? "bg-[#14281a] text-[#84d64f] border-[#14281a] shadow-2xs"
                              : "bg-[#fafcfa] text-[#55615b] border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-wider text-[#45524d] mb-1.5">
                      Message <span className="text-red-500 font-bold">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => {
                        setContactMessage(e.target.value);
                        setContactError(null);
                      }}
                      placeholder="Tell us what you think or how we can help..."
                      className="w-full rounded-xl border border-neutral-200 bg-[#fafcfa] p-3 text-xs sm:text-sm font-medium text-[#121816] placeholder:text-neutral-400 outline-none transition focus:border-[#84d64f] focus:bg-white focus:ring-2 focus:ring-[#84d64f]/20 resize-none"
                    />
                  </div>

                  {contactError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingContact}
                    className="w-full rounded-xl bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] font-bold text-xs sm:text-sm py-3 shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2 mt-1"
                  >
                    {isSendingContact ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-[#14281a] border-t-transparent animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-center text-[0.72rem] text-[#718276]">
                <a
                  href="mailto:support@siftrole.in"
                  className="inline-flex items-center gap-1.5 hover:text-[#3c7818] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#3c7818]" />
                  <span>support@siftrole.in</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* EXACT EMERALD SILK NEWSLETTER CARD */}
        {/* ======================================================== */}
        <NewsletterSection />

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
                <li><Link href="/jobs" className="hover:text-[#3c7818] transition">Opportunities</Link></li>
                <li><a href="#faq" className="hover:text-[#3c7818] transition">FAQ</a></li>
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
      {/* ROLE DETAIL SLIDING MODAL (VIEW FULL JD) */}
      {/* ======================================================== */}
      {selectedListingModal && (
        <JobDetailModal
          listing={selectedListingModal as any}
          onClose={() => setSelectedListingModal(null)}
        />
      )}
    </main>
  );
}
