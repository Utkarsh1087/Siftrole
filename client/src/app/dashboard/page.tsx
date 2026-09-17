"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Trash2,
  MoreHorizontal,
  Bookmark,
  Building2,
  Briefcase,
  Layers,
  Calendar,
  LogOut,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  ListFilter,
  Check,
  X,
  FileText,
} from "lucide-react";
import { CompanyLogo, getCompanyDomain } from "@/components/CompanyLogo";

type ApplicationStage = "saved" | "applied" | "interviewing" | "offered" | "rejected";

interface TrackedApplication {
  id: string;
  listing_id?: string;
  company: string;
  title: string;
  location: string;
  stipend_or_salary?: string;
  apply_url: string;
  status: ApplicationStage;
  match_score?: number;
  applied_date?: string;
  notes?: string;
  next_step?: string;
}

const INITIAL_TRACKED_APPS: TrackedApplication[] = [
  {
    id: "app-1",
    listing_id: "figma-core-swe",
    company: "Figma",
    title: "Software Engineer, Core Systems",
    location: "San Francisco, CA / Hybrid",
    stipend_or_salary: "$150K - $185K",
    apply_url: "https://figma.com/careers",
    status: "saved",
    match_score: 94,
    applied_date: "Saved 2 hrs ago",
    notes: "Portfolio ready with WebGL/Canvas graphics projects. Applying before deadline.",
    next_step: "Submit official application",
  },
  {
    id: "app-2",
    listing_id: "airbnb-frontend-intern",
    company: "Airbnb",
    title: "Frontend Engineer Intern, Summer 2026",
    location: "San Francisco, CA / Remote",
    stipend_or_salary: "$55/hr",
    apply_url: "https://careers.airbnb.com",
    status: "saved",
    match_score: 91,
    applied_date: "Saved yesterday",
    notes: "Tailoring resume for design systems and React SSR experience.",
    next_step: "Review cover letter",
  },
  {
    id: "app-3",
    listing_id: "stripe-frontend-infra",
    company: "Stripe",
    title: "Frontend Infrastructure Engineer",
    location: "San Francisco, CA / Seattle, WA",
    stipend_or_salary: "$165K - $190K",
    apply_url: "https://stripe.com/jobs",
    status: "applied",
    match_score: 92,
    applied_date: "Yesterday",
    notes: "Applied directly on Stripe Ashby ATS with tailored resume.",
    next_step: "Awaiting recruiter review",
  },
  {
    id: "app-4",
    listing_id: "openai-platform-mts",
    company: "OpenAI",
    title: "Member of Technical Staff, Platform",
    location: "San Francisco, CA",
    stipend_or_salary: "$210K - $285K",
    apply_url: "https://openai.com/careers",
    status: "applied",
    match_score: 89,
    applied_date: "3 days ago",
    notes: "Submitted application via Lever with GitHub link.",
    next_step: "Recruiter screening",
  },
  {
    id: "app-5",
    listing_id: "google-swe-2026",
    company: "Google",
    title: "Software Engineer Intern, Summer 2026",
    location: "Mountain View, CA / Remote",
    stipend_or_salary: "$58 - $64/hr",
    apply_url: "https://careers.google.com",
    status: "interviewing",
    match_score: 96,
    applied_date: "5 days ago",
    notes: "Completed Online Assessment. Technical Round 1 scheduled for next Tuesday.",
    next_step: "DSA & System Design prep",
  },
  {
    id: "app-6",
    listing_id: "vercel-nextjs-infra",
    company: "Vercel",
    title: "Next.js Framework Engineer",
    location: "Remote (Global)",
    stipend_or_salary: "$155K - $195K",
    apply_url: "https://vercel.com/careers",
    status: "interviewing",
    match_score: 95,
    applied_date: "1 week ago",
    notes: "Take-home project approved. Final team round scheduled with VP Engineering.",
    next_step: "Final team round presentation",
  },
  {
    id: "app-7",
    listing_id: "linear-product-swe",
    company: "Linear",
    title: "Fullstack Product Engineer",
    location: "Remote (Global)",
    stipend_or_salary: "$160K - $200K",
    apply_url: "https://linear.app/careers",
    status: "offered",
    match_score: 98,
    applied_date: "2 weeks ago",
    notes: "Official offer letter received ($185k base + equity). Reviewing benefits package.",
    next_step: "Decision by next Friday",
  },
  {
    id: "app-8",
    listing_id: "datadog-distributed-swe",
    company: "Datadog",
    title: "Distributed Systems Engineer",
    location: "New York, NY / Hybrid",
    stipend_or_salary: "$145K - $175K",
    apply_url: "https://careers.datadoghq.com",
    status: "rejected",
    match_score: 87,
    applied_date: "3 weeks ago",
    notes: "Position filled internally. Invited to re-apply for Q3 hiring wave.",
    next_step: "Follow up in Q3",
  },
];

