"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Sparkles,
  Mail,
  UserCheck,
  Scale,
  Ban,
  Building,
  HelpCircle,
} from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#14281a] hover:text-[#3c7818] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Siftrole
          </Link>
          <span className="rounded-full bg-[#eef8e5] text-[#3c7818] border border-[#cce8be] px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-wider">
            Official Policy
          </span>
        </div>

        {/* Page Hero Header */}
        <div>
          <span className="text-[0.85rem] font-extrabold uppercase tracking-widest text-[#3c7818]">
            Legal Agreements & Community Rules
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#121816] mt-2">
            Terms of Use
          </h1>
          <p className="text-sm sm:text-base text-[#55615b] mt-3 leading-relaxed max-w-2xl">
            Please read these Terms of Use carefully before using Siftrole. By accessing or using our website, AI matching features, application checklist, or cold email tools, you agree to comply with all rules and conditions described below.
          </p>
        </div>

        {/* Highlight Card: Core Commitment */}
        <div className="rounded-3xl bg-[#14281a] text-white p-6 sm:p-8 border border-[#14281a] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-[#84d64f] text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Honest & Transparent Platform
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Built for legitimate applicants, students, and engineers
            </h3>
            <p className="text-xs sm:text-sm text-[#eef8e5]/80 leading-relaxed">
              Siftrole is committed to maintaining a clean, zero-spam, verified environment connecting job seekers with official career portals.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-center shrink-0">
            <span className="block text-[0.7rem] uppercase tracking-wider text-[#84d64f] font-bold">Effective Date</span>
            <span className="text-xs font-extrabold text-white">September 2026</span>
          </div>
        </div>

        {/* Main Terms Sections */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-neutral-200/80 shadow-xs space-y-10 text-xs sm:text-sm text-[#44504b] leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#14281a]">
              <div className="h-7 w-7 rounded-lg bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-xs">
                01
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#121816]">
                Acceptance of Terms and Eligibility
              </h2>
            </div>
            <p>
              By accessing Siftrole (accessible at siftrole.com and its associated subdomains and APIs), you confirm that you are at least 16 years of age and possess the legal authority to enter into these terms. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2.5 text-[#14281a]">
              <div className="h-7 w-7 rounded-lg bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-xs">
                02
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#121816]">
                Acceptable Use and Strict Prohibitions
              </h2>
            </div>
            <p>
              To protect all candidates, hiring managers, and the integrity of the platform, you agree to adhere strictly to the following conduct rules:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                  <Ban className="w-4 h-4 shrink-0" /> Automated Scraping & Bot Attacks
                </div>
                <p className="text-[0.78rem] text-red-900/80 leading-normal">
                  You must not use bots, automated scripts, crawlers, or scrapers to extract data, exhaust server bandwidth, or overwhelm platform endpoints.
                </p>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Security Exploits & Injections
                </div>
                <p className="text-[0.78rem] text-red-900/80 leading-normal">
                  Attempting prompt injection, jailbreaking Sift AI, probing system environment variables, or reverse-engineering proprietary code is strictly prohibited.
                </p>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                  <UserCheck className="w-4 h-4 shrink-0" /> Fraudulent Information
                </div>
                <p className="text-[0.78rem] text-red-900/80 leading-normal">
                  You agree to upload genuine resume materials and avoid impersonating other individuals or submitting deceptive information.
                </p>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                  <Mail className="w-4 h-4 shrink-0" /> Cold Email Spamming
                </div>
                <p className="text-[0.78rem] text-red-900/80 leading-normal">
                  Recruiter contacts must be used solely for polite, targeted professional inquiries. Harassment, mass blast emailing, or commercial spam is forbidden.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2.5 text-[#14281a]">
              <div className="h-7 w-7 rounded-lg bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-xs">
                03
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#121816]">
                Verified Job Indexing and Direct Employer Portals
              </h2>
            </div>
            <p>
              Siftrole indexes verified engineering, product, and technical roles directly from official company career portals.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong>No Employment Agency Relationship:</strong> Siftrole acts strictly as a centralized discovery index and checklist organizer. We do not participate in hiring decisions, interviews, or employment negotiations.
              </li>
              <li>
                <strong>Third-Party Career Portals:</strong> When you click apply links, you leave Siftrole and enter the official career site of the respective company. The employer retains complete discretion over job requirements, deadlines, and employment offers.
              </li>
              <li>
                <strong>Zero Ghost Jobs Guarantee:</strong> Siftrole automatically expires listings as soon as company APIs report them filled or closed. However, we cannot guarantee third-party website uptime or immediate employer responsiveness.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2.5 text-[#14281a]">
              <div className="h-7 w-7 rounded-lg bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-xs">
                04
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#121816]">
                AI Assistant and Resume Matching Guidelines
              </h2>
            </div>
            <p>
              Sift AI provides algorithmic resume parsing and job suitability ranking to help you find opportunities that align with your technical skills:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong>On-the-Fly Processing:</strong> Uploaded resumes are analyzed to extract relevant technical keywords (such as React, Python, Docker, SQL).
              </li>
              <li>
                <strong>Algorithmic Guidance:</strong> Compatibility percentages and skill match scores are automated estimates intended for guidance only. They do not constitute a guarantee of interview selection by any prospective employer.
              </li>
              <li>
                <strong>Prohibited Uploads:</strong> Do not upload sensitive government identification numbers, financial details, or confidential third-party trade secrets into the AI parser.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2.5 text-[#14281a]">
              <div className="h-7 w-7 rounded-lg bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-xs">
                05
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#121816]">
                Account Security and Access Termination
              </h2>
            </div>
            <p>
              If you create an account on Siftrole, you are responsible for maintaining the confidentiality of your credentials. Siftrole reserves the right to suspend, disable, or terminate access to any account found violating these Terms of Use, spamming, or engaging in abusive platform behavior, without prior notice.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2.5 text-[#14281a]">
              <div className="h-7 w-7 rounded-lg bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-xs">
                06
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#121816]">
                Intellectual Property Rights
              </h2>
            </div>
            <p>
              The Siftrole brand, logo, website interface, source code, and design architecture are protected under applicable intellectual property and trademark laws. All corporate logos, company names, and trademarks shown in connection with job listings remain the property of their respective trademark holders.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2.5 text-[#14281a]">
              <div className="h-7 w-7 rounded-lg bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-xs">
                07
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#121816]">
                Disclaimer of Warranties and Limitation of Liability
              </h2>
            </div>
            <p>
              Siftrole is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. In no event shall Siftrole, its operators, or contributors be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the service or external job application links.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2.5 text-[#14281a]">
              <div className="h-7 w-7 rounded-lg bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black text-xs">
                08
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#121816]">
                Contact Information
              </h2>
            </div>
            <p>
              If you have any questions regarding these Terms of Use or wish to report a policy violation, please contact our legal and support team:
            </p>
            <div className="p-4 rounded-2xl bg-[#fbfaf8] border border-neutral-200/80 inline-flex flex-col gap-1 text-xs">
              <span className="font-bold text-[#121816]">Siftrole Legal & Community Team</span>
              <span className="text-[#55615b]">Email: support@siftrole.in</span>
              <span className="text-[#55615b]">Website: https://siftrole.in</span>
            </div>
          </section>

          {/* Last Updated Badge */}
          <div className="pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs text-[#55615b]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3c7818]" />
              <span>Last updated: September 2026</span>
            </div>
            <div className="flex items-center gap-4 font-bold">
              <Link href="/privacy" className="hover:text-[#121816] transition">
                Privacy Policy
              </Link>
              <Link href="/about" className="hover:text-[#121816] transition">
                About Us
              </Link>
              <Link href="/jobs" className="hover:text-[#121816] transition">
                Live Jobs
              </Link>
            </div>
          </div>
        </div>

        {/* Footer brand mark with logo as letter O */}
        <div className="pt-8 pb-4 select-none overflow-hidden flex items-center justify-center font-black uppercase text-[#14281a] leading-none tracking-[-0.04em] text-2xl sm:text-3xl border-t border-neutral-200/70">
          <span>SIFTR</span>
          <span className="inline-flex items-center justify-center w-[0.84em] h-[0.84em] mx-[0.04em] relative shrink-0">
            <Image
              src="/images/siftrole-logo.png"
              alt="O"
              width={64}
              height={64}
              className="w-full h-full object-contain drop-shadow-sm"
              unoptimized
            />
          </span>
          <span>LE</span>
        </div>
      </div>
    </main>
  );
}
