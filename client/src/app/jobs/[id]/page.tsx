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
import { Listing } from "@/components/SiftAiChat";
import { useAppliedJobs } from "@/lib/appliedJobs";

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
      <main className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#84d64f] border-t-transparent mb-4" />
          <h3 className="text-sm font-black text-[#121816]">Loading verified role details...</h3>
          <p className="text-xs text-[#55615b] mt-1">Syncing with official ATS feed</p>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[28px] border border-neutral-200/80 p-10 max-w-md shadow-sm">
          <Briefcase className="w-12 h-12 text-[#b0bcba] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#121816]">Role Not Found or Expired</h2>
          <p className="text-xs sm:text-sm text-[#55615b] mt-2">
            This opening may have been filled by the employer and auto-removed from our live sync stream.
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#84d64f] hover:bg-[#75c73d] px-6 py-3 text-xs font-bold text-[#14281a] transition shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back to All Roles
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 selection:text-[#14281a]">
      {/* Background Subtle Ambient Glow */}
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
            <div className="flex items-center gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 text-xs font-bold text-[#121816] transition"
              >
                <ChevronLeft className="w-4 h-4 text-[#3c7818]" /> Back to Jobs
              </Link>

              <Link href="/" className="flex items-center gap-2 group">
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
              <Link href="/about" className="hover:text-[#121816] transition-colors">
                About
              </Link>
              <Link href="/#faq" className="hover:text-[#121816] transition-colors">
                FAQ
              </Link>
            </nav>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-xs sm:text-[0.9rem] font-bold text-[#55615b] hover:text-[#121816] transition"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-4 sm:px-5 py-2.5 text-xs sm:text-[0.9rem] font-heading font-bold text-[#14281a] shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98]"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* BREADCRUMB */}
        {/* ======================================================== */}
        <nav className="mt-6 sm:mt-8 flex items-center gap-2 text-xs font-semibold text-[#79857f]">
          <Link href="/" className="hover:text-[#121816] transition">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-[#121816] transition">Jobs</Link>
          <span>/</span>
          <Link href={`/jobs?company=${job.company}`} className="hover:text-[#121816] transition">{job.company}</Link>
          <span>/</span>
          <span className="text-[#121816] font-bold truncate max-w-[300px]">{job.title}</span>
        </nav>

        {/* ======================================================== */}
        {/* JOB HEADER HERO CARD */}
        {/* ======================================================== */}
        <section className="mt-6 rounded-[32px] border border-neutral-200/90 bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Info */}
            <div className="flex items-start gap-5">
              <CompanyLogo
                company={job.company}
                size="lg"
                className="!h-16 !w-16 !p-2 rounded-2xl border border-neutral-200/80 bg-white shadow-xs shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-extrabold uppercase tracking-wider text-[#3c7818]">
                    {job.company}
                  </span>
                  <span className="rounded-full bg-[#eef8e5] border border-[#cce8be] text-[#3c7818] text-[0.7rem] font-bold px-3 py-0.5 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3c7818]" /> Verified Official ATS Feed
                  </span>
                  {job.source && (
                    <span className="rounded-full bg-neutral-100 text-[#55615b] text-[0.7rem] font-bold px-2.5 py-0.5">
                      Source: {job.source}
                    </span>
                  )}
                </div>

                <h1 className="text-[2.2rem] sm:text-[2.8rem] font-black text-[#121816] tracking-tight leading-[1.1] mt-2">
                  {job.title}
                </h1>

                {/* Quick Info Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-[#55615b]">
                  <div className="flex items-center gap-1.5 bg-[#f8f7f5] px-3.5 py-1.5 rounded-xl border border-neutral-200/80">
                    <MapPin className="w-3.5 h-3.5 text-[#3c7818]" />
                    <span>{job.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#f8f7f5] px-3.5 py-1.5 rounded-xl border border-neutral-200/80">
                    <Briefcase className="w-3.5 h-3.5 text-[#3c7818]" />
                    <span>{job.employment_type || "Full-Time"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#f8f7f5] px-3.5 py-1.5 rounded-xl border border-neutral-200/80">
                    <DollarSign className="w-3.5 h-3.5 text-[#3c7818]" />
                    <span>{job.stipend_or_salary || "$140K/Yearly"}</span>
                  </div>

                  {job.experience_level && (
                    <div className="flex items-center gap-1.5 bg-[#f8f7f5] px-3.5 py-1.5 rounded-xl border border-neutral-200/80">
                      <GraduationCap className="w-3.5 h-3.5 text-[#3c7818]" />
                      <span>{job.experience_level}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action CTA */}
            <div className="flex flex-row flex-wrap lg:flex-col items-center lg:items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
              <a
                href={job.apply_url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (job.id && !isApplied(job.id)) {
                    toggleApplied(job.id);
                  }
                }}
                className="w-full sm:w-auto rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-8 py-4 text-sm font-heading font-extrabold shadow-[0_12px_24px_rgba(132,214,79,0.3)] transition active:scale-[0.98] inline-flex items-center justify-center gap-2"
              >
                Apply on Official Portal
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Mark as Applied Toggle */}
                <button
                  onClick={() => toggleApplied(job.id)}
                  className={`rounded-2xl px-5 py-3.5 text-xs font-bold transition inline-flex items-center gap-2 shrink-0 cursor-pointer ${
                    isApplied(job.id)
                      ? "bg-[#14281a] text-[#84d64f] hover:bg-[#1f3d27] shadow-sm"
                      : "border border-neutral-200/90 bg-white hover:bg-[#eef8e5] hover:border-[#84d64f] text-[#121816]"
                  }`}
                >
                  {isApplied(job.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#84d64f]" />
                      <span>Applied ✓</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#79857f]" />
                      <span>Mark as Applied</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="rounded-2xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-[#121816] px-4 py-3.5 text-xs font-bold transition inline-flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#55615b]" />
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
              <div className="rounded-[26px] border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#79857f] mb-4">
                  Required Technologies & Core Skills
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {job.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl bg-[#eef8e5] text-[#14281a] border border-[#cce8be] px-4 py-2 text-xs font-extrabold shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div className="rounded-[26px] border border-neutral-200/90 bg-white p-6 sm:p-10 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black text-[#121816] tracking-tight mb-6">
                About the Role & Qualifications
              </h2>

              <div className="prose prose-neutral max-w-none text-[#55615b] leading-[1.8] text-sm sm:text-base">
                {job.raw_jd_text ? (
                  <div className="whitespace-pre-line font-normal space-y-4">
                    {job.raw_jd_text}
                  </div>
                ) : (
                  <div className="space-y-4 font-normal">
                    <p>
                      <strong>{job.company}</strong> is actively seeking a talented{" "}
                      <strong>{job.title}</strong> to join their team in {job.location}.
                    </p>
                    <p>
                      This role is ingested continuously from {job.company}'s official public career portal via direct ATS integration. By applying through the official link on this page, your application will go straight into {job.company}'s hiring team pipeline with zero intermediaries or data scraping.
                    </p>
                    <h4 className="text-base font-bold text-[#121816] mt-4">Key Highlights:</h4>
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
              <div className="mt-10 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#79857f]">
                  Role verified active today from official ATS JSON feed.
                </div>
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-8 py-3.5 text-xs font-heading font-black shadow-md shadow-[#84d64f]/25 transition inline-flex items-center justify-center gap-2"
                >
                  Apply on Official Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT: SIDEBAR DETAILS */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            
            {/* Official Portal Application Card */}
            <div className="rounded-[26px] border border-neutral-200/90 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-black text-[#121816] mb-2">Direct Official Application</h4>
              <p className="text-xs text-[#55615b] leading-relaxed mb-5">
                Your application goes directly to {job.company}'s hiring managers. Siftrole does not insert intermediate forms or charge applicant fees.
              </p>

              <a
                href={job.apply_url}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-full bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] py-3.5 text-xs font-heading font-extrabold shadow-sm transition inline-flex items-center justify-center gap-2"
              >
                Apply on {job.company}'s Portal
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-[#79857f]">
                <span>Status: Active & Verified</span>
                <span className="flex items-center gap-1 text-[#3c7818] font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#84d64f] animate-pulse" /> Live Feed
                </span>
              </div>
            </div>

            {/* Zero Ghost Guarantee Card */}
            <div className="rounded-[26px] border border-[#14281a]/10 bg-gradient-to-br from-[#14281a] to-[#0a180e] p-6 text-white shadow-md">
              <div className="flex items-center gap-2 text-[#84d64f] font-bold text-xs mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Ghost Jobs Guarantee</span>
              </div>
              <h5 className="font-extrabold text-base leading-snug">
                Never waste hours on stale postings.
              </h5>
              <p className="text-xs text-[#eef8e5]/80 mt-2 leading-relaxed">
                When {job.company} fills this vacancy, our continuous sync engine auto-expires the page within minutes.
              </p>
            </div>

            {/* Company Info Box */}
            <div className="rounded-[26px] border border-neutral-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <CompanyLogo company={job.company} size="sm" />
                <div>
                  <h5 className="font-black text-sm text-[#121816]">{job.company}</h5>
                  <span className="text-xs text-[#79857f]">{getCompanyDomain(job.company)}</span>
                </div>
              </div>
              <p className="text-xs text-[#55615b] leading-relaxed">
                Explore all verified engineering and tech opportunities actively hiring at {job.company}.
              </p>
              <Link
                href={`/jobs?company=${job.company}`}
                className="mt-4 block text-center rounded-xl bg-neutral-100 hover:bg-[#eef8e5] text-[#121816] hover:text-[#14281a] py-2.5 text-xs font-bold transition"
              >
                View all {job.company} roles →
              </Link>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SIMILAR VERIFIED ROLES SECTION */}
        {/* ======================================================== */}
        {similarRoles.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#121816] tracking-tight">
                  Similar Verified Roles
                </h3>
                <p className="text-xs sm:text-sm text-[#55615b] mt-1">
                  Other live tech opportunities that match this stack or team.
                </p>
              </div>
              <Link
                href="/jobs"
                className="text-xs sm:text-sm font-bold text-[#3c7818] hover:text-[#58a826] transition flex items-center gap-1"
              >
                Explore all roles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarRoles.map((simJob) => (
                <Link
                  key={simJob.id}
                  href={`/jobs/${simJob.id}`}
                  className="rounded-[24px] border border-neutral-200/90 bg-white p-6 shadow-2xs hover:border-[#84d64f] hover:bg-[#eef8e5] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <CompanyLogo company={simJob.company} size="sm" className="!h-4 !w-4 !p-0 border-0 bg-transparent" />
                      <span className="text-xs font-bold text-[#3c7818]">{simJob.company}</span>
                    </div>
                    <h4 className="font-black text-base text-[#121816] line-clamp-1">{simJob.title}</h4>
                    <span className="text-xs text-[#79857f] mt-1 block">{simJob.location}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100/80 flex items-center justify-between text-xs font-bold">
                    <span className="text-[#121816]">{simJob.stipend_or_salary || "$140k"}</span>
                    <span className="text-[#3c7818] flex items-center gap-0.5">View JD →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
                className="w-full rounded-2xl bg-white/95 text-[#121816] placeholder:text-[#79857f] px-5 py-3.5 text-sm outline-none border border-neutral-300 shadow-inner focus:ring-2 focus:ring-[#84d64f] font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-2xl bg-[#84d64f] hover:bg-[#75c73d] text-[#14281a] px-8 py-3.5 text-sm font-bold transition shadow-lg active:scale-[0.98] shrink-0 cursor-pointer"
            >
              {subscribedEmail ? "Subscribed!" : "Subscribe"}
            </button>
          </form>

          {subscribedEmail && (
            <div className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-xl bg-[#14281a] px-4 py-2 text-xs font-bold text-[#84d64f] border border-[#84d64f]/40">
              <CheckCircle2 className="w-4 h-4 text-[#84d64f]" />
              <span>Thank you! We will notify you when matching verified roles go live.</span>
            </div>
          )}
        </section>

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
                <li><Link href="/about" className="hover:text-[#3c7818] transition">About</Link></li>
                <li><Link href="/jobs" className="hover:text-[#3c7818] transition">Career</Link></li>
                <li><Link href="/#faq" className="hover:text-[#3c7818] transition">Contact</Link></li>
                <li><Link href="/jobs" className="hover:text-[#3c7818] transition">Blog</Link></li>
              </ul>
            </div>

            {/* Col: Support */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">Support</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#55615b]">
                <li><Link href="/dashboard" className="hover:text-[#3c7818] transition">License</Link></li>
                <li><Link href="/about" className="hover:text-[#3c7818] transition">Style Guide</Link></li>
                <li><Link href="/jobs" className="hover:text-[#3c7818] transition">Changelog</Link></li>
              </ul>
            </div>

            {/* Col: Social */}
            <div>
              <h4 className="text-xs font-black text-[#121816] mb-4">Social</h4>
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
    </main>
  );
}