const COLUMNS: { key: ApplicationStage; title: string; tone: string; pillColor: string }[] = [
  {
    key: "saved",
    title: "Saved to Apply",
    tone: "border-neutral-300 bg-neutral-100 text-[#121816]",
    pillColor: "bg-neutral-200/80 text-neutral-800",
  },
  {
    key: "applied",
    title: "Applied",
    tone: "border-[#84d64f]/40 bg-[#eef8e5] text-[#14281a]",
    pillColor: "bg-[#84d64f]/20 text-[#14281a]",
  },
  {
    key: "interviewing",
    title: "Interviewing",
    tone: "border-teal-300 bg-teal-50 text-teal-900",
    pillColor: "bg-teal-100 text-teal-900",
  },
  {
    key: "offered",
    title: "Offer Received",
    tone: "border-[#84d64f] bg-[#d7f3be] text-[#14281a]",
    pillColor: "bg-[#84d64f] text-[#14281a]",
  },
  {
    key: "rejected",
    title: "Archived / Closed",
    tone: "border-neutral-200 bg-neutral-50 text-neutral-600",
    pillColor: "bg-neutral-200 text-neutral-700",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Alex Morgan");
  const [userEmail, setUserEmail] = useState("student@demo.com");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [isStageFilterOpen, setIsStageFilterOpen] = useState(false);
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Form State for Adding New Application
  const [newCompany, setNewCompany] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newApplyUrl, setNewApplyUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newStatus, setNewStatus] = useState<ApplicationStage>("saved");

  useEffect(() => {
    setMounted(true);
    // Check authentication from localStorage
    const token = localStorage.getItem("siftrole_token");
    const storedUser = localStorage.getItem("siftrole_user");

    if (!token && typeof window !== "undefined") {
      router.push("/login");
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || "Alex Morgan");
        setUserEmail(parsed.email || "student@demo.com");
      } catch {
        // use default fallback
      }
    }

    // Load initial applications
    fetchApplications();

    const handleTrackerSync = () => {
      fetchApplications();
    };

    window.addEventListener("siftrole-tracker-change", handleTrackerSync);
    window.addEventListener("storage", handleTrackerSync);

    return () => {
      window.removeEventListener("siftrole-tracker-change", handleTrackerSync);
      window.removeEventListener("storage", handleTrackerSync);
    };
  }, [router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Read local custom tracked apps first
      let localApps: TrackedApplication[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("siftrole_tracked_applications");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localApps = parsed;
          }
        } catch {}
      }

      // Merge local user-added apps with sample defaults
      const combined = [...localApps];
      INITIAL_TRACKED_APPS.forEach((initialApp) => {
        if (!combined.some((a) => a.id === initialApp.id || (a.listing_id && a.listing_id === initialApp.listing_id))) {
          combined.push(initialApp);
        }
      });

      setApplications(combined);
    } catch {
      setApplications(INITIAL_TRACKED_APPS);
    } finally {
      setLoading(false);
    }
  };

  const syncToLocal = (updated: TrackedApplication[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("siftrole_tracked_applications", JSON.stringify(updated));
        
        // Also sync applied and saved ID sets
        const appliedIds = updated.filter((a) => a.status === "applied" || a.status === "interviewing" || a.status === "offered").map((a) => a.listing_id || a.id);
        const savedIds = updated.filter((a) => a.status === "saved").map((a) => a.listing_id || a.id);
        localStorage.setItem("siftrole_applied_job_ids", JSON.stringify(appliedIds));
        localStorage.setItem("siftrole_saved_job_ids", JSON.stringify(savedIds));
        
        window.dispatchEvent(new CustomEvent("siftrole-applied-change"));
        window.dispatchEvent(new CustomEvent("siftrole-saved-change"));
      } catch {}
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStage) => {
    setApplications((prev) => {
      const updated = prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app));
      syncToLocal(updated);
      return updated;
    });

    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch {
      // quiet fallback
    }
  };

  const handleDelete = async (id: string) => {
    setApplications((prev) => {
      const updated = prev.filter((app) => app.id !== id);
      syncToLocal(updated);
      return updated;
    });
    try {
      await fetch(`/api/applications?id=${id}`, {
        method: "DELETE",
      });
    } catch {
      // quiet fallback
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newTitle) return;

    const newApp: TrackedApplication = {
      id: "app-" + Date.now(),
      company: newCompany,
      title: newTitle,
      location: newLocation || "Remote / Hybrid",
      stipend_or_salary: newSalary || "$140K/Yearly",
      apply_url: newApplyUrl || "https://siftrole.com/jobs",
      status: newStatus,
      applied_date: "Just now",
      notes: newNotes || "Created from dashboard tracker",
      next_step: "Prepare application materials",
      match_score: 90,
    };

    setApplications((prev) => {
      const updated = [newApp, ...prev];
      syncToLocal(updated);
      return updated;
    });

    setIsAddModalOpen(false);
    setNewCompany("");
    setNewTitle("");
    setNewLocation("");
    setNewSalary("");
    setNewApplyUrl("");
    setNewNotes("");
    setNewStatus("saved");
      applied_date: "Just now",
      match_score: 88,
      notes: newNotes,
    };

    setApplications((prev) => [newApp, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewCompany("");
    setNewTitle("");
    setNewLocation("");
    setNewSalary("");
    setNewApplyUrl("");
    setNewNotes("");
    setNewStatus("saved");

    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApp),
      });
    } catch {
      // quiet fallback
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("siftrole_token");
    localStorage.removeItem("siftrole_user");
    window.dispatchEvent(new Event("siftrole-auth-change"));
    router.push("/login");
  };

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage = filterStage === "all" || app.status === filterStage;

      return matchesSearch && matchesStage;
    });
  }, [applications, searchQuery, filterStage]);

  // Metrics calculation
  const stats = useMemo(() => {
    const total = applications.length;
    const saved = applications.filter((a) => a.status === "saved").length;
    const applied = applications.filter((a) => a.status === "applied").length;
    const interviewing = applications.filter((a) => a.status === "interviewing").length;
    const offered = applications.filter((a) => a.status === "offered").length;
    return { total, saved, applied, interviewing, offered };
  }, [applications]);

  // Dynamic AI Time of Day & Situational Greeting
  const greeting = useMemo(() => {
    const firstName = userName.split(" ")[0] || "there";

    if (!mounted) {
      return {
        headline: `Welcome back, ${firstName}`,
        situation: "Your master checklist for engineering roles. Track status changes, record interview notes, and never miss an application deadline.",
      };
    }

    const hour = new Date().getHours();
    let timeGreeting = "Welcome back";

    if (hour >= 5 && hour < 12) {
      timeGreeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = "Good afternoon";
    } else if (hour >= 17 && hour < 22) {
      timeGreeting = "Good evening";
    } else {
      timeGreeting = "Burning the midnight oil";
    }

    const headline = `${timeGreeting}, ${firstName}`;

    // Situational context based on live pipeline stats
    let situation = "Your verified application command center is active. Browse live big tech openings and log your target roles.";
    if (stats.offered > 0) {
      situation = `Congratulations! You have ${stats.offered} active offer${stats.offered > 1 ? "s" : ""} on the table. Review compensation and finalize next steps.`;
    } else if (stats.interviewing > 0) {
      situation = `You have ${stats.interviewing} active interview loop${stats.interviewing > 1 ? "s" : ""} underway. Review technical notes and keep your momentum high.`;
    } else if (stats.saved > 0 && stats.applied > 0) {
      situation = `Tracking ${stats.applied} active application${stats.applied > 1 ? "s" : ""} synced with official ATS feeds, plus ${stats.saved} saved role${stats.saved > 1 ? "s" : ""} ready for submission.`;
    } else if (stats.saved > 0) {
      situation = `You have ${stats.saved} saved role${stats.saved > 1 ? "s" : ""} waiting in your pipeline. Submit before company requisitions fill and close.`;
    } else if (stats.applied > 0) {
      situation = `Monitoring ${stats.applied} submitted application${stats.applied > 1 ? "s" : ""} directly against verified company career portal feeds.`;
    }

    return { headline, situation };
  }, [userName, stats, mounted]);

  return (
    <main className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 pb-20">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#84d64f]/15 via-[#84d64f]/5 to-transparent blur-3xl opacity-75" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Floating Top Navbar */}
        <header className="sticky top-4 z-50 rounded-[20px] border border-neutral-200/80 bg-white/85 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-[1.7rem] font-black tracking-[-0.04em] text-[#121816]">
                  Sift<span className="text-[#58a826] transition-colors group-hover:text-[#4a911e]">role</span>
                </span>
              </Link>

              <span className="hidden sm:inline-block h-5 w-[1px] bg-neutral-200" />
              <Link href="/jobs" className="hidden md:inline-flex text-xs font-bold text-[#55615b] hover:text-[#121816] transition">
                All Jobs
              </Link>
              <Link href="/cold-email" className="hidden md:inline-flex text-xs font-bold text-[#3c7818] hover:text-[#58a826] transition">
                HR Outreach
              </Link>
              <span className="hidden sm:inline-block rounded-full bg-[#eef8e5] border border-[#cce8be] px-3 py-0.5 text-xs font-black text-[#14281a]">
                Application Checklist
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/cold-email"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#14281a] hover:bg-[#1f3d27] text-[#84d64f] px-3.5 py-1.5 text-xs font-bold transition shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>HR Emails</span>
              </Link>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#84d64f] text-[#14281a] font-black text-xs flex items-center justify-center shadow-xs">
                  {userName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-black text-[#121816] leading-none">{userName}</div>
                  <div className="text-[0.68rem] text-[#55615b] leading-none mt-1">{userEmail}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl text-[#55615b] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Banner with Dynamic Time & Situation Greetings */}
        <section className="mt-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[2.2rem] sm:text-[2.8rem] font-black tracking-[-0.035em] text-[#121816] leading-[1.1]">
              {greeting.headline}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#55615b] max-w-[640px] leading-relaxed">
              {greeting.situation}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/jobs"
              className="rounded-full border border-neutral-200/90 bg-white hover:bg-neutral-50 px-5 py-3 text-xs font-extrabold text-[#121816] shadow-2xs transition inline-flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#3c7818]" /> Browse Master List
            </Link>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-5 py-3 text-xs font-heading font-bold text-[#14281a] shadow-md shadow-[#84d64f]/25 transition active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#14281a]" /> Log Application
            </button>
          </div>
        </section>

        {/* Metrics Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-[22px] border border-neutral-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#55615b]">Total Tracked</span>
              <Layers className="w-4 h-4 text-[#3c7818]" />
            </div>
            <div className="mt-3 text-3xl font-black text-[#121816]">{stats.total}</div>
            <div className="mt-1 text-xs text-[#55615b]">{stats.saved} pending submission</div>
          </div>

          <div className="rounded-[22px] border border-neutral-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3c7818]">Submitted</span>
              <CheckCircle2 className="w-4 h-4 text-[#3c7818]" />
            </div>
            <div className="mt-3 text-3xl font-black text-[#3c7818]">{stats.applied}</div>
            <div className="mt-1 text-xs text-[#3c7818]">Direct ATS submissions</div>
          </div>

          <div className="rounded-[22px] border border-neutral-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">Interviewing</span>
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-3 text-3xl font-black text-teal-800">{stats.interviewing}</div>
            <div className="mt-1 text-xs text-teal-700">Active evaluation rounds</div>
          </div>

          <div className="rounded-[22px] border border-neutral-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3c7818]">Offers</span>
              <Sparkles className="w-4 h-4 text-[#3c7818]" />
            </div>
            <div className="mt-3 text-3xl font-black text-[#14281a]">{stats.offered}</div>
            <div className="mt-1 text-xs text-[#14281a]">Decision / negotiation</div>
          </div>
        </section>

        {/* Toolbar: Search, Filters & View Mode Switcher */}
        <div className="rounded-[22px] border border-neutral-200/90 bg-white p-4 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:max-w-[320px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter your applications..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 py-2 text-xs font-semibold text-[#121816] placeholder:text-neutral-400 outline-none focus:border-[#84d64f] focus:bg-white transition"
              />
            </div>

            {/* Custom Stage Dropdown matching platform theme */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStageFilterOpen(!isStageFilterOpen)}
                className="hidden sm:flex items-center justify-between gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-[#84d64f] px-3.5 py-2 text-xs font-bold text-[#14281a] outline-none cursor-pointer transition shadow-2xs min-w-[155px]"
              >
                <span>
                  {filterStage === "all" && `All Stages (${applications.length})`}
                  {filterStage === "saved" && `Saved to Apply (${applications.filter(a => a.status === "saved").length})`}
                  {filterStage === "applied" && `Applied (${applications.filter(a => a.status === "applied").length})`}
                  {filterStage === "interviewing" && `Interviewing (${applications.filter(a => a.status === "interviewing").length})`}
                  {filterStage === "offered" && `Offer Received (${applications.filter(a => a.status === "offered").length})`}
                  {filterStage === "rejected" && `Archived (${applications.filter(a => a.status === "rejected").length})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${isStageFilterOpen ? "rotate-180 text-[#3c7818]" : ""}`} />
              </button>

              {isStageFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsStageFilterOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 w-56 rounded-2xl border border-neutral-200/90 bg-white p-1.5 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-100">
                    {[
                      { value: "all", label: "All Stages", count: applications.length },
                      { value: "saved", label: "Saved to Apply", count: applications.filter(a => a.status === "saved").length },
                      { value: "applied", label: "Applied", count: applications.filter(a => a.status === "applied").length },
                      { value: "interviewing", label: "Interviewing", count: applications.filter(a => a.status === "interviewing").length },
                      { value: "offered", label: "Offer Received", count: applications.filter(a => a.status === "offered").length },
                      { value: "rejected", label: "Archived", count: applications.filter(a => a.status === "rejected").length },
                    ].map((opt) => {
                      const isSelected = filterStage === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFilterStage(opt.value);
                            setIsStageFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-[#eef8e5] text-[#14281a]"
                              : "text-[#55615b] hover:bg-neutral-50 hover:text-[#14281a]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[0.65rem] px-1.5 py-0.2 rounded-full font-black ${
                              isSelected ? "bg-[#84d64f] text-[#14281a]" : "bg-neutral-100 text-neutral-500"
                            }`}>
                              {opt.count}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#3c7818]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-white text-[#121816] shadow-2xs"
                    : "text-[#55615b] hover:text-[#121816]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#121816] shadow-2xs"
                    : "text-[#55615b] hover:text-[#121816]"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#84d64f] border-t-transparent mb-3" />
            <p className="text-xs font-bold text-[#55615b]">Loading application command center...</p>
          </div>
        ) : viewMode === "kanban" ? (
          /* ======================================================== */
          /* CARDS GRID VIEW (Option 2: Progress Stepper Style) */
          /* ======================================================== */
          <div>
            {filteredApplications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/70 p-16 text-center">
                <p className="text-sm font-bold text-neutral-500">No applications found matching your filter.</p>
                <button
                  onClick={() => { setFilterStage("all"); setSearchQuery(""); }}
                  className="mt-3 text-xs font-extrabold text-[#3c7818] hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredApplications.map((app: TrackedApplication) => {
                  const steps: ApplicationStage[] = ["saved", "applied", "interviewing", "offered"];
                  const currentIdx = steps.indexOf(app.status);

                  return (
                    <div
                      key={app.id}
                      className="group rounded-[26px] border border-neutral-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[#84d64f] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Company Logo & Name + Match Score + Portal Link */}
                        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-neutral-100">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CompanyLogo
                              company={app.company}
                              size="sm"
                              className="!h-7 !w-7 !p-0 rounded-xl border-0 bg-transparent shadow-none shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-sm font-black text-[#14281a] tracking-tight truncate block">
                                {app.company}
                              </span>
                              <span className="text-[0.68rem] text-neutral-400 font-medium block">
                                {getCompanyDomain(app.company)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {app.match_score && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#84d64f] text-[#14281a] text-[0.68rem] font-black px-2.5 py-0.5 shadow-2xs">
                                <Sparkles className="w-2.5 h-2.5 text-[#14281a]" />
                                {app.match_score}% Match
                              </span>
                            )}
                            <a
                              href={app.apply_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open Official Portal"
                              className="h-7 w-7 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center text-[#55615b] hover:text-[#14281a] hover:border-[#84d64f] hover:bg-[#84d64f]/20 transition shadow-2xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Role Title */}
                        <h4 className="text-base font-black text-[#121816] tracking-tight group-hover:text-[#14281a] transition-colors leading-snug mb-2">
                          {app.title}
                        </h4>

                        {/* Location & Salary Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-4">
                          <span className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-[#14281a]">
                            {app.location.split("/")[0]}
                          </span>
                          {app.stipend_or_salary && (
                            <span className="rounded-lg border border-[#cce8be] bg-[#eef8e5] px-2.5 py-1 text-xs font-bold text-[#14281a]">
                              {app.stipend_or_salary}
                            </span>
                          )}
                        </div>

                        {/* Timeline: Visual 4-step progress dots (Saved → Applied → Interview → Offer) */}
                        <div className="my-4 py-3.5 px-4 rounded-2xl bg-[#fafbf9] border border-neutral-200/80">
                          <div className="relative flex items-center justify-between mb-2">
                            {/* Background track line */}
                            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[3px] bg-neutral-200 -z-0" />
                            
                            {/* Active progress fill line */}
                            <div
                              className="absolute left-3 top-1/2 -translate-y-1/2 h-[3px] bg-[#84d64f] -z-0 transition-all duration-300"
                              style={{
                                width: `${
                                  app.status === "saved" ? "0%" :
                                  app.status === "applied" ? "33%" :
                                  app.status === "interviewing" ? "66%" :
                                  app.status === "offered" ? "100%" : "0%"
                                }`,
                              }}
                            />

                            {/* Step nodes */}
                            {steps.map((step, idx) => {
                              const isPast = idx < currentIdx;
                              const isCurrent = step === app.status;

                              return (
                                <div key={step} className="relative z-10 flex flex-col items-center">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                      isCurrent
                                        ? "bg-[#84d64f] text-[#14281a] ring-4 ring-[#84d64f]/30 scale-110 shadow-xs font-black text-xs"
                                        : isPast
                                        ? "bg-[#3c7818] text-white"
                                        : "bg-neutral-200 text-transparent"
                                    }`}
                                  >
                                    {isPast ? <Check className="w-3 h-3" /> : isCurrent ? <span className="w-2 h-2 rounded-full bg-[#14281a]" /> : null}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Step Text Labels underneath dots */}
                          <div className="flex items-center justify-between text-[0.68rem] font-bold text-neutral-400 px-0.5">
                            <span className={app.status === "saved" ? "text-[#14281a] font-black" : currentIdx > 0 ? "text-[#3c7818]" : ""}>
                              Saved
                            </span>
                            <span className={app.status === "applied" ? "text-[#14281a] font-black" : currentIdx > 1 ? "text-[#3c7818]" : ""}>
                              Applied
                            </span>
                            <span className={app.status === "interviewing" ? "text-[#14281a] font-black" : currentIdx > 2 ? "text-[#3c7818]" : ""}>
                              Interview
                            </span>
                            <span className={app.status === "offered" ? "text-[#14281a] font-black" : ""}>
                              Offer
                            </span>
                          </div>
                        </div>

                        {/* Interview Notes / Next Step */}
                        {app.notes && (
                          <p className="mt-2 text-xs leading-relaxed text-[#55615b] line-clamp-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80 font-medium">
                            <span className="font-bold text-[#14281a]">Note: </span>{app.notes}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: 1-Click Advance Stage Button + Secondary Toolbar */}
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col gap-2">
                        {app.status === "saved" && (
                          <button
                            onClick={() => handleStatusChange(app.id, "applied")}
                            className="w-full rounded-xl bg-[#eef8e5] hover:bg-[#84d64f] border border-[#cce8be] text-[#14281a] font-black text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                          >
                            Advance to Applied <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {app.status === "applied" && (
                          <button
                            onClick={() => handleStatusChange(app.id, "interviewing")}
                            className="w-full rounded-xl bg-[#eef8e5] hover:bg-[#84d64f] border border-[#cce8be] text-[#14281a] font-black text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                          >
                            Advance to Interview <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {app.status === "interviewing" && (
                          <button
                            onClick={() => handleStatusChange(app.id, "offered")}
                            className="w-full rounded-xl bg-[#84d64f] hover:bg-[#76c245] text-[#14281a] font-black text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                          >
                            Advance to Offer 🏆
                          </button>
                        )}
                        {app.status === "offered" && (
                          <div className="w-full rounded-xl bg-[#eef8e5] border border-[#cce8be] text-[#14281a] font-black text-xs py-2 px-3 text-center">
                            🎉 Offer Received
                          </div>
                        )}
                        {app.status === "rejected" && (
                          <button
                            onClick={() => handleStatusChange(app.id, "applied")}
                            className="w-full rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#14281a] font-bold text-xs py-2 px-3 text-center transition cursor-pointer"
                          >
                            Reopen Application
                          </button>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-0.5 text-xs text-neutral-400">
                          <span>{app.applied_date || "Active candidate"}</span>

                          <div className="flex items-center gap-1.5">
                            <div className="relative inline-flex items-center">
                              <select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStage)}
                                title="Change stage manually"
                                className="appearance-none h-6 rounded-lg border border-neutral-200/90 bg-white hover:bg-[#fbfaf8] hover:border-[#84d64f] pl-2 pr-5 text-[0.68rem] font-bold text-[#55615b] outline-none cursor-pointer shadow-2xs transition"
                              >
                                <option value="saved">Saved</option>
                                <option value="applied">Applied</option>
                                <option value="interviewing">Interview</option>
                                <option value="offered">Offer</option>
                                <option value="rejected">Archive</option>
                              </select>
                              <ChevronDown className="w-2.5 h-2.5 text-[#55615b] pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
                            </div>

                            <button
                              onClick={() => handleDelete(app.id)}
                              title="Remove application"
                              className="h-6 w-6 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition shadow-2xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* TABLE SPREADSHEET VIEW */
          /* ======================================================== */
          <div className="rounded-[26px] border border-neutral-200/90 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#faf9f6] border-b border-neutral-200/80 text-[0.72rem] font-black uppercase tracking-wider text-[#55615b]">
                  <tr>
                    <th className="px-6 py-4 min-w-[240px]">Company & Role</th>
                    <th className="px-6 py-4 min-w-[160px] whitespace-nowrap">Stage Status</th>
                    <th className="px-6 py-4 min-w-[150px] whitespace-nowrap">Compensation</th>
                    <th className="px-6 py-4 min-w-[130px] whitespace-nowrap">AI Match</th>
                    <th className="px-6 py-4 min-w-[220px]">Notes</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 font-bold">
                        No applications found in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app: TrackedApplication) => (
                      <tr key={app.id} className="hover:bg-neutral-50/80 transition">
                        {/* Company & Role */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <CompanyLogo
                              company={app.company}
                              size="sm"
                              className="!h-7 !w-7 !p-0 rounded-xl border-0 bg-transparent shadow-none shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-black text-[#121816] text-sm leading-snug">{app.title}</div>
                              <div className="text-[#55615b] font-semibold text-xs mt-0.5">{app.company} • {app.location}</div>
                            </div>
                          </div>
                        </td>

                        {/* Status Stage */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative inline-flex items-center">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStage)}
                              className="appearance-none rounded-xl border border-neutral-200/90 bg-white hover:bg-[#fbfaf8] hover:border-[#84d64f] pl-3 pr-7 py-1.5 text-xs font-bold text-[#14281a] shadow-2xs outline-none cursor-pointer transition focus:border-[#84d64f] focus:ring-2 focus:ring-[#84d64f]/20"
                            >
                              <option value="saved">Saved to Apply</option>
                              <option value="applied">Applied</option>
                              <option value="interviewing">Interviewing</option>
                              <option value="offered">Offer Received</option>
                              <option value="rejected">Archived</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#55615b] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </td>

                        {/* Compensation */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-[#14281a] bg-[#eef8e5] border border-[#cce8be] px-2.5 py-1 rounded-lg text-xs inline-block">
                            {app.stipend_or_salary || "Not specified"}
                          </span>
                        </td>

                        {/* AI Match */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {app.match_score ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#84d64f] text-[#14281a] px-3 py-1 text-xs font-black shadow-2xs whitespace-nowrap">
                              <Sparkles className="w-3 h-3 text-[#14281a]" />
                              {app.match_score}% Match
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-medium">N/A</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="px-6 py-4 max-w-[280px]">
                          <p className="text-xs text-[#55615b] font-medium line-clamp-2" title={app.notes || ""}>
                            {app.notes || <span className="text-neutral-400 italic">No notes added</span>}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={app.apply_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-[#14281a] hover:bg-[#eef8e5] hover:border-[#84d64f] transition shadow-2xs"
                            >
                              Portal <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => handleDelete(app.id)}
                              title="Delete application"
                              className="h-7 w-7 rounded-xl border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition shadow-2xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOG APPLICATION MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-[28px] border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#eef8e5] text-[#3c7818] flex items-center justify-center font-black">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-[#121816]">Log an Application</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#121816]">Company</label>
                    <input
                      type="text"
                      required
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="e.g. Netflix, Vercel"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-[#121816] outline-none focus:border-[#84d64f]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#121816]">Stage</label>
                    <div className="relative">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ApplicationStage)}
                        className="w-full appearance-none rounded-xl border border-neutral-300 bg-white hover:bg-[#fbfaf8] hover:border-neutral-400 pl-3.5 pr-8 py-2.5 text-xs text-[#121816] font-bold outline-none focus:border-[#84d64f] focus:ring-2 focus:ring-[#84d64f]/20 cursor-pointer shadow-2xs transition"
                      >
                        <option value="saved">Saved to Apply</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offer Received</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#55615b] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#121816]">Role Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Backend Software Engineer"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-[#121816] outline-none focus:border-[#84d64f]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#121816]">Location</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. San Francisco / Remote"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-[#121816] outline-none focus:border-[#84d64f]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#121816]">Salary / Stipend</label>
                    <input
                      type="text"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      placeholder="e.g. $160K / Year"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-[#121816] outline-none focus:border-[#84d64f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#121816]">Job Apply URL</label>
                  <input
                    type="url"
                    value={newApplyUrl}
                    onChange={(e) => setNewApplyUrl(e.target.value)}
                    placeholder="https://company.com/careers/role"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-[#121816] outline-none focus:border-[#84d64f]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#121816]">Notes & Next Steps</label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Referral from Jane, OA deadline in 5 days..."
                    className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-[#121816] outline-none focus:border-[#84d64f] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#55615b] hover:bg-neutral-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#84d64f] hover:bg-[#75c73d] px-5 py-2.5 text-xs font-heading font-bold text-[#14281a] shadow-md shadow-[#84d64f]/20 transition cursor-pointer"
                  >
                    Add to Checklist
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
