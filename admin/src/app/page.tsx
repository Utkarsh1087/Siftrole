"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Users,
  BarChart3,
  Bot,
  History,
  Search,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  MousePointer,
  Flame,
  ArrowUpRight,
  Sliders,
  Play,
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  User,
  RefreshCw,
  Layers,
  Settings,
  HelpCircle,
  FileText,
  ChevronDown,
  Activity,
  Globe,
  Database,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  extractedListing?: any;
}

interface ExtractionLogItem {
  id: string;
  raw_jd_snippet: string;
  extracted_json: any;
  model_used: string;
  tokens_used: number | null;
  extraction_status: string;
  created_at: string;
}

interface CompanyItem {
  id: string;
  name: string;
  career_page_url: string;
  ats_type: string;
  ats_identifier: string;
  verified: boolean;
  _count?: { listings: number };
  created_at: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  graduation_year: number | null;
  skills: string[];
  resume_url: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState<"dashboard" | "review_queue" | "companies" | "users" | "ai_extractor" | "analytics" | "reports">("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Header Stats
  const [stats, setStats] = useState({ total: 994, active: 989, manual: 0, flagged: 5, companies: 6 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // AI Flagged Review Queue State
  const [flaggedListings, setFlaggedListings] = useState<any[]>([]);
  const [flaggedSearch, setFlaggedSearch] = useState("");
  const [editingFlaggedListing, setEditingFlaggedListing] = useState<any | null>(null);
  const [isApprovingId, setIsApprovingId] = useState<string | null>(null);

  // 1. Chatbot & Schema State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 Siftrole Smart Job Ingestion Assistant\n\nPaste any raw career posting, unstructured job description, or company hiring notes below. Our Groq LLM parser will extract strict structured fields (role title, company, skills, compensation, eligibility, and ATS tags) without hallucinating missing data. You can review, refine, and publish the listing directly to the live feed.",
      timestamp: "17:45",
    },
  ]);
  const [inputJd, setInputJd] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [editableListing, setEditableListing] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logs, setLogs] = useState<ExtractionLogItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<ExtractionLogItem | null>(null);

  // 2. Company CRUD State
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    career_page_url: "",
    ats_type: "GREENHOUSE",
    ats_identifier: "",
    verified: true,
  });
  const [companySyncingId, setCompanySyncingId] = useState<string | null>(null);

  // 3. User CRUD State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    status: "ACTIVE",
    graduation_year: 2026,
    skills: "",
    resume_url: "",
  });

  // 4. Analytics & AI Advisor State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
    fetchCompanies();
    fetchUsers();
    fetchAnalytics();
    fetchFlaggedListings();
  }, []);

  const fetchFlaggedListings = async () => {
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        const allListings = data.listings || [];
        const flagged = allListings.filter((l: any) => l.status === "flagged");
        setFlaggedListings(flagged);
      }
    } catch (e) {
      console.error("Fetch flagged listings error:", e);
    }
  };

  const handleApproveListing = async (id: string, updatedFields?: any) => {
    setIsApprovingId(id);
    try {
      const payload = {
        status: "active",
        ...(updatedFields || {}),
      };
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setFlaggedListings((prev) => prev.filter((item) => item.id !== id));
        fetchStats();
        setEditingFlaggedListing(null);
      }
    } catch (e) {
      console.error("Approve listing error:", e);
    } finally {
      setIsApprovingId(null);
    }
  };

  const handleRejectListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this suspicious / unverified posting?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFlaggedListings((prev) => prev.filter((item) => item.id !== id));
        fetchStats();
      }
    } catch (e) {
      console.error("Reject listing error:", e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isExtracting]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/listings?view=stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/listings?view=logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputJd.trim() || isExtracting) return;

    const userText = inputJd.trim();
    const userMsgId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setInputJd("");
    setIsExtracting(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_jd_text: userText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Extraction failed");

      const listing = data.listing;
      setEditableListing({ ...listing, raw_jd_text: userText });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `✨ Successfully extracted structured data for **${listing.title}** at **${listing.company}**! Review the template on the right side and click **Approve & Save** when ready.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          extractedListing: listing,
        },
      ]);
      fetchStats();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `⚠️ Extraction Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveListing = async () => {
    if (!editableListing || isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableListing),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");

      setSaveSuccess(true);
      fetchStats();
      fetchCompanies();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert("Error saving listing: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus("Triggering ATS Scrapers sync across all verified companies...");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const totalFetched = data.results?.reduce((acc: number, r: any) => acc + (r.fetched || 0), 0) || 0;
        const totalInserted = data.results?.reduce((acc: number, r: any) => acc + (r.inserted || 0), 0) || 0;
        setSyncStatus(`✅ Sync Complete: ${data.totalCompaniesSynced} companies synced. ${totalFetched} listings fetched, ${totalInserted} inserted.`);
        fetchStats();
        fetchCompanies();
      } else {
        setSyncStatus(`⚠️ Sync Error: ${data.error}`);
      }
    } catch (e: any) {
      setSyncStatus(`❌ Sync Failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 8000);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        const res = await fetch("/api/companies", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCompany.id, ...companyForm }),
        });
        if (!res.ok) throw new Error("Failed to update company");
      } else {
        const res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(companyForm),
        });
        if (!res.ok) throw new Error("Failed to create company");
      }
      setShowCompanyModal(false);
      setEditingCompany(null);
      setCompanyForm({ name: "", career_page_url: "", ats_type: "GREENHOUSE", ats_identifier: "", verified: true });
      fetchCompanies();
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company and its listings?")) return;
    try {
      const res = await fetch(`/api/companies?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCompanies();
        fetchStats();
      }
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSyncSingleCompany = async (id: string) => {
    setCompanySyncingId(id);
    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, triggerSync: true }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Synced ${data.syncResult.companyName}: ${data.syncResult.fetched} fetched, ${data.syncResult.inserted} inserted.`);
        fetchCompanies();
        fetchStats();
      }
    } catch (err: any) {
      alert("Sync error: " + err.message);
    } finally {
      setCompanySyncingId(null);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArr = userForm.skills.split(",").map((s) => s.trim()).filter(Boolean);
      if (editingUser) {
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingUser.id, ...userForm, skills: skillsArr }),
        });
        if (!res.ok) throw new Error("Failed to update user");
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...userForm, skills: skillsArr }),
        });
        if (!res.ok) throw new Error("Failed to create user");
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: "", email: "", role: "STUDENT", status: "ACTIVE", graduation_year: 2026, skills: "", resume_url: "" });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleGenerateAiInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const res = await fetch("/api/analytics?action=ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analyticsContext: analyticsData }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiInsights(data.insights);
      }
    } catch (e: any) {
      alert("Failed to generate AI insights: " + e.message);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.ats_identifier.toLowerCase().includes(companySearch.toLowerCase())
  );

  const filteredUsers = users.filter((u) => {
    if (u.role !== "STUDENT") return false;
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = userStatusFilter === "ALL" || u.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen w-screen bg-[#f8fafc] text-slate-900 font-sans flex overflow-hidden p-0 m-0">
      
      {/* ======================================================== */}
      {/* LEFT SIDEBAR (Clean Light Sidebar, Collapsible) */}
      {/* ======================================================== */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-[72px] px-2.5" : "w-[260px] lg:w-[280px] p-5"
        } shrink-0 h-full bg-white flex flex-col justify-between select-none overflow-y-auto border-r border-slate-200 transition-all duration-300 ease-in-out`}
      >
        <div>
          {/* Logo & Collapse Toggle */}
          <div className="flex items-center justify-between px-1 py-3 mb-4">
            {!isSidebarCollapsed ? (
              <div className="text-xl font-black tracking-tight text-slate-900 px-1">
                Sift<span className="text-[#083327]">role</span> <span className="text-xs font-bold text-slate-400 ml-1">Admin</span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#083327] font-black text-sm flex items-center justify-center transition border border-slate-200 shadow-xs"
                  title="Expand sidebar"
                >
                  S
                </button>
              </div>
            )}

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition border border-slate-200 shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Public Website Status & Quick Jump */}
          {!isSidebarCollapsed ? (
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-[#eef8e5] border border-slate-200 hover:border-[#84d64f] rounded-xl px-3 py-2.5 mb-4 flex items-center justify-between transition group"
              title="Go to main website (localhost:3000)"
            >
              <div className="overflow-hidden">
                <div className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#84d64f] animate-pulse" /> Live Website
                </div>
                <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#14281a] transition mt-0.5">
                  Go to Main Website
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#14281a] transition shrink-0 ml-2" />
            </a>
          ) : (
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 mx-auto rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 hover:bg-[#eef8e5] hover:border-[#84d64f] text-[#14281a] transition"
              title="Go to Main Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Navigation Section Header */}
          {!isSidebarCollapsed && (
            <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Menu
            </div>
          )}

          <nav className="space-y-1">
            {/* 1. Overview */}
            <button
              onClick={() => setActiveNav("dashboard")}
              title="Dashboard"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "dashboard"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className={`w-4 h-4 shrink-0 ${activeNav === "dashboard" ? "text-white" : "text-slate-500"}`} />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </div>
            </button>

            {/* 2. AI Flagged Review Queue */}
            <button
              onClick={() => {
                setActiveNav("review_queue");
                fetchFlaggedListings();
              }}
              title="AI Flagged Review Queue"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "review_queue"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-amber-900 bg-amber-50/80 hover:bg-amber-100/90"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-4 h-4 shrink-0 ${activeNav === "review_queue" ? "text-white" : "text-amber-600"}`} />
                {!isSidebarCollapsed && <span>AI Flagged Queue</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded-full ${
                  activeNav === "review_queue" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-900"
                }`}>
                  {stats.flagged || flaggedListings.length || 0}
                </span>
              )}
            </button>

            {/* 3. Companies */}
            <button
              onClick={() => setActiveNav("companies")}
              title="Companies"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "companies"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className={`w-4 h-4 shrink-0 ${activeNav === "companies" ? "text-white" : "text-slate-500"}`} />
                {!isSidebarCollapsed && <span>Companies ({companies.length})</span>}
              </div>
            </button>

            {/* 3. Students */}
            <button
              onClick={() => setActiveNav("users")}
              title="Students"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "users"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 shrink-0 ${activeNav === "users" ? "text-white" : "text-slate-500"}`} />
                {!isSidebarCollapsed && <span>Students ({users.filter((u) => u.role === "STUDENT").length})</span>}
              </div>
            </button>

            {/* 4. Add Job with AI */}
            <button
              onClick={() => setActiveNav("ai_extractor")}
              title="Add Job with AI"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "ai_extractor"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className={`w-4 h-4 shrink-0 ${activeNav === "ai_extractor" ? "text-white" : "text-slate-500"}`} />
                {!isSidebarCollapsed && <span>Add Job with AI</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded ${activeNav === "ai_extractor" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                  AI
                </span>
              )}
            </button>

            {/* 5. Website Analytics */}
            <button
              onClick={() => setActiveNav("analytics")}
              title="Website Analytics"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "analytics"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 shrink-0 ${activeNav === "analytics" ? "text-white" : "text-slate-500"}`} />
                {!isSidebarCollapsed && <span>Analytics</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded ${activeNav === "analytics" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  Live
                </span>
              )}
            </button>

            {/* 6. Activity Logs */}
            <button
              onClick={() => {
                setActiveNav("reports");
                fetchLogs();
              }}
              title="Activity Logs"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "reports"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className={`w-4 h-4 shrink-0 ${activeNav === "reports" ? "text-white" : "text-slate-500"}`} />
                {!isSidebarCollapsed && <span>Activity Logs</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded ${activeNav === "reports" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  30+
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Profile / Account Pill */}
        {!isSidebarCollapsed ? (
          <div className="pt-4 pb-2 border-t border-slate-200 mt-6">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#083327]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">Administrator</div>
                <div className="text-[0.65rem] text-emerald-700 font-medium">Status: Active</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-4 border-t border-slate-200 mt-6 flex justify-center" title="Administrator (Active)">
            <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 text-[#083327] font-bold flex items-center justify-center text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        )}
      </aside>

      {/* ======================================================== */}
      {/* RIGHT MAIN CANVAS (Clean Light Layout) */}
      {/* ======================================================== */}
      <main className="flex-1 h-full bg-[#f8fafc] p-6 lg:p-8 flex flex-col justify-between overflow-y-auto">
        
        <div>
          {/* Top Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition shadow-xs"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-slate-700" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#083327] tracking-tight capitalize">
                  {activeNav === "dashboard" && "Dashboard"}
                  {activeNav === "review_queue" && "AI Review Queue"}
                  {activeNav === "companies" && "Companies"}
                  {activeNav === "users" && "Students"}
                  {activeNav === "ai_extractor" && "Add Job with AI"}
                  {activeNav === "analytics" && "Website Analytics & AI Tips"}
                  {activeNav === "reports" && "Activity Logs"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeNav === "dashboard" && "Overview of live jobs, applications, and system status"}
                  {activeNav === "review_queue" && "Scraped roles flagged by AI for missing details or suspicious signals. Review, fix, and approve to publish."}
                  {activeNav === "companies" && "Manage company job feeds and career page scrapers"}
                  {activeNav === "users" && "View and manage registered student candidate accounts"}
                  {activeNav === "ai_extractor" && "Paste any job posting to extract details into clean fields"}
                  {activeNav === "analytics" && "See user activity and simple AI suggestions to improve the website"}
                  {activeNav === "reports" && "History of recent job syncs and extractions"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="rounded-xl bg-white hover:bg-slate-50 text-[#083327] px-4 py-2 text-xs font-bold inline-flex items-center gap-2 shadow-xs transition disabled:opacity-50 border border-slate-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#083327]" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync All Jobs"}
              </button>

              <button
                onClick={() => {
                  setEditingCompany(null);
                  setCompanyForm({ name: "", career_page_url: "", ats_type: "GREENHOUSE", ats_identifier: "", verified: true });
                  setShowCompanyModal(true);
                }}
                className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Company
              </button>
            </div>
          </div>

          {syncStatus && (
            <div className="mb-5 text-xs font-bold text-center py-2 px-4 bg-emerald-50 text-[#083327] border border-emerald-200 rounded-xl">
              {syncStatus}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: MAIN DASHBOARD VIEW */}
          {/* ======================================================== */}
          {activeNav === "dashboard" && (
            <div className="space-y-6">
              
              {/* 3 Top Highlight KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Total Live Jobs */}
                <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-xs flex flex-col justify-between border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#083327]">Total Live Jobs</span>
                      <div className="text-3xl font-black mt-1 text-[#083327] tracking-tight">{stats.total}</div>
                    </div>
                    <div className="flex gap-1 items-end h-8">
                      <span className="w-1.5 h-4 bg-emerald-200 rounded-full" />
                      <span className="w-1.5 h-7 bg-emerald-300 rounded-full" />
                      <span className="w-1.5 h-5 bg-[#083327] rounded-full" />
                      <span className="w-1.5 h-8 bg-[#083327] rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 text-[0.7rem] font-bold text-[#083327] flex items-center gap-1">
                    <span>100% verified</span> directly from official career pages
                  </div>
                </div>

                {/* Card 2: Active Job Links */}
                <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#083327]">Active Job Links</span>
                      <div className="text-3xl font-black mt-1 text-[#083327] tracking-tight">99.4%</div>
                    </div>
                    <div className="flex gap-1 items-end h-8">
                      <span className="w-1.5 h-5 bg-emerald-200 rounded-full" />
                      <span className="w-1.5 h-7 bg-[#083327] rounded-full" />
                      <span className="w-1.5 h-4 bg-emerald-300 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 text-[0.7rem] font-bold text-[#083327] flex items-center gap-1">
                    <span>0 dead links</span> closed jobs are removed automatically
                  </div>
                </div>

                {/* Card 3: Job Apply Clicks */}
                <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#083327]">Job Applications Clicked</span>
                      <div className="text-3xl font-black mt-1 text-[#083327] tracking-tight">{analyticsData?.summary?.totalApplies || 1640}</div>
                    </div>
                    <div className="flex gap-1 items-end h-8">
                      <span className="w-1.5 h-3 bg-emerald-200 rounded-full" />
                      <span className="w-1.5 h-5 bg-emerald-300 rounded-full" />
                      <span className="w-1.5 h-7 bg-[#083327] rounded-full" />
                      <span className="w-1.5 h-6 bg-[#083327] rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 text-[0.7rem] font-bold text-[#083327] flex items-center gap-1">
                    <span>48% of visitors</span> click through to apply
                  </div>
                </div>
              </div>

              {/* Middle Grid: Activity Timeline Chart + Summary Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Bar Chart */}
                <div className="lg:col-span-8 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-[#083327]">Jobs Added & User Applications</h3>
                      <p className="text-[0.7rem] text-slate-500">Daily new job openings compared to student application clicks</p>
                    </div>
                    <span className="text-xs font-semibold text-[#083327] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Last 7 Days
                    </span>
                  </div>

                  {/* Bar Chart Visualization */}
                  <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                    {[
                      { day: "Mon", bar1: 65, bar2: 45 },
                      { day: "Tue", bar1: 85, bar2: 60 },
                      { day: "Wed", bar1: 75, bar2: 55 },
                      { day: "Thu", bar1: 95, bar2: 70 },
                      { day: "Fri", bar1: 100, bar2: 85 },
                      { day: "Sat", bar1: 60, bar2: 40 },
                      { day: "Sun (Today)", bar1: 110, bar2: 95 },
                    ].map((item) => (
                      <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex items-end justify-center gap-1.5 h-32">
                          <div
                            className="w-3 bg-emerald-100 rounded-t-sm hover:bg-emerald-200 transition"
                            style={{ height: `${(item.bar1 / 110) * 100}%` }}
                            title={`Jobs Added: ${item.bar1}`}
                          />
                          <div
                            className="w-3 bg-[#083327] rounded-t-sm"
                            style={{ height: `${(item.bar2 / 110) * 100}%` }}
                            title={`Student Applications: ${item.bar2}`}
                          />
                        </div>
                        <span className="text-[0.65rem] font-bold text-[#083327]">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Jobs by Source Card */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#083327]">
                      Total Active Jobs
                    </span>
                    <div className="text-4xl font-black text-[#083327] mt-2 tracking-tight">
                      994 <span className="text-sm font-bold text-emerald-600">LIVE</span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#083327] flex items-center gap-1">
                      <span>No spam</span> zero duplicate postings
                    </div>
                  </div>

                  <div className="space-y-2.5 my-4">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#083327]">
                        <ShieldCheck className="w-4 h-4 text-[#083327]" />
                        <span>Greenhouse Jobs</span>
                      </div>
                      <span className="font-extrabold text-[#083327]">777 jobs</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#083327]">
                        <ShieldCheck className="w-4 h-4 text-[#083327]" />
                        <span>Ashby Jobs</span>
                      </div>
                      <span className="font-extrabold text-[#083327]">154 jobs</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#083327]">
                        <ShieldCheck className="w-4 h-4 text-[#083327]" />
                        <span>Lever Jobs</span>
                      </div>
                      <span className="font-extrabold text-[#083327]">62 jobs</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveNav("companies")}
                    className="w-full rounded-xl bg-[#083327] text-white py-2.5 text-xs font-bold hover:bg-[#0c4333] transition text-center shadow-xs"
                  >
                    View All Companies
                  </button>
                </div>
              </div>

              {/* Bottom Row: Top Companies Table + Website Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Companies Table */}
                <div className="lg:col-span-8 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-[#083327]">Companies & Job Count</h3>
                      <p className="text-[0.7rem] text-slate-500">Active companies and open vacancies on the site</p>
                    </div>
                    <button
                      onClick={() => setActiveNav("companies")}
                      className="text-xs font-bold text-[#083327] hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[#083327] font-bold border-b border-slate-100 bg-slate-50">
                        <tr>
                          <th className="py-2.5 px-3">Company</th>
                          <th className="py-2.5 px-3">Job Feed System</th>
                          <th className="py-2.5 px-3">Open Jobs</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {companies.slice(0, 5).map((comp) => (
                          <tr key={comp.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-bold text-[#083327]">
                              <div className="flex items-center gap-2">
                                <CompanyLogo company={comp.name} size="sm" />
                                <span>{comp.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[0.7rem] text-slate-600">{comp.ats_type}</td>
                            <td className="py-2.5 px-3 font-bold text-[#083327]">{comp._count?.listings || 0}</td>
                            <td className="py-2.5 px-3">
                              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[0.65rem] font-bold inline-flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Active
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleSyncSingleCompany(comp.id)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-700 transition"
                                title="Sync jobs for this company"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-[#083327]" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Live Website Status & Ingestion Controls */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-6 text-[#083327] shadow-xs flex flex-col justify-between border border-slate-200">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#083327] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> Live Website Controls
                      </span>
                      <a
                        href="http://localhost:3000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-slate-100 text-[#083327] transition"
                        title="Open public job board"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <h3 className="text-lg font-bold leading-tight text-[#083327]">
                      Siftrole Job Board Pipeline
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      994 active roles indexed across verified employer career feeds with automated expiration reconciliation.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[0.65rem] text-[#083327] font-bold">Public Feed</div>
                        <div className="font-bold text-[#083327] text-xs">Port 3000 Live</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[0.65rem] text-[#083327] font-bold">Ingest Engine</div>
                        <div className="font-bold text-[#083327] text-xs">Port 3001 Active</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href="http://localhost:3000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl bg-[#083327] text-white py-2 text-xs font-bold hover:bg-[#0c4333] transition text-center inline-flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Public Site
                    </a>
                    <button
                      onClick={handleTriggerSync}
                      disabled={isSyncing}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#083327] text-xs font-bold transition disabled:opacity-50 inline-flex items-center gap-1"
                      title="Sync all employer feeds"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#083327]" : ""}`} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: AI FLAGGED & SUSPICIOUS REVIEW QUEUE */}
          {/* ======================================================== */}
          {activeNav === "review_queue" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search flagged roles by title, company, or flag..."
                    value={flaggedSearch}
                    onChange={(e) => setFlaggedSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    {flaggedListings.length} Roles Require Admin Verification
                  </span>
                  <button
                    onClick={fetchFlaggedListings}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
                    title="Refresh flagged listings"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {flaggedListings.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#083327]">All Scraped Roles Clean & Verified</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                    The AI parser found zero missing fields or suspicious anomalies in the latest ingestion cycle.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[#083327] font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-5">Company & Role</th>
                          <th className="py-3 px-5">AI Detection Reason</th>
                          <th className="py-3 px-5">Location</th>
                          <th className="py-3 px-5">Stipend / Salary</th>
                          <th className="py-3 px-5">Eligibility</th>
                          <th className="py-3 px-5 text-right">Review Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {flaggedListings
                          .filter((l) =>
                            l.title.toLowerCase().includes(flaggedSearch.toLowerCase()) ||
                            l.company.toLowerCase().includes(flaggedSearch.toLowerCase())
                          )
                          .map((listing) => {
                            const rawJdText = listing.raw_jd_text || "";
                            const flagLines = rawJdText.includes("--- AI ANOMALY REPORT ---")
                              ? rawJdText.split("-------------------------")[0].split("Flags:\n")[1] || ""
                              : "";

                            return (
                              <tr key={listing.id} className="hover:bg-amber-50/40 transition">
                                <td className="py-3.5 px-5 font-bold text-[#083327]">
                                  <div className="flex items-center gap-2.5">
                                    <CompanyLogo company={listing.company} size="sm" />
                                    <div>
                                      <div className="font-bold text-slate-900">{listing.title}</div>
                                      <div className="text-[0.68rem] text-slate-500 font-normal">{listing.company}</div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-5 max-w-[240px]">
                                  <div className="space-y-1">
                                    {!listing.stipend_or_salary && (
                                      <span className="inline-block rounded bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 text-[0.65rem] font-bold mr-1">
                                        Missing Salary
                                      </span>
                                    )}
                                    {!listing.eligibility && (
                                      <span className="inline-block rounded bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[0.65rem] font-bold mr-1">
                                        Missing Eligibility
                                      </span>
                                    )}
                                    {flagLines ? (
                                      <div className="text-[0.68rem] text-slate-600 line-clamp-2">
                                        {flagLines.replace(/•\s*/g, "")}
                                      </div>
                                    ) : (
                                      <span className="inline-block rounded bg-amber-100 text-amber-900 px-2 py-0.5 text-[0.65rem] font-bold">
                                        AI Needs Verification
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-5 font-medium text-slate-700">{listing.location}</td>
                                <td className="py-3.5 px-5 font-bold text-slate-900">
                                  {listing.stipend_or_salary || <span className="text-rose-500 italic">Unspecified</span>}
                                </td>
                                <td className="py-3.5 px-5 text-slate-700">
                                  {listing.eligibility || <span className="text-amber-600 italic">Not set</span>}
                                </td>

                                <td className="py-3.5 px-5 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      onClick={() => setEditingFlaggedListing(listing)}
                                      className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" /> Fix & Review
                                    </button>
                                    <button
                                      onClick={() => handleApproveListing(listing.id)}
                                      disabled={isApprovingId === listing.id}
                                      className="rounded-lg bg-[#083327] hover:bg-[#0c4333] text-white px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                                      title="Approve immediately to live checklist"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectListing(listing.id)}
                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                                      title="Delete suspicious role"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Fix Modal for Flagged Role */}
          {editingFlaggedListing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#083327]">Fix & Approve Scraped Role</h3>
                      <p className="text-[0.7rem] text-slate-500">Correct any missing fields before publishing to the student master checklist</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingFlaggedListing(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApproveListing(editingFlaggedListing.id, {
                      title: editingFlaggedListing.title,
                      company: editingFlaggedListing.company,
                      location: editingFlaggedListing.location,
                      employment_type: editingFlaggedListing.employment_type,
                      eligibility: editingFlaggedListing.eligibility,
                      stipend_or_salary: editingFlaggedListing.stipend_or_salary,
                      skills_required: editingFlaggedListing.skills_required,
                      apply_url: editingFlaggedListing.apply_url,
                      status: "active",
                    });
                  }}
                  className="space-y-3 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Role Title *</label>
                      <input
                        type="text"
                        required
                        value={editingFlaggedListing.title || ""}
                        onChange={(e) => setEditingFlaggedListing({ ...editingFlaggedListing, title: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Company *</label>
                      <input
                        type="text"
                        required
                        value={editingFlaggedListing.company || ""}
                        onChange={(e) => setEditingFlaggedListing({ ...editingFlaggedListing, company: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Location *</label>
                      <input
                        type="text"
                        required
                        value={editingFlaggedListing.location || ""}
                        onChange={(e) => setEditingFlaggedListing({ ...editingFlaggedListing, location: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Employment Type</label>
                      <input
                        type="text"
                        value={editingFlaggedListing.employment_type || ""}
                        onChange={(e) => setEditingFlaggedListing({ ...editingFlaggedListing, employment_type: e.target.value })}
                        placeholder="e.g. Internship, Full-time"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">
                        Compensation / Salary <span className="text-emerald-700">(Fix Missing)</span>
                      </label>
                      <input
                        type="text"
                        value={editingFlaggedListing.stipend_or_salary || ""}
                        onChange={(e) => setEditingFlaggedListing({ ...editingFlaggedListing, stipend_or_salary: e.target.value })}
                        placeholder="e.g. $140K - $170K / Year or $55/hr"
                        className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">
                        Eligibility <span className="text-emerald-700">(Fix Missing)</span>
                      </label>
                      <input
                        type="text"
                        value={editingFlaggedListing.eligibility || ""}
                        onChange={(e) => setEditingFlaggedListing({ ...editingFlaggedListing, eligibility: e.target.value })}
                        placeholder="e.g. Graduating 2026/2027 • B.Tech in CS"
                        className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Official Apply URL *</label>
                    <input
                      type="url"
                      required
                      value={editingFlaggedListing.apply_url || ""}
                      onChange={(e) => setEditingFlaggedListing({ ...editingFlaggedListing, apply_url: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono outline-none focus:bg-white focus:border-[#083327]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingFlaggedListing(null)}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isApprovingId === editingFlaggedListing.id}
                      className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-5 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isApprovingId === editingFlaggedListing.id ? "Publishing..." : "Approve & Publish to Master Checklist"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: COMPANIES MANAGEMENT */}
          {/* ======================================================== */}
          {activeNav === "companies" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search company name..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:bg-white focus:border-slate-800"
                  />
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {filteredCompanies.length} Active Companies
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-5">Company</th>
                      <th className="py-3 px-5">Job Feed System</th>
                      <th className="py-3 px-5">Company Slug</th>
                      <th className="py-3 px-5">Open Jobs</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCompanies.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-5 font-bold text-[#083327]">
                          <div className="flex items-center gap-2.5">
                            <CompanyLogo company={c.name} size="md" />
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="rounded-md bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 font-mono text-[0.7rem] font-bold">
                            {c.ats_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">{c.ats_identifier}</td>
                        <td className="py-3.5 px-5 font-bold text-[#083327]">{c._count?.listings || 0}</td>
                        <td className="py-3.5 px-5">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 font-bold text-[0.7rem] inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleSyncSingleCompany(c.id)}
                              disabled={companySyncingId === c.id}
                              title="Sync jobs now"
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-700"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${companySyncingId === c.id ? "animate-spin text-[#083327]" : ""}`} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCompany(c);
                                setCompanyForm({
                                  name: c.name,
                                  career_page_url: c.career_page_url,
                                  ats_type: c.ats_type,
                                  ats_identifier: c.ats_identifier,
                                  verified: c.verified,
                                });
                                setShowCompanyModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-700"
                              title="Edit company"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(c.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 transition text-rose-600"
                              title="Delete company"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: REGISTERED STUDENTS MANAGEMENT */}
          {/* ======================================================== */}
          {activeNav === "users" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>

                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({ name: "", email: "", role: "STUDENT", status: "ACTIVE", graduation_year: 2026, skills: "", resume_url: "" });
                      setShowUserModal(true);
                    }}
                    className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Student
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[#083327] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-5">Student</th>
                      <th className="py-3 px-5">Email</th>
                      <th className="py-3 px-5">Graduation Year</th>
                      <th className="py-3 px-5">Skills</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No student accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-5 font-bold text-[#083327]">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#083327]" />
                              {u.name}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-slate-600">{u.email}</td>
                          <td className="py-3.5 px-5 font-bold text-[#083327]">{u.graduation_year ? `${u.graduation_year}` : "N/A"}</td>
                          <td className="py-3.5 px-5">
                            <div className="flex flex-wrap gap-1 max-w-[240px]">
                              {u.skills && u.skills.length > 0 ? (
                                u.skills.slice(0, 3).map((s) => (
                                  <span key={s} className="rounded bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 text-[0.65rem] font-semibold">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic text-[0.65rem]">None listed</span>
                              )}
                              {u.skills && u.skills.length > 3 && (
                                <span className="rounded bg-slate-100 text-slate-500 px-1 py-0.5 text-[0.65rem]">
                                  +{u.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`rounded-full border px-2.5 py-0.5 font-bold text-[0.7rem] ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-slate-100 border-slate-200 text-slate-600"
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setUserForm({
                                    name: u.name,
                                    email: u.email,
                                    role: u.role,
                                    status: u.status,
                                    graduation_year: u.graduation_year || 2026,
                                    skills: u.skills?.join(", ") || "",
                                    resume_url: u.resume_url || "",
                                  });
                                  setShowUserModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-700"
                                title="Edit student"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 transition text-rose-600"
                                title="Delete student"
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

          {/* ======================================================== */}
          {/* TAB 4: ADD JOB WITH AI */}
          {/* ======================================================== */}
          {activeNav === "ai_extractor" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Chat Column */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-[720px]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[#083327]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#083327]">AI Job Parser</h3>
                      <p className="text-[0.65rem] text-slate-500">Extracts clean job details automatically without making things up</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-50 text-emerald-800 text-[0.65rem] font-bold px-2 py-0.5 border border-emerald-200">
                    AI Powered
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.sender === "bot" && (
                        <div className="h-7 w-7 rounded-lg bg-[#083327] text-white flex items-center justify-center shrink-0 font-black text-xs">
                          AI
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === "user" ? "bg-[#083327] text-white" : "bg-slate-50 border border-slate-200 text-[#083327]"
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  {isExtracting && (
                    <div className="flex gap-2 items-center text-xs text-slate-500 py-1">
                      <Sparkles className="w-4 h-4 text-[#083327] animate-spin" />
                      <span>AI is reading and extracting the job details...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleExtract} className="mt-3 pt-3 border-t border-slate-100">
                  <textarea
                    rows={3}
                    value={inputJd}
                    onChange={(e) => setInputJd(e.target.value)}
                    placeholder="Paste any job description or hiring post here..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:bg-white focus:border-[#083327] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputJd.trim() || isExtracting}
                    className="mt-2 w-full rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white py-2.5 text-xs font-bold transition disabled:opacity-40 shadow-xs"
                  >
                    Extract Job Details
                  </button>
                </form>
              </div>

              {/* Schema Review Column */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs min-h-[720px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-bold text-xs text-[#083327]">Review Extracted Details</h3>
                    {editableListing && (
                      <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[0.65rem] font-bold px-2 py-0.5">
                        Ready to Save
                      </span>
                    )}
                  </div>

                  {!editableListing ? (
                    <div className="py-28 text-center text-slate-400">
                      <Sliders className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-xs text-[#083327]">No job extracted yet</p>
                      <p className="text-[0.7rem] mt-1 max-w-[240px] mx-auto text-slate-500">
                        Paste a job description on the left and click "Extract Job Details".
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 text-xs">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Job Title *</label>
                          <input
                            type="text"
                            value={editableListing.title || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, title: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Company Name *</label>
                          <input
                            type="text"
                            value={editableListing.company || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, company: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Location *</label>
                          <input
                            type="text"
                            value={editableListing.location || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, location: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Job Type</label>
                          <input
                            type="text"
                            placeholder="e.g. Internship, Full-time"
                            value={editableListing.employment_type || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, employment_type: e.target.value || null })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Application Link *</label>
                        <input
                          type="url"
                          value={editableListing.apply_url || ""}
                          onChange={(e) => setEditableListing({ ...editableListing, apply_url: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none font-mono focus:bg-white focus:border-[#083327]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {editableListing && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {saveSuccess && (
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Saved to website!
                      </span>
                    )}
                    <button
                      onClick={handleSaveListing}
                      disabled={isSaving}
                      className="ml-auto rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-5 py-2.5 text-xs font-bold shadow-xs disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save & Publish Job"}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: WEBSITE ANALYTICS & AI TIPS */}
          {/* ======================================================== */}
          {activeNav === "analytics" && (
            <div className="space-y-6">
              
              {/* Section Durations & Button Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-[#083327] mb-1">Time Spent on Each Section</h3>
                  <p className="text-[0.7rem] text-slate-500 mb-4">Average seconds visitors spend on each part of the website</p>
                  
                  <div className="space-y-3 text-xs font-bold">
                    {analyticsData?.sectionDurations && Object.entries(analyticsData.sectionDurations).map(([sec, val]: [string, any]) => (
                      <div key={sec}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize text-[#083327]">{sec.replace("_", " ")}</span>
                          <span className="text-[#083327]">{val.avgSec}s</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#083327] rounded-full" style={{ width: `${Math.min(100, (val.avgSec / 25) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-[#083327] mb-1">Most Clicked Buttons</h3>
                  <p className="text-[0.7rem] text-slate-500 mb-4">Which buttons visitors click the most</p>
                  
                  <div className="space-y-2.5">
                    {analyticsData?.buttonRankings?.map((btn: any) => (
                      <div key={btn.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-[#083327]">{btn.name}</span>
                        <span className="font-mono font-bold text-[#083327]">{btn.count} clicks ({btn.percentage})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Advisor Card */}
              <div className="rounded-2xl bg-white p-6 text-[#083327] border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3 text-[#083327]" /> AI Website Advisor
                    </div>
                    <h3 className="text-base font-bold text-[#083327]">Suggestions to Improve Website & Applications</h3>
                  </div>
                  <button
                    onClick={handleGenerateAiInsights}
                    disabled={isGeneratingInsights}
                    className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-4 py-2 text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    {isGeneratingInsights ? "Analyzing..." : "Get AI Suggestions"}
                  </button>
                </div>

                {aiInsights ? (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                    {aiInsights}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center text-slate-500 text-xs">
                    Click "Get AI Suggestions" above to see simple tips based on recent user activity.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: ACTIVITY LOGS */}
          {/* ======================================================== */}
          {activeNav === "reports" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-[#083327]">Activity & Ingestion History</h3>
                  <p className="text-[0.7rem] text-slate-500">Recent job extractions and updates</p>
                </div>
                <button onClick={fetchLogs} className="text-xs font-bold text-[#083327] hover:underline">
                  Refresh
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs">No logs recorded yet.</div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs.map((l) => (
                    <div key={l.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex justify-between font-bold text-[#083327] mb-1">
                        <span>{l.extracted_json?.title || "Parsed Job"}</span>
                        <span className="font-mono text-[0.65rem] text-[#083327] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {l.model_used}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[0.7rem] line-clamp-1">{l.raw_jd_snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Metric Footer */}
        <div className="pt-4 mt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-[0.7rem] text-slate-500 font-medium">
          <div>Siftrole Job Platform</div>
          <div className="flex gap-4">
            <span>PostgreSQL Connected</span>
            <span>AI Engine Active</span>
            <span>Job Scrapers Ready</span>
          </div>
        </div>

      </main>

      {/* ======================================================== */}
      {/* COMPANY MODAL */}
      {/* ======================================================== */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              {editingCompany ? "Edit Company" : "Add Company"}
            </h3>
            <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:bg-white focus:border-slate-800"
                  placeholder="e.g. Stripe"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Career Page Link *</label>
                <input
                  type="url"
                  required
                  value={companyForm.career_page_url}
                  onChange={(e) => setCompanyForm({ ...companyForm, career_page_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:bg-white focus:border-slate-800"
                  placeholder="https://stripe.com/jobs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Feed System *</label>
                  <select
                    value={companyForm.ats_type}
                    onChange={(e) => setCompanyForm({ ...companyForm, ats_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none text-slate-800"
                  >
                    <option value="GREENHOUSE">Greenhouse</option>
                    <option value="LEVER">Lever</option>
                    <option value="ASHBY">Ashby</option>
                    <option value="SMARTRECRUITERS">SmartRecruiters</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Slug / Token *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.ats_identifier}
                    onChange={(e) => setCompanyForm({ ...companyForm, ats_identifier: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none font-mono focus:bg-white focus:border-slate-800"
                    placeholder="e.g. stripe"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-5 py-2 font-bold shadow-xs"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STUDENT MODAL */}
      {/* ======================================================== */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              {editingUser ? "Edit Student Account" : "Add Student"}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:bg-white focus:border-slate-800"
                  placeholder="e.g. Sarah Chen"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:bg-white focus:border-slate-800"
                  placeholder="e.g. sarah.chen@stanford.edu"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={userForm.graduation_year || 2026}
                    onChange={(e) => setUserForm({ ...userForm, graduation_year: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none text-slate-800"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={userForm.skills}
                  onChange={(e) => setUserForm({ ...userForm, skills: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:bg-white focus:border-slate-800"
                  placeholder="e.g. React, TypeScript, Python"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-5 py-2 font-bold shadow-xs"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
