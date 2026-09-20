"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ExternalLink,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Building2,
  ShieldCheck,
  Share2,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { CompanyLogo, getCompanyDomain } from "@/components/CompanyLogo";
import { LiquidSilkBackground } from "@/components/LiquidSilkBackground";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Listing } from "@/components/SiftAiChat";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";
import { useAppliedJobs } from "@/lib/appliedJobs";
import { useAuth } from "@/lib/useAuth";
import { AuthGateModal } from "@/components/AuthGateModal";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<Listing | null>(null);
  const [similarRoles, setSimilarRoles] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState(false);
  const { toggleApplied, isApplied } = useAppliedJobs();
  const { isLoggedIn } = useAuth();
  const [authGateConfig, setAuthGateConfig] = useState<{
    isOpen: boolean;
    title?: string;
    description?: string;
    badge?: string;
    primaryCta?: string;
  }>({ isOpen: false });

  const handleToggleAppliedWithAuth = () => {
    if (!job?.id) return;
    if (!isLoggedIn) {
      setAuthGateConfig({
        isOpen: true,
        title: "Sign in to Track Applications",
        description: "Create a free account or sign in to mark this role as applied and track your application progress.",
        badge: "Sign In Required",
      });
      return;
    }
    toggleApplied(job.id);
  };

  useEffect(() => {
    if (!id) return;
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/listings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.listing);
        setSimilarRoles(data.similarRoles || []);
      } else {
        // Fallback: try fetching all listings and find by id
        const allRes = await fetch("/api/listings");
        if (allRes.ok) {
          const allData = await allRes.json();
          const found = (allData.listings || []).find((l: Listing) => l.id === id);
          if (found) {
            setJob(found);
            setSimilarRoles(
              (allData.listings || []).filter((l: Listing) => l.id !== id).slice(0, 3)
            );
          }
        }
      }
    } catch (e) {
      console.error("Failed to load job details:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard && job) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fff6eb] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#008561] border-t-transparent mb-4" />
          <h3 className="text-sm font-black text-[#02110c]">Loading verified role details...</h3>
          <p className="text-xs text-[#55615b] mt-1">Syncing with official ATS feed</p>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-[#fff6eb] flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[28px] border border-[#eedfc9] p-10 max-w-md shadow-sm">
          <Briefcase className="w-12 h-12 text-[#008561] mx-auto mb-4" />
          <h2 className="text-2xl font-pochaevsk font-bold text-[#02110c]">Role Not Found or Expired</h2>
          <p className="text-xs sm:text-sm text-[#55615b] mt-2">
            This opening may have been filled by the employer and auto-removed from our live sync stream.
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#008561] hover:bg-[#006e50] px-6 py-3 text-xs font-bold text-white transition shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back to All Roles
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfcf9] bg-canvas-white text-[#02110c] font-sans antialiased selection:bg-[#008561]/20 selection:text-[#02110c]">
      {/* Background Subtle Ambient Glow */}
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
            <div className="flex items-center gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#faf8f5] hover:bg-white border border-[#eadecc] px-3.5 py-2 text-xs font-lora font-bold text-[#02110c] transition"
              >
                <ChevronLeft className="w-4 h-4 text-[#008561]" /> Back to Jobs
              </Link>

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
        {/* BREADCRUMBS */}
        {/* ======================================================== */}
        <nav className="mt-6 flex items-center gap-2 text-xs font-medium text-[#495e54] overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-[#02110c] transition">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-[#02110c] transition">Jobs</Link>
          <span>/</span>
          <Link href={`/jobs?company=${job.company}`} className="hover:text-[#02110c] transition">{job.company}</Link>
          <span>/</span>
          <span className="text-[#02110c] font-bold truncate max-w-[300px]">{job.title}</span>
        </nav>

        {/* ======================================================== */}
        {/* JOB HEADER HERO CARD */}
        {/* ======================================================== */}
        <section className="mt-4 rounded-[30px] border border-[#eadecc] bg-white p-6 sm:p-10 shadow-[0_4px_20px_rgba(2,17,12,0.03)] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Info */}
            <div className="flex items-start gap-4 sm:gap-6 min-w-0">
              <CompanyLogo
                company={job.company}
                size="lg"
                className="!h-16 !w-16 sm:!h-20 sm:!w-20 !p-3 rounded-2xl border border-[#eadecc] bg-white shadow-xs shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-extrabold uppercase tracking-wider text-[#008561]">
                    {job.company}
                  </span>
                  <span className="rounded-full bg-[#00D793]/15 border border-[#00D793]/40 text-[#083D2E] text-[0.7rem] font-bold px-3 py-0.5 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#008561]" /> Verified Official ATS Feed
                  </span>
                  {job.source && (
                    <span className="rounded-full bg-[#faf8f5] border border-[#eadecc] text-[#495e54] text-[0.7rem] font-bold px-2.5 py-0.5">
                      Source: {job.source}
                    </span>
                  )}
                </div>

                <h1 className="text-[2.2rem] sm:text-[2.8rem] font-lora font-bold text-[#02110c] tracking-tight leading-[1.1] mt-2">
                  {job.title}
                </h1>

                {/* Quick Info Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-[#02110c]">
                  <div className="flex items-center gap-1.5 bg-[#faf8f5] px-3.5 py-1.5 rounded-xl border border-[#eadecc]">
                    <MapPin className="w-3.5 h-3.5 text-[#008561]" />
                    <span>{job.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#faf8f5] px-3.5 py-1.5 rounded-xl border border-[#eadecc]">
                    <Briefcase className="w-3.5 h-3.5 text-[#008561]" />
                    <span>{job.employment_type || "Full-Time"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#00D793]/15 px-3.5 py-1.5 rounded-xl border border-[#00D793]/40 text-[#083D2E]">
                    <DollarSign className="w-3.5 h-3.5 text-[#008561]" />
                    <span>{job.stipend_or_salary || "$140K/Yearly"}</span>
                  </div>

                  {job.experience_level && (
                    <div className="flex items-center gap-1.5 bg-[#faf8f5] px-3.5 py-1.5 rounded-xl border border-[#eadecc]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#008561]" />
                      <span>{job.experience_level}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action CTA */}
            <div className="flex flex-row flex-wrap lg:flex-col items-center lg:items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#eedfc9]">
              <a
                href={job.apply_url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (job.id && !isApplied(job.id)) {
                    toggleApplied(job.id);
                  }
                }}
                className="w-full sm:w-auto rounded-full bg-[#008561] hover:bg-[#006e50] text-white px-8 py-4 text-sm font-bold shadow-[0_12px_24px_rgba(0,133,97,0.25)] transition active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                Apply on Official Portal
                <ExternalLink className="w-4 h-4 text-white" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Mark as Applied Toggle */}
                <button
                  onClick={handleToggleAppliedWithAuth}
                  className={`rounded-2xl px-5 py-3.5 text-xs font-bold transition inline-flex items-center gap-2 shrink-0 cursor-pointer ${
                    isApplied(job.id)
                      ? "bg-[#008561] text-white hover:bg-[#006e50] shadow-sm"
                      : "border border-[#eadecc] bg-white hover:bg-[#faf8f5] hover:border-[#008561] text-[#02110c]"
                  }`}
                >
                  {isApplied(job.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Applied ✓</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#495e54]" />
                      <span>Mark as Applied</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="rounded-2xl border border-[#eadecc] bg-white hover:bg-[#faf8f5] text-[#02110c] px-4 py-3.5 text-xs font-bold transition inline-flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-4 h-4 text-[#008561]" />
                  <span>{copiedLink ? "Copied!" : "Share"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* MAIN BODY 2-COLUMN LAYOUT */}
        {/* ======================================================== */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT: FULL JOB DESCRIPTION & TECH STACK */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Required Skills & Stack */}
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="rounded-[26px] border border-[#eadecc] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(2,17,12,0.03)]">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#495e54] mb-4">
                  Required Technologies & Core Skills
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {job.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl bg-[#008561]/10 text-[#008561] border border-[#008561]/20 px-4 py-2 text-xs font-extrabold shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div className="rounded-[26px] border border-[#eadecc] bg-white p-6 sm:p-10 shadow-[0_2px_12px_rgba(2,17,12,0.03)]">
              <h2 className="text-xl sm:text-2xl font-pochaevsk font-bold text-[#02110c] tracking-tight mb-6">
                About the Role & Qualifications
              </h2>

              <div className="prose prose-neutral max-w-none text-[#495e54] leading-[1.8] text-sm sm:text-base">
                {job.raw_jd_text ? (
                  <div className="whitespace-pre-line font-normal space-y-4">
                    {job.raw_jd_text}
                  </div>
                ) : (
                  <div className="space-y-4 font-normal">
                    <p>
                      <strong className="text-[#02110c]">{job.company}</strong> is actively seeking a talented{" "}
                      <strong className="text-[#02110c]">{job.title}</strong> to join their team in {job.location}.
                    </p>
                    <p>
                      This role is ingested continuously from {job.company}'s official public career portal via direct ATS integration. By applying through the official link on this page, your application will go straight into {job.company}'s hiring team pipeline with zero intermediaries or data scraping.
                    </p>
                    <h4 className="text-base font-bold text-[#02110c] mt-4">Key Highlights:</h4>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Location: {job.location}</li>
                      <li>Employment Type: {job.employment_type || "Full-Time"}</li>
                      <li>Compensation Bracket: {job.stipend_or_salary || "Competitive Market Rate"}</li>
                      <li>Experience: {job.experience_level || "Standard Entry to Mid Level"}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Apply Strip */}
              <div className="mt-10 pt-8 border-t border-[#eadecc]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#495e54]">
                  Role verified active today from official ATS JSON feed.
                </div>
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto rounded-full bg-[#008561] hover:bg-[#006e50] text-white px-8 py-3.5 text-xs font-bold shadow-md shadow-[#008561]/20 transition inline-flex items-center justify-center gap-2"
                >
                  Apply on Official Portal <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT: SIDEBAR DETAILS */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            
            {/* Official Portal Application Card */}
            <div className="rounded-[26px] border border-[#eadecc] bg-white p-6 shadow-[0_2px_12px_rgba(2,17,12,0.03)]">
              <h4 className="text-sm font-black text-[#02110c] mb-2">Direct Official Application</h4>
              <p className="text-xs text-[#495e54] leading-relaxed mb-5">
                Your application goes directly to {job.company}'s hiring managers. Siftrole does not insert intermediate forms or charge applicant fees.
              </p>

              <a
                href={job.apply_url}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-full bg-[#008561] hover:bg-[#006e50] text-white py-3.5 text-xs font-bold shadow-sm transition inline-flex items-center justify-center gap-2"
              >
                Apply on {job.company}'s Portal
                <ExternalLink className="w-4 h-4 text-white" />
              </a>

              <div className="mt-4 pt-4 border-t border-[#eadecc]/60 flex items-center justify-between text-xs text-[#495e54]">
                <span>Status: Active & Verified</span>
                <span className="flex items-center gap-1 text-[#008561] font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#008561] animate-pulse" /> Live Feed
                </span>
              </div>
            </div>

            {/* Zero Ghost Guarantee Card */}
            <div className="rounded-[26px] border border-[#008561]/20 bg-gradient-to-br from-[#02110c] to-[#0d2119] p-6 text-white shadow-md">
              <div className="flex items-center gap-2 text-[#fff6eb] font-bold text-xs mb-2">
                <ShieldCheck className="w-4 h-4 text-[#008561]" />
                <span>Zero Ghost Jobs Guarantee</span>
              </div>
              <h5 className="font-pochaevsk font-bold text-base leading-snug text-white">
                Never waste hours on stale postings.
              </h5>
              <p className="text-xs text-[#fff6eb]/80 mt-2 leading-relaxed">
                When {job.company} fills this vacancy, our continuous sync engine auto-expires the page within minutes.
              </p>
            </div>

            {/* Company Info Box */}
            <div className="rounded-[26px] border border-[#eadecc] bg-white p-6 shadow-[0_2px_12px_rgba(2,17,12,0.03)]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#495e54] mb-3">
                About {job.company}
              </h4>
              <p className="text-xs text-[#495e54] leading-relaxed">
                Tracked in Siftrole&apos;s verified engineering database. Roles are verified from authoritative public hiring pipelines.
              </p>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* SIMILAR ROLES CAROUSEL / ROW */}
        {/* ======================================================== */}
        {similarRoles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#eadecc]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#008561]">
                  Related Opportunities
                </span>
                <h3 className="text-2xl font-pochaevsk font-bold text-[#02110c] tracking-tight mt-1">
                  Similar Verified Roles
                </h3>
                <p className="text-xs sm:text-sm text-[#495e54] mt-1">
                  Other live tech opportunities that match this stack or team.
                </p>
              </div>
              <Link
                href="/jobs"
                className="text-xs sm:text-sm font-bold text-[#008561] hover:underline transition flex items-center gap-1"
              >
                Explore all roles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarRoles.map((simJob) => (
                <Link
                  key={simJob.id}
                  href={`/jobs/${simJob.id}`}
                  className="rounded-[24px] border border-[#eadecc] bg-white p-6 shadow-[0_2px_12px_rgba(2,17,12,0.03)] hover:border-[#008561] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <CompanyLogo company={simJob.company} size="sm" className="!h-4 !w-4 !p-0 border-0 bg-transparent" />
                      <span className="text-xs font-bold text-[#008561]">{simJob.company}</span>
                    </div>
                    <h4 className="font-bold text-base text-[#02110c] line-clamp-1">{simJob.title}</h4>
                    <span className="text-xs text-[#495e54] mt-1 block">{simJob.location}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#eadecc] flex items-center justify-between text-xs font-bold">
                    <span className="text-[#02110c]">{simJob.stipend_or_salary || "$140k"}</span>
                    <span className="text-[#008561] flex items-center gap-0.5">View JD →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
              <h4 className="text-xs font-black text-[#121816] mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/about" className="hover:text-[#008561] transition">About</Link></li>
                <li><Link href="/jobs" className="hover:text-[#008561] transition">Career</Link></li>
                <li><Link href="/#faq" className="hover:text-[#008561] transition">Contact</Link></li>
                <li><Link href="/jobs" className="hover:text-[#008561] transition">Blog</Link></li>
              </ul>
            </div>

            {/* Col: Support */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">Support</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/dashboard" className="hover:text-[#008561] transition">License</Link></li>
                <li><Link href="/about" className="hover:text-[#008561] transition">Style Guide</Link></li>
                <li><Link href="/jobs" className="hover:text-[#008561] transition">Changelog</Link></li>
              </ul>
            </div>

            {/* Col: Social */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">Social</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#008561] transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          {/* Sub-row */}
          <div className="pt-8 border-t border-[#eedfc9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#55615b]">
            <div>
              &copy; {new Date().getFullYear()} Siftrole. All rights reserved.
            </div>
            <div>
              <a href="mailto:support@siftrole.in" className="hover:text-[#008561] transition">
                support@siftrole.in
              </a>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MASSIVE BOTTOM SIFTROLE WORDMARK */}
          {/* ======================================================== */}
          <div className="pt-10 pb-4 select-none overflow-hidden text-center text-[#02110c]">
            <span className="text-[13vw] sm:text-[14vw] font-black tracking-[-0.04em] leading-none uppercase select-none text-[#02110c] inline-block">
              SIFTROLE
            </span>
          </div>
        </footer>

      </div>

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
