"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  LogOut,
  MapPin,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { SiftroleLogoMark } from "@/components/SiftroleLogo";
import { NewsletterBroadcastView } from "@/components/NewsletterBroadcastView";
import { AdminAiAgentView } from "@/components/AdminAiAgentView";

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

export function formatCleanJobDescription(raw: any): string {
  if (!raw) return "";
  if (typeof raw !== "string") return JSON.stringify(raw, null, 2);
  let text = raw.trim();

  // 1. If JSON string, extract clean_description or format structured keys
  if (text.startsWith("{") && text.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.clean_description) return parsed.clean_description;
      let formatted = "";
      if (parsed.summary) formatted += `## Role Summary\n${parsed.summary}\n\n`;
      if (parsed.responsibilities?.length) {
        formatted += `## Key Responsibilities\n` + parsed.responsibilities.map((r: string) => `• ${r}`).join("\n") + "\n\n";
      }
      if (parsed.qualifications?.length) {
        formatted += `## Qualifications & Requirements\n` + parsed.qualifications.map((q: string) => `• ${q}`).join("\n") + "\n\n";
      }
      if (parsed.benefits?.length) {
        formatted += `## Benefits & Compensation\n` + parsed.benefits.map((b: string) => `• ${b}`).join("\n");
      }
      if (formatted.trim()) return formatted.trim();
    } catch (_) {}
  }

  // 2. Decode double-encoded HTML entities if present (e.g. &lt;div... -> <div...)
  if (text.includes("&lt;") || text.includes("&gt;")) {
    text = text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
  }

  // 3. Convert HTML elements & tags to clean formatted text
  if (/<[a-z][\s\S]*>/i.test(text) || /<[a-z]+/i.test(text)) {
    text = text
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<\/li>/gi, "")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<h[1-6][^>]*>/gi, "\n\n### ")
      .replace(/<[^>]+>/g, "");
  }

  // 4. Strip any incomplete, broken, or truncated trailing HTML tags (e.g. "<span style" at end)
  text = text
    .replace(/<[a-zA-Z\/][^>]*$/g, "")
    .replace(/<[a-zA-Z][^>\n]*\b(?:style|class|id|href|src|color|font)\b[^>\n]*/gi, "")
    .replace(/<[a-zA-Z0-9_\-:]+(\s+[^>]*)?$/g, "");

  // 5. Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&bull;/g, "•")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');

  // 6. Clean excess whitespace
  text = text
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return text;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<"dashboard" | "review_queue" | "companies" | "users" | "ai_extractor" | "ai_agent" | "analytics" | "reports" | "newsletter">("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Header Stats
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, manual: 0, flagged: 0, companies: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Review Queue (Pending Scraped Finds & Flagged Roles) State
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [pendingSearch, setPendingSearch] = useState("");
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [editingPendingListing, setEditingPendingListing] = useState<any | null>(null);
  const [isApprovingId, setIsApprovingId] = useState<string | null>(null);
  const [isRefiningAi, setIsRefiningAi] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [pendingFilter, setPendingFilter] = useState<"all" | "pending_approval" | "flagged">("all");

  // Deep Company Verification State
  const [verificationReports, setVerificationReports] = useState<Record<string, any>>({});
  const [isVerifyingCompanyId, setIsVerifyingCompanyId] = useState<string | null>(null);
  const [activeVerificationModal, setActiveVerificationModal] = useState<any | null>(null);

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

  // 2.1 Automated ATS Discovery & Auto-Detect State
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [discoveredFeeds, setDiscoveredFeeds] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedDiscoveredSlugs, setSelectedDiscoveredSlugs] = useState<string[]>([]);
  const [isImportingDiscovered, setIsImportingDiscovered] = useState(false);
  const [autoDetectInput, setAutoDetectInput] = useState("");
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [autoDetectMessage, setAutoDetectMessage] = useState<string | null>(null);
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
    fetchPendingListings();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const fetchPendingListings = async () => {
    try {
      const res = await fetch("/api/listings?status=pending");
      if (res.ok) {
        const data = await res.json();
        setPendingListings(data.listings || []);
      }
    } catch (e) {
      console.error("Fetch pending listings error:", e);
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
        setPendingListings((prev) => prev.filter((item) => item.id !== id));
        setSelectedPendingIds((prev) => prev.filter((item) => item !== id));
        fetchStats();
        setEditingPendingListing(null);
      }
    } catch (e) {
      console.error("Approve listing error:", e);
    } finally {
      setIsApprovingId(null);
    }
  };

  const handleRejectListing = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this scraped job listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPendingListings((prev) => prev.filter((item) => item.id !== id));
        setSelectedPendingIds((prev) => prev.filter((item) => item !== id));
        fetchStats();
      }
    } catch (e) {
      console.error("Reject listing error:", e);
    }
  };

  const handleRefineWithAi = async (listingTarget: any) => {
    setIsRefiningAi(true);
    try {
      const res = await fetch("/api/ai/refine-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingTarget),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.refined) {
          setEditingPendingListing((prev: any) => ({
            ...prev,
            ...data.refined,
          }));
        }
      }
    } catch (e) {
      console.error("AI refinement error:", e);
      alert("Failed to refine listing with AI");
    } finally {
      setIsRefiningAi(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPendingIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedPendingIds, action: "approve" }),
      });
      if (res.ok) {
        setSelectedPendingIds([]);
        fetchPendingListings();
        fetchStats();
      }
    } catch (e) {
      console.error("Bulk approve error:", e);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedPendingIds.length === 0) return;
    if (!confirm(`Are you sure you want to reject and delete ${selectedPendingIds.length} listings?`)) return;
    setIsBulkProcessing(true);
    try {
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedPendingIds, action: "reject" }),
      });
      if (res.ok) {
        setSelectedPendingIds([]);
        fetchPendingListings();
        fetchStats();
      }
    } catch (e) {
      console.error("Bulk reject error:", e);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleDeepVerifyCompany = async (listingTarget: any) => {
    const targetKey = listingTarget.id || listingTarget.company;
    setIsVerifyingCompanyId(targetKey);
    try {
      const res = await fetch("/api/ai/verify-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: listingTarget.company,
          careerPageUrl: listingTarget.apply_url || "",
          applyUrl: listingTarget.apply_url || "",
          jobTitle: listingTarget.title || "",
          jobLocation: listingTarget.location || "",
          rawJdSnippet: listingTarget.raw_jd_text || "",
          autoApproveCompany: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setVerificationReports((prev) => ({
            ...prev,
            [targetKey]: data.report,
            [listingTarget.company]: data.report,
          }));
          setActiveVerificationModal({
            listing: listingTarget,
            report: data.report,
          });
        }
      }
    } catch (e) {
      console.error("Deep verification error:", e);
      alert("Failed to complete deep company verification.");
    } finally {
      setIsVerifyingCompanyId(null);
    }
  };

  const handleVerifyAndApprove = async (listingId: string, companyName: string, updatedFields?: any) => {
    try {
      await fetch("/api/ai/verify-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          autoApproveCompany: true,
        }),
      });
      await handleApproveListing(listingId, updatedFields);
      setActiveVerificationModal(null);
      fetchCompanies();
    } catch (e) {
      console.error("Verify & approve error:", e);
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
      const rawExtracted = data.rawExtractedJson || {};

      setEditableListing({
        ...listing,
        stipend_or_salary: listing.stipend_or_salary || rawExtracted.stipend_or_salary || null,
        deadline: listing.deadline || rawExtracted.deadline || null,
        eligibility: listing.eligibility || rawExtracted.eligibility || null,
        experience_level: listing.experience_level || rawExtracted.experience_level || null,
        skills_required: (listing.skills_required && listing.skills_required.length > 0)
          ? listing.skills_required
          : (rawExtracted.skills_required || []),
        summary: rawExtracted.summary || listing.summary || null,
        responsibilities: rawExtracted.responsibilities || listing.responsibilities || [],
        qualifications: rawExtracted.qualifications || listing.qualifications || [],
        benefits: rawExtracted.benefits || listing.benefits || [],
        clean_description: rawExtracted.clean_description || listing.clean_description || null,
        model_used: data.modelUsed,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `✨ Successfully extracted structured data for **${listing.title}** at **${listing.company}** via \`${data.modelUsed || "Groq LLM"}\`! Review the extracted fields on the right and click **Save & Publish Job** when ready.`,
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
      const structuredPayload = {
        summary: editableListing.summary || null,
        responsibilities: Array.isArray(editableListing.responsibilities) ? editableListing.responsibilities : [],
        qualifications: Array.isArray(editableListing.qualifications) ? editableListing.qualifications : [],
        benefits: Array.isArray(editableListing.benefits) ? editableListing.benefits : [],
        clean_description: editableListing.clean_description || null,
      };

      const payload = {
        ...editableListing,
        raw_jd_text: JSON.stringify(structuredPayload),
      };

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    setSyncStatus("⏳ Scraping & parsing all verified company feeds with Gemini AI in real-time...");
    
    // Live polling interval so counters & review queue update in real-time on screen
    const interval = setInterval(() => {
      fetchStats();
      fetchPendingListings();
      fetchCompanies();
    }, 2500);

    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const totalFetched = data.results?.reduce((acc: number, r: any) => acc + (r.fetched || 0), 0) || 0;
        const totalInserted = data.results?.reduce((acc: number, r: any) => acc + (r.inserted || 0), 0) || 0;
        setSyncStatus(`✅ Sync Complete: ${data.totalCompaniesSynced} companies synced. ${totalFetched} listings fetched, ${totalInserted} inserted.`);
      } else {
        setSyncStatus(`⚠️ Sync Error: ${data.error}`);
      }
    } catch (e: any) {
      setSyncStatus(`❌ Sync Failed: ${e.message}`);
    } finally {
      clearInterval(interval);
      fetchStats();
      fetchPendingListings();
      fetchCompanies();
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 8000);
    }
  };

  const handleDiscoverFeeds = async () => {
    setIsDiscovering(true);
    setDiscoveredFeeds([]);
    setShowDiscoveryModal(true);
    try {
      const res = await fetch("/api/companies/discover?limit=25");
      const data = await res.json();
      if (res.ok) {
        setDiscoveredFeeds(data.companies || []);
        // Pre-select all companies that aren't already added
        const unaddedSlugs = (data.companies || [])
          .filter((c: any) => !c.isAlreadyAdded)
          .map((c: any) => c.ats_identifier);
        setSelectedDiscoveredSlugs(unaddedSlugs);
      }
    } catch (err: any) {
      alert("Discovery error: " + err.message);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleImportSelectedFeeds = async () => {
    if (selectedDiscoveredSlugs.length === 0) return;
    setIsImportingDiscovered(true);
    try {
      const companiesToImport = discoveredFeeds.filter((c) =>
        selectedDiscoveredSlugs.includes(c.ats_identifier)
      );
      const res = await fetch("/api/companies/discover", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies: companiesToImport }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus(`✅ ${data.message}`);
        setShowDiscoveryModal(false);
        fetchCompanies();
        fetchStats();
      } else {
        alert("Import failed: " + data.error);
      }
    } catch (err: any) {
      alert("Import error: " + err.message);
    } finally {
      setIsImportingDiscovered(false);
      setTimeout(() => setSyncStatus(null), 8000);
    }
  };

  const handleAutoDetectCompany = async () => {
    if (!autoDetectInput.trim()) return;
    setIsAutoDetecting(true);
    setAutoDetectMessage(null);
    try {
      const res = await fetch("/api/companies/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: autoDetectInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.detected) {
        setCompanyForm({
          name: data.name || companyForm.name,
          career_page_url: data.career_page_url || companyForm.career_page_url,
          ats_type: data.ats_type || companyForm.ats_type,
          ats_identifier: data.ats_identifier || companyForm.ats_identifier,
          verified: true,
        });
        setAutoDetectMessage(`✅ Verified active ${data.ats_type} feed! Found ${data.activeJobsCount} live jobs.`);
      } else {
        setAutoDetectMessage(`⚠️ ${data.error || "Could not auto-detect ATS feed."}`);
      }
    } catch (err: any) {
      setAutoDetectMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsAutoDetecting(false);
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

  const handleSyncSingleCompany = async (id: string, name?: string) => {
    setCompanySyncingId(id);
    setSyncStatus(`⏳ Scraping and ingesting feeds for ${name || "company"} in real-time with Gemini AI...`);
    
    // Live polling interval so counters & review queue update live on screen while syncing
    const interval = setInterval(() => {
      fetchStats();
      fetchPendingListings();
      fetchCompanies();
    }, 2500);

    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, triggerSync: true }),
      });
      const data = await res.json();
      if (res.ok && data.syncResult) {
        const sr = data.syncResult;
        const msg = `✅ Synced ${sr.companyName || name}: ${sr.fetched} fetched, ${sr.inserted} new jobs added, ${sr.updated} refreshed.`;
        setSyncStatus(msg);
      } else {
        setSyncStatus(`⚠️ Sync warning: ${data.error || "Failed to sync company"}`);
      }
    } catch (err: any) {
      setSyncStatus(`❌ Sync error: ${err.message}`);
    } finally {
      clearInterval(interval);
      fetchCompanies();
      fetchStats();
      fetchPendingListings();
      setCompanySyncingId(null);
      setTimeout(() => setSyncStatus(null), 8000);
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
              <div className="flex items-center gap-2 px-1">
                <SiftroleLogoMark size={26} />
                <div className="text-xl font-black tracking-tight text-slate-900">
                  Sift<span className="text-[#083327]">role</span> <span className="text-[0.65rem] font-bold bg-[#eef8e5] text-[#3c7818] border border-[#cce8be] px-1.5 py-0.5 rounded ml-1">Admin</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-[#eef8e5] flex items-center justify-center transition border border-slate-200 shadow-xs"
                  title="Expand sidebar"
                >
                  <SiftroleLogoMark size={22} />
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

          {/* Public Website Quick Jump */}
          {!isSidebarCollapsed ? (
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-[#eef8e5] border border-slate-200 hover:border-[#84d64f] rounded-xl px-3 py-2.5 mb-4 flex items-center justify-between transition group"
              title="Go to main website (localhost:3000)"
            >
              <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#14281a] transition">
                Go to Main Website
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

            {/* 2. Review Queue (Pending & Flagged) */}
            <button
              onClick={() => {
                setActiveNav("review_queue");
                fetchPendingListings();
              }}
              title="Review Queue (Pending Scrapes & Flagged Roles)"
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
                {!isSidebarCollapsed && <span>Review Queue</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded-full ${
                  activeNav === "review_queue" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-900"
                }`}>
                  {stats.pending || pendingListings.length || 0}
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

            {/* 4.5 Admin AI Agent (Full DB Control) */}
            <button
              onClick={() => setActiveNav("ai_agent")}
              title="Admin AI Agent (Full Database Control)"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "ai_agent"
                  ? "bg-emerald-900 text-white shadow-xs"
                  : "text-emerald-950 bg-emerald-50/60 hover:bg-emerald-100/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 shrink-0 ${activeNav === "ai_agent" ? "text-emerald-400" : "text-emerald-700"}`} />
                {!isSidebarCollapsed && <span>Admin AI Agent</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded ${activeNav === "ai_agent" ? "bg-white/20 text-white" : "bg-emerald-200 text-emerald-900"}`}>
                  Agent
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
                  {logs.length || 0}
                </span>
              )}
            </button>

            {/* 7. Newsletter Broadcasts */}
            <button
              onClick={() => setActiveNav("newsletter")}
              title="Newsletter & Job Alerts Broadcast"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
              } rounded-xl text-xs font-bold transition ${
                activeNav === "newsletter"
                  ? "bg-[#14281a] text-[#84d64f] shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className={`w-4 h-4 shrink-0 ${activeNav === "newsletter" ? "text-[#84d64f]" : "text-slate-500"}`} />
                {!isSidebarCollapsed && <span>Newsletter Alerts</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded ${activeNav === "newsletter" ? "bg-[#84d64f] text-[#14281a]" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}>
                  Email
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Profile / Account Pill */}
        {!isSidebarCollapsed ? (
          <div className="pt-4 pb-2 border-t border-slate-200 mt-6">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#083327]" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 truncate">Administrator</div>
                  <div className="text-[0.65rem] text-emerald-700 font-medium">Status: Active</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                title="Log out of Admin Console"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-4 border-t border-slate-200 mt-6 flex flex-col items-center gap-2" title="Administrator (Active)">
            <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 text-[#083327] font-bold flex items-center justify-center text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-rose-600 transition cursor-pointer"
              title="Log out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
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
                  {activeNav === "ai_agent" && "Admin AI Agent (Copilot)"}
                  {activeNav === "analytics" && "Website Analytics & AI Tips"}
                  {activeNav === "reports" && "Activity Logs"}
                  {activeNav === "newsletter" && "Newsletter & Job Alert Broadcasts"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeNav === "dashboard" && "Overview of live jobs, applications, and system status"}
                  {activeNav === "review_queue" && "Scraped roles flagged by AI for missing details or suspicious signals. Review, fix, and approve to publish."}
                  {activeNav === "companies" && "Manage company job feeds and career page scrapers"}
                  {activeNav === "users" && "View and manage registered student candidate accounts"}
                  {activeNav === "ai_extractor" && "Paste any job posting to extract details into clean fields"}
                  {activeNav === "ai_agent" && "Full-control assistant with live database grounding, telemetry, and platform operations"}
                  {activeNav === "analytics" && "See user activity and simple AI suggestions to improve the website"}
                  {activeNav === "reports" && "History of recent job syncs and extractions"}
                  {activeNav === "newsletter" && "Select verified tech openings and dispatch email digests directly to active subscribers via Resend"}
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
                      <div className="text-3xl font-black mt-1 text-[#083327] tracking-tight">{stats.active || 0}</div>
                    </div>
                    <div className="flex gap-1 items-end h-8">
                      <span className="w-1.5 h-4 bg-emerald-200 rounded-full" />
                      <span className="w-1.5 h-7 bg-emerald-300 rounded-full" />
                      <span className="w-1.5 h-5 bg-[#083327] rounded-full" />
                      <span className="w-1.5 h-8 bg-[#083327] rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 text-[0.7rem] font-bold text-[#083327] flex items-center gap-1">
                    <span>100% verified</span> active & published on live student platform
                  </div>
                </div>

                {/* Card 2: Pending Review Queue */}
                <div
                  onClick={() => {
                    setActiveNav("review_queue");
                    fetchPendingListings();
                  }}
                  className="rounded-2xl bg-white hover:bg-amber-50/30 p-5 border border-amber-200 shadow-xs flex flex-col justify-between cursor-pointer transition group"
                  title="Click to open Review Queue"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-amber-800">Jobs in Review Queue</span>
                      <div className="text-3xl font-black mt-1 text-amber-900 tracking-tight">
                        {stats.pending || 0}
                      </div>
                    </div>
                    <div className="flex gap-1 items-end h-8">
                      <span className="w-1.5 h-4 bg-amber-200 rounded-full" />
                      <span className="w-1.5 h-6 bg-amber-400 rounded-full" />
                      <span className="w-1.5 h-8 bg-amber-600 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 text-[0.7rem] font-bold text-amber-800 flex items-center justify-between">
                    <span>{stats.flagged || 0} flagged</span>
                    <span className="text-amber-900 group-hover:underline flex items-center gap-0.5">Review now →</span>
                  </div>
                </div>

                {/* Card 3: Job Apply Clicks */}
                <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#083327]">Job Applications Clicked</span>
                      <div className="text-3xl font-black mt-1 text-[#083327] tracking-tight">{analyticsData?.summary?.totalApplies ?? 0}</div>
                    </div>
                    <div className="flex gap-1 items-end h-8">
                      <span className="w-1.5 h-3 bg-emerald-200 rounded-full" />
                      <span className="w-1.5 h-5 bg-emerald-300 rounded-full" />
                      <span className="w-1.5 h-7 bg-[#083327] rounded-full" />
                      <span className="w-1.5 h-6 bg-[#083327] rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 text-[0.7rem] font-bold text-[#083327] flex items-center gap-1">
                    <span>
                      {analyticsData?.summary?.dailyVisitsTotal > 0
                        ? `${Math.round(((analyticsData?.summary?.totalApplies || 0) / analyticsData?.summary?.dailyVisitsTotal) * 100)}% of visitors`
                        : "0% of visitors"}
                    </span>{" "}
                    click through to apply
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
                    {(analyticsData?.dailyVisits || [
                      { day: "Mon", jobsAdded: 0, applies: 0 },
                      { day: "Tue", jobsAdded: 0, applies: 0 },
                      { day: "Wed", jobsAdded: 0, applies: 0 },
                      { day: "Thu", jobsAdded: 0, applies: 0 },
                      { day: "Fri", jobsAdded: 0, applies: 0 },
                      { day: "Sat", jobsAdded: 0, applies: 0 },
                      { day: "Sun (Today)", jobsAdded: 0, applies: 0 },
                    ]).map((item: any) => {
                      const maxVal = Math.max(
                        ...((analyticsData?.dailyVisits || []).map((d: any) => Math.max(d.jobsAdded || 0, d.applies || 0))),
                        10
                      );
                      const bar1Height = item.jobsAdded > 0 ? (item.jobsAdded / maxVal) * 100 : 4;
                      const bar2Height = item.applies > 0 ? (item.applies / maxVal) * 100 : 4;

                      return (
                        <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex items-end justify-center gap-1.5 h-32">
                            <div
                              className="w-3 bg-emerald-200 rounded-t-sm hover:bg-emerald-300 transition"
                              style={{ height: `${bar1Height}%` }}
                              title={`Jobs Added: ${item.jobsAdded || 0}`}
                            />
                            <div
                              className="w-3 bg-[#083327] rounded-t-sm"
                              style={{ height: `${bar2Height}%` }}
                              title={`Student Applications: ${item.applies || 0}`}
                            />
                          </div>
                          <span className="text-[0.65rem] font-bold text-[#083327]">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Jobs by Source Card */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#083327]">
                      Total Live Jobs
                    </span>
                    <div className="text-4xl font-black text-[#083327] mt-2 tracking-tight">
                      {stats.active || 0} <span className="text-sm font-bold text-emerald-600">LIVE</span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#083327] flex items-center gap-1">
                      <span>{stats.pending || 0} in review queue</span> • {stats.total || 0} total indexed
                    </div>
                  </div>

                  <div className="space-y-2.5 my-4">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#083327]">
                        <ShieldCheck className="w-4 h-4 text-[#083327]" />
                        <span>Greenhouse Jobs</span>
                      </div>
                      <span className="font-extrabold text-[#083327]">
                        {companies.filter((c) => c.ats_type === "GREENHOUSE").reduce((acc, c) => acc + (c._count?.listings || 0), 0)} jobs
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#083327]">
                        <ShieldCheck className="w-4 h-4 text-[#083327]" />
                        <span>Ashby Jobs</span>
                      </div>
                      <span className="font-extrabold text-[#083327]">
                        {companies.filter((c) => c.ats_type === "ASHBY").reduce((acc, c) => acc + (c._count?.listings || 0), 0)} jobs
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#083327]">
                        <ShieldCheck className="w-4 h-4 text-[#083327]" />
                        <span>Lever Jobs</span>
                      </div>
                      <span className="font-extrabold text-[#083327]">
                        {companies.filter((c) => c.ats_type === "LEVER").reduce((acc, c) => acc + (c._count?.listings || 0), 0)} jobs
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveNav("companies")}
                    className="w-full rounded-xl bg-[#083327] text-white py-2.5 text-xs font-bold hover:bg-[#0c4333] transition text-center shadow-xs cursor-pointer"
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
                        {companies.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                              No companies added yet. Click &quot;Add Company&quot; above to register your first employer feed.
                            </td>
                          </tr>
                        ) : (
                          companies.slice(0, 5).map((comp) => (
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
                                  className="p-1 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                                  title="Sync jobs for this company"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-[#083327]" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
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
                      {stats.active || 0} live active roles published for candidates with {stats.pending || 0} awaiting approval in review queue.
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
          {/* TAB: REVIEW QUEUE (PENDING SCRAPED FINDS & FLAGGED JOBS) */}
          {/* ======================================================== */}
          {activeNav === "review_queue" && (
            <div className="space-y-4">
              {/* Header Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[220px] max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search pending jobs by title, company, or location..."
                      value={pendingSearch}
                      onChange={(e) => setPendingSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setPendingFilter("all")}
                      className={`px-2.5 py-1 text-[0.68rem] font-bold rounded-lg transition ${
                        pendingFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All ({pendingListings.length})
                    </button>
                    <button
                      onClick={() => setPendingFilter("pending_approval")}
                      className={`px-2.5 py-1 text-[0.68rem] font-bold rounded-lg transition ${
                        pendingFilter === "pending_approval" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      New Scrapes ({pendingListings.filter((l) => l.status === "pending_approval").length})
                    </button>
                    <button
                      onClick={() => setPendingFilter("flagged")}
                      className={`px-2.5 py-1 text-[0.68rem] font-bold rounded-lg transition ${
                        pendingFilter === "flagged" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Flagged ({pendingListings.filter((l) => l.status === "flagged").length})
                    </button>
                  </div>
                </div>

                {/* Bulk Actions & Refresh */}
                <div className="flex items-center gap-2">
                  {selectedPendingIds.length > 0 && (
                    <div className="flex items-center gap-1.5 animate-fadeIn">
                      <button
                        onClick={handleBulkApprove}
                        disabled={isBulkProcessing}
                        className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve ({selectedPendingIds.length})
                      </button>
                      <button
                        onClick={handleBulkReject}
                        disabled={isBulkProcessing}
                        className="rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Reject ({selectedPendingIds.length})
                      </button>
                    </div>
                  )}

                  <button
                    onClick={fetchPendingListings}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
                    title="Refresh pending jobs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {pendingListings.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#083327]">All Scraped Jobs Reviewed</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                    There are no pending scraped listings awaiting approval. Background scraper cycles will automatically populate new finds here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[0.68rem]">
                        <tr>
                          <th className="py-3.5 px-4 w-12 text-center">
                            <input
                              type="checkbox"
                              checked={
                                pendingListings.length > 0 &&
                                selectedPendingIds.length === pendingListings.length
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPendingIds(pendingListings.map((l) => l.id));
                                } else {
                                  setSelectedPendingIds([]);
                                }
                              }}
                              className="rounded border-slate-300 accent-[#083327] cursor-pointer w-4 h-4"
                            />
                          </th>
                          <th className="py-3.5 px-4 min-w-[280px]">Company & Role</th>
                          <th className="py-3.5 px-4 w-[160px]">Status</th>
                          <th className="py-3.5 px-4 w-[140px]">Location</th>
                          <th className="py-3.5 px-4 w-[150px]">Salary / Stipend</th>
                          <th className="py-3.5 px-4 min-w-[200px] max-w-[260px]">Eligibility</th>
                          <th className="py-3.5 px-4 min-w-[260px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingListings
                          .filter((l) => {
                            if (pendingFilter === "pending_approval" && l.status !== "pending_approval") return false;
                            if (pendingFilter === "flagged" && l.status !== "flagged") return false;
                            return (
                              l.title.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                              l.company.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                              (l.location && l.location.toLowerCase().includes(pendingSearch.toLowerCase()))
                            );
                          })
                          .map((listing) => {
                            const isSelected = selectedPendingIds.includes(listing.id);
                            return (
                              <tr
                                key={listing.id}
                                className={`transition-colors group ${
                                  isSelected
                                    ? "bg-emerald-50/60"
                                    : listing.status === "flagged"
                                    ? "hover:bg-amber-50/40 bg-amber-50/10"
                                    : "hover:bg-slate-50/80"
                                }`}
                              >
                                <td className="py-3 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedPendingIds((prev) => [...prev, listing.id]);
                                      } else {
                                        setSelectedPendingIds((prev) => prev.filter((id) => id !== listing.id));
                                      }
                                    }}
                                    className="rounded border-slate-300 accent-[#083327] cursor-pointer w-4 h-4"
                                  />
                                </td>

                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="shrink-0">
                                      <CompanyLogo company={listing.company} size="sm" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <div
                                          className="font-bold text-slate-900 text-xs leading-snug truncate max-w-[240px]"
                                          title={listing.title}
                                        >
                                          {listing.title}
                                        </div>
                                        {listing.apply_url && (
                                          <a
                                            href={listing.apply_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded-md text-slate-400 hover:text-[#083327] hover:bg-emerald-50 transition shrink-0 inline-flex items-center"
                                            title="Open official company job posting in new tab"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-[#083327]" />
                                          </a>
                                        )}
                                      </div>
                                      <div className="text-[0.68rem] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                        <span className="text-slate-700 font-semibold">{listing.company}</span>
                                        {listing.employment_type && (
                                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[0.62rem]">
                                            {listing.employment_type}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  {listing.status === "flagged" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 text-[0.68rem] font-bold shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                      AI Flagged
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 px-2.5 py-1 text-[0.68rem] font-bold shadow-2xs">
                                      <Clock className="w-3 h-3 text-sky-600" />
                                      Scraped • Pending
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1 text-slate-700 font-medium text-xs">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[120px]" title={listing.location || "Remote"}>
                                      {listing.location || "Remote"}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  {listing.stipend_or_salary ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/70 text-emerald-900 font-bold text-[0.72rem]">
                                      {listing.stipend_or_salary}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-normal italic text-[0.72rem]">Unspecified</span>
                                  )}
                                </td>

                                <td className="py-3 px-4">
                                  {listing.eligibility ? (
                                    <div
                                      className="text-[0.7rem] text-slate-600 line-clamp-2 leading-relaxed max-w-[240px]"
                                      title={listing.eligibility}
                                    >
                                      {listing.eligibility}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[0.7rem]">Not specified</span>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleDeepVerifyCompany(listing)}
                                      disabled={isVerifyingCompanyId === listing.id || isVerifyingCompanyId === listing.company}
                                      className="h-8 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                                      title="Run deep AI verification on company existence"
                                    >
                                      <ShieldCheck className={`w-3.5 h-3.5 text-indigo-600 ${isVerifyingCompanyId === listing.id ? "animate-spin" : ""}`} />
                                      <span>Verify</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        const cleanDesc = formatCleanJobDescription(listing.raw_jd_text || listing.clean_description);
                                        const cleanedListing = {
                                          ...listing,
                                          raw_jd_text: cleanDesc,
                                          clean_description: cleanDesc,
                                        };
                                        setEditingPendingListing(cleanedListing);
                                        handleRefineWithAi(cleanedListing);
                                      }}
                                      className="h-8 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#083327] border border-emerald-200/80 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                      title="Refine role details with AI"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>AI Refine</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        const cleanDesc = formatCleanJobDescription(listing.raw_jd_text || listing.clean_description);
                                        setEditingPendingListing({
                                          ...listing,
                                          raw_jd_text: cleanDesc,
                                          clean_description: cleanDesc,
                                        });
                                      }}
                                      className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                      title="Edit fields manually"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      onClick={() => handleApproveListing(listing.id)}
                                      disabled={isApprovingId === listing.id}
                                      className="h-8 px-3 rounded-xl bg-[#083327] hover:bg-[#0c4333] active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                      title="Approve immediately to live platform"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                                      <span>Approve</span>
                                    </button>

                                    <button
                                      onClick={() => handleRejectListing(listing.id)}
                                      className="h-8 w-8 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 text-rose-500 hover:text-rose-700 inline-flex items-center justify-center transition cursor-pointer"
                                      title="Reject and delete"
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

          {/* Quick Review and AI Refinement Modal for Pending Scraped Roles */}
          {editingPendingListing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#083327] flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#083327] truncate">Review & Refine Scraped Job</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">Review structured fields, inspect full JD text, or trigger AI refinement before publishing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {editingPendingListing.apply_url && (
                      <a
                        href={editingPendingListing.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap"
                        title="Open official company job posting in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>Live Post</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeepVerifyCompany(editingPendingListing)}
                      disabled={isVerifyingCompanyId === editingPendingListing.id}
                      className="h-9 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-2xs whitespace-nowrap"
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 text-indigo-600 ${isVerifyingCompanyId === editingPendingListing.id ? "animate-spin" : ""}`} />
                      <span>{isVerifyingCompanyId === editingPendingListing.id ? "Verifying..." : "Verify Company"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAi(editingPendingListing)}
                      disabled={isRefiningAi}
                      className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isRefiningAi ? "animate-spin" : ""}`} />
                      <span>{isRefiningAi ? "Refining with AI..." : "Refine with AI"}</span>
                    </button>
                    <button
                      onClick={() => setEditingPendingListing(null)}
                      className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer shrink-0 ml-1"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Company Verification Banner if Cached */}
                {verificationReports[editingPendingListing.id] || verificationReports[editingPendingListing.company] ? (
                  (() => {
                    const report = verificationReports[editingPendingListing.id] || verificationReports[editingPendingListing.company];
                    return (
                      <div className="mb-4 p-3.5 rounded-xl border bg-slate-50 text-xs space-y-2 border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[0.68rem] font-black uppercase tracking-wide ${
                              report.verdict === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : report.verdict === "CAUTION"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-rose-100 text-rose-900 border border-rose-300"
                            }`}>
                              AI Verdict: {report.verdict}
                            </span>
                            <span className="font-bold text-slate-700 text-xs">
                              Trust Score: <span className="text-[#083327] font-black">{report.trustScore}/100</span>
                            </span>
                          </div>
                          <span className="text-[0.68rem] text-slate-500 font-medium">
                            {report.companyProfile?.industry} • {report.companyProfile?.headquarters}
                          </span>
                        </div>
                        <p className="text-[0.72rem] text-slate-600 leading-relaxed">
                          {report.recommendation}
                        </p>
                        {report.redFlags && report.redFlags.length > 0 && (
                          <div className="text-[0.68rem] text-rose-700 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                            ⚠️ Risks: {report.redFlags.join(" • ")}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="mb-4 p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-xs text-indigo-950 font-medium">
                        Deep AI verification checks corporate identity, domain authenticity, and scam risk.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeepVerifyCompany(editingPendingListing)}
                      disabled={isVerifyingCompanyId === editingPendingListing.id}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[0.68rem] hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      Verify Now
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApproveListing(editingPendingListing.id, {
                      title: editingPendingListing.title,
                      company: editingPendingListing.company,
                      location: editingPendingListing.location,
                      employment_type: editingPendingListing.employment_type,
                      eligibility: editingPendingListing.eligibility,
                      stipend_or_salary: editingPendingListing.stipend_or_salary,
                      skills_required: Array.isArray(editingPendingListing.skills_required)
                        ? editingPendingListing.skills_required
                        : typeof editingPendingListing.skills_required === "string"
                        ? editingPendingListing.skills_required.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : [],
                      experience_level: editingPendingListing.experience_level,
                      apply_url: editingPendingListing.apply_url,
                      raw_jd_text: editingPendingListing.raw_jd_text || editingPendingListing.clean_description || null,
                      status: "active",
                    });
                  }}
                  className="space-y-3.5 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Role Title *</label>
                      <input
                        type="text"
                        required
                        value={editingPendingListing.title || ""}
                        onChange={(e) => setEditingPendingListing({ ...editingPendingListing, title: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Company *</label>
                      <input
                        type="text"
                        required
                        value={editingPendingListing.company || ""}
                        onChange={(e) => setEditingPendingListing({ ...editingPendingListing, company: e.target.value })}
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
                        value={editingPendingListing.location || ""}
                        onChange={(e) => setEditingPendingListing({ ...editingPendingListing, location: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Employment Type</label>
                      <input
                        type="text"
                        value={editingPendingListing.employment_type || ""}
                        onChange={(e) => setEditingPendingListing({ ...editingPendingListing, employment_type: e.target.value })}
                        placeholder="e.g. Internship, Full-time"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">
                        Compensation / Salary
                      </label>
                      <input
                        type="text"
                        value={editingPendingListing.stipend_or_salary || ""}
                        onChange={(e) => setEditingPendingListing({ ...editingPendingListing, stipend_or_salary: e.target.value })}
                        placeholder="e.g. $140K - $170K / Year or $55/hr"
                        className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">
                        Eligibility
                      </label>
                      <input
                        type="text"
                        value={editingPendingListing.eligibility || ""}
                        onChange={(e) => setEditingPendingListing({ ...editingPendingListing, eligibility: e.target.value })}
                        placeholder="e.g. Graduating 2026/2027 • B.Tech in CS"
                        className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Experience Level</label>
                      <input
                        type="text"
                        value={editingPendingListing.experience_level || ""}
                        onChange={(e) => setEditingPendingListing({ ...editingPendingListing, experience_level: e.target.value })}
                        placeholder="e.g. Entry Level, 0-2 Years"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={
                          Array.isArray(editingPendingListing.skills_required)
                            ? editingPendingListing.skills_required.join(", ")
                            : editingPendingListing.skills_required || ""
                        }
                        onChange={(e) =>
                          setEditingPendingListing({
                            ...editingPendingListing,
                            skills_required: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="e.g. Python, React, TypeScript, SQL"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#083327]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[0.7rem] font-bold text-slate-700">Official Apply / Career Page URL *</label>
                      {editingPendingListing.apply_url && (
                        <a
                          href={editingPendingListing.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 hover:underline"
                        >
                          Visit Career Page <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        required
                        value={editingPendingListing.apply_url || ""}
                        onChange={(e) => setEditingPendingListing({ ...editingPendingListing, apply_url: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-24 py-2 text-xs font-mono outline-none focus:bg-white focus:border-[#083327]"
                      />
                      {editingPendingListing.apply_url && (
                        <a
                          href={editingPendingListing.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[0.7rem] font-bold text-slate-700 inline-flex items-center gap-1 shadow-2xs transition"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Full Job Description Viewer & Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[0.7rem] font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Full Job Description & Role Overview
                      </label>
                      <span className="text-[0.68rem] text-slate-400">
                        Full text parsed from company career feed
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={formatCleanJobDescription(
                        editingPendingListing.raw_jd_text ||
                        editingPendingListing.clean_description ||
                        ""
                      )}
                      onChange={(e) =>
                        setEditingPendingListing({
                          ...editingPendingListing,
                          raw_jd_text: e.target.value,
                          clean_description: e.target.value,
                        })
                      }
                      placeholder="Full job description, key responsibilities, requirements, and benefits..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed outline-none focus:bg-white focus:border-[#083327] font-sans resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleVerifyAndApprove(editingPendingListing.id, editingPendingListing.company, {
                        title: editingPendingListing.title,
                        company: editingPendingListing.company,
                        location: editingPendingListing.location,
                        employment_type: editingPendingListing.employment_type,
                        eligibility: editingPendingListing.eligibility,
                        stipend_or_salary: editingPendingListing.stipend_or_salary,
                        skills_required: Array.isArray(editingPendingListing.skills_required)
                          ? editingPendingListing.skills_required
                          : typeof editingPendingListing.skills_required === "string"
                          ? editingPendingListing.skills_required.split(",").map((s: string) => s.trim()).filter(Boolean)
                          : [],
                        experience_level: editingPendingListing.experience_level,
                        apply_url: editingPendingListing.apply_url,
                        raw_jd_text: editingPendingListing.raw_jd_text || editingPendingListing.clean_description || null,
                        status: "active",
                      })}
                      className="rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                      title="Mark company verified and approve listing"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-700" /> Verify Co. & Publish
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPendingListing(null)}
                        className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isApprovingId === editingPendingListing.id}
                        className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-5 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isApprovingId === editingPendingListing.id ? "Publishing..." : "Approve & Publish to Platform"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Standalone Deep Company Verification Report Modal */}
          {activeVerificationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6 text-indigo-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        AI Corporate Verification: {activeVerificationModal.report.companyName}
                      </h3>
                      <p className="text-[0.72rem] text-slate-500">
                        Deep multi-point authenticity check powered by Groq LLM and domain security analysis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveVerificationModal(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Score & Verdict Card */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  activeVerificationModal.report.verdict === "VERIFIED"
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : activeVerificationModal.report.verdict === "CAUTION"
                    ? "bg-amber-50/80 border-amber-200 text-amber-950"
                    : "bg-rose-50/80 border-rose-200 text-rose-950"
                }`}>
                  <div className="space-y-1">
                    <div className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">
                      Overall Legitimacy Assessment
                    </div>
                    <div className="text-lg font-black flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase ${
                        activeVerificationModal.report.verdict === "VERIFIED"
                          ? "bg-emerald-600 text-white"
                          : activeVerificationModal.report.verdict === "CAUTION"
                          ? "bg-amber-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}>
                        {activeVerificationModal.report.verdict}
                      </span>
                      <span>{activeVerificationModal.report.recommendation}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Trust Score</div>
                    <div className="text-3xl font-black text-[#083327]">{activeVerificationModal.report.trustScore}/100</div>
                  </div>
                </div>

                {/* Company Profile Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[0.68rem] font-bold text-slate-500 uppercase">Industry & Sector</div>
                    <div className="font-bold text-slate-900 mt-0.5">{activeVerificationModal.report.companyProfile?.industry || "Technology"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[0.68rem] font-bold text-slate-500 uppercase">Headquarters</div>
                    <div className="font-bold text-slate-900 mt-0.5">{activeVerificationModal.report.companyProfile?.headquarters || "Global / Remote"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[0.68rem] font-bold text-slate-500 uppercase">Domain & Web Identity</div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">{activeVerificationModal.report.companyProfile?.websiteOrDomain || "Direct domain"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[0.68rem] font-bold text-slate-500 uppercase">Recruiting ATS Infrastructure</div>
                    <div className="font-bold text-slate-900 mt-0.5">{activeVerificationModal.report.companyProfile?.atsProvider || "Official Portal"}</div>
                  </div>
                </div>

                {/* Company Summary */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="text-[0.68rem] font-bold text-slate-500 uppercase mb-1">Company Overview</div>
                  <p className="text-slate-700 leading-relaxed">{activeVerificationModal.report.companyProfile?.summary}</p>
                </div>

                {/* Green Flags vs Red Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
                    <div className="text-[0.68rem] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Trust Signals & Green Flags
                    </div>
                    <ul className="space-y-1 text-emerald-950 text-[0.72rem]">
                      {activeVerificationModal.report.greenFlags?.map((flag: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-1.5">
                    <div className="text-[0.68rem] font-bold text-rose-800 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Risk Factors & Red Flags
                    </div>
                    {activeVerificationModal.report.redFlags && activeVerificationModal.report.redFlags.length > 0 ? (
                      <ul className="space-y-1 text-rose-950 text-[0.72rem]">
                        {activeVerificationModal.report.redFlags.map((flag: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-emerald-700 text-[0.72rem] font-medium pt-1">
                        Zero scam indicators or suspicious domain redirects found.
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      if (activeVerificationModal.listing?.id) {
                        handleRejectListing(activeVerificationModal.listing.id);
                        setActiveVerificationModal(null);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold transition cursor-pointer"
                  >
                    Reject as Suspicious
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveVerificationModal(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        if (activeVerificationModal.listing?.id) {
                          handleVerifyAndApprove(
                            activeVerificationModal.listing.id,
                            activeVerificationModal.report.companyName,
                            {
                              title: activeVerificationModal.listing.title,
                              company: activeVerificationModal.listing.company,
                              location: activeVerificationModal.listing.location,
                              employment_type: activeVerificationModal.listing.employment_type,
                              eligibility: activeVerificationModal.listing.eligibility,
                              stipend_or_salary: activeVerificationModal.listing.stipend_or_salary,
                              skills_required: activeVerificationModal.listing.skills_required,
                              experience_level: activeVerificationModal.listing.experience_level,
                              apply_url: activeVerificationModal.listing.apply_url,
                              status: "active",
                            }
                          );
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verify Company & Approve Listing
                    </button>
                  </div>
                </div>
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
                
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleDiscoverFeeds}
                    title="Automatically discover verified tech company feeds with live active jobs"
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    Auto-Discover Feeds
                  </button>

                  <button
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#083327] border border-emerald-300 px-3.5 py-2 text-xs font-bold inline-flex items-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#083327]" : ""}`} />
                    {isSyncing ? "Scraping All Feeds..." : "⚡ Run All Scrapers"}
                  </button>

                  <button
                    onClick={() => {
                      setEditingCompany(null);
                      setCompanyForm({ name: "", career_page_url: "", ats_type: "GREENHOUSE", ats_identifier: "", verified: true });
                      setAutoDetectInput("");
                      setAutoDetectMessage(null);
                      setShowCompanyModal(true);
                    }}
                    className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Company
                  </button>

                  <span className="text-xs font-bold text-slate-500 pl-2">
                    {filteredCompanies.length} Active Companies
                  </span>
                </div>
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
                              onClick={() => handleSyncSingleCompany(c.id, c.name)}
                              disabled={companySyncingId === c.id}
                              title={`Scrape and sync jobs for ${c.name}`}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 hover:text-[#083327] transition text-slate-700 cursor-pointer"
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
                  <div className="relative">
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 outline-none transition focus:border-[#083327] focus:ring-2 focus:ring-[#083327]/10 cursor-pointer shadow-2xs"
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>

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
                        <div className="whitespace-pre-wrap">
                          {msg.text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                            if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
                              return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
                            }
                            return <React.Fragment key={i}>{part}</React.Fragment>;
                          })}
                        </div>
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
                    <div>
                      <h3 className="font-bold text-xs text-[#083327]">Review Extracted Details</h3>
                      {editableListing?.model_used && (
                        <span className="text-[0.65rem] text-slate-400 font-mono">
                          Extracted via {editableListing.model_used}
                        </span>
                      )}
                    </div>
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
                    <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1 text-xs">
                      {/* Row 1: Title & Company */}
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

                      {/* Row 2: Location & Job Type */}
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
                            placeholder="e.g. Internship, Full time"
                            value={editableListing.employment_type || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, employment_type: e.target.value || null })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                      </div>

                      {/* Row 3: Salary & Deadline */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Salary / Stipend</label>
                          <input
                            type="text"
                            placeholder="e.g. $118,000 - $157,000 (USD)"
                            value={editableListing.stipend_or_salary || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, stipend_or_salary: e.target.value || null })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Application Deadline</label>
                          <input
                            type="text"
                            placeholder="e.g. 2027-02-26 or Feb 26, 2027"
                            value={editableListing.deadline || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, deadline: e.target.value || null })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                      </div>

                      {/* Row 4: Experience Level & Eligibility */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Experience Level</label>
                          <input
                            type="text"
                            placeholder="e.g. PhD Intern, Intern, Entry Level"
                            value={editableListing.experience_level || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, experience_level: e.target.value || null })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Eligibility / Degree</label>
                          <input
                            type="text"
                            placeholder="e.g. Pursuing PhD in Computer Science"
                            value={editableListing.eligibility || ""}
                            onChange={(e) => setEditableListing({ ...editableListing, eligibility: e.target.value || null })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                          />
                        </div>
                      </div>

                      {/* Application Link */}
                      <div>
                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Application Link *</label>
                        <input
                          type="url"
                          value={editableListing.apply_url || ""}
                          onChange={(e) => setEditableListing({ ...editableListing, apply_url: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none font-mono focus:bg-white focus:border-[#083327]"
                        />
                      </div>

                      {/* Skills Required */}
                      <div>
                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(editableListing.skills_required) ? editableListing.skills_required.join(", ") : ""}
                          onChange={(e) =>
                            setEditableListing({
                              ...editableListing,
                              skills_required: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="e.g. C++, Python, Java, Algorithms"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#083327]"
                        />
                      </div>

                      {/* Role Summary */}
                      <div>
                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Role Summary & Overview</label>
                        <textarea
                          rows={2}
                          value={editableListing.summary || ""}
                          onChange={(e) => setEditableListing({ ...editableListing, summary: e.target.value })}
                          placeholder="A concise 2-3 sentence overview of what this role entails..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none focus:bg-white focus:border-[#083327] resize-none"
                        />
                      </div>

                      {/* Key Responsibilities */}
                      <div>
                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Key Responsibilities (One per line)</label>
                        <textarea
                          rows={3}
                          value={Array.isArray(editableListing.responsibilities) ? editableListing.responsibilities.join("\n") : ""}
                          onChange={(e) =>
                            setEditableListing({
                              ...editableListing,
                              responsibilities: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="Develop scripts to automate tasks...&#10;Collaborate with cross-functional teams..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none focus:bg-white focus:border-[#083327] resize-none font-mono"
                        />
                      </div>

                      {/* Qualifications */}
                      <div>
                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Qualifications (One per line)</label>
                        <textarea
                          rows={3}
                          value={Array.isArray(editableListing.qualifications) ? editableListing.qualifications.join("\n") : ""}
                          onChange={(e) =>
                            setEditableListing({
                              ...editableListing,
                              qualifications: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="Minimum: Pursuing PhD in Computer Science...&#10;Preferred: Experience in Distributed Systems..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none focus:bg-white focus:border-[#083327] resize-none font-mono"
                        />
                      </div>

                      {/* Benefits */}
                      <div>
                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Benefits & Perks (One per line)</label>
                        <textarea
                          rows={2}
                          value={Array.isArray(editableListing.benefits) ? editableListing.benefits.join("\n") : ""}
                          onChange={(e) =>
                            setEditableListing({
                              ...editableListing,
                              benefits: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="Health, dental, vision insurance...&#10;5 discretionary sick days..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none focus:bg-white focus:border-[#083327] resize-none font-mono"
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

          {/* ======================================================== */}
          {/* TAB 7: NEWSLETTER BROADCASTS */}
          {/* ======================================================== */}
          {activeNav === "newsletter" && (
            <NewsletterBroadcastView />
          )}

          {/* ======================================================== */}
          {/* TAB 8: ADMIN AI AGENT (FULL PLATFORM & DB CONTROL) */}
          {/* ======================================================== */}
          {activeNav === "ai_agent" && (
            <AdminAiAgentView />
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCompany ? "Edit Company Feed" : "Add Company ATS Feed"}
              </h3>
              <button
                onClick={() => setShowCompanyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Auto-Detect Box */}
            {!editingCompany && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[0.7rem] font-bold text-[#083327] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Smart ATS & Slug Auto-Detector
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={autoDetectInput}
                    onChange={(e) => setAutoDetectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAutoDetectCompany();
                      }
                    }}
                    placeholder="Enter website, career URL, or company name (e.g. OpenAI, linear.app)..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#083327]"
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetectCompany}
                    disabled={isAutoDetecting || !autoDetectInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isAutoDetecting ? "Detecting..." : "Auto-Detect"}
                  </button>
                </div>
                {autoDetectMessage && (
                  <div className={`text-[0.7rem] font-medium ${autoDetectMessage.startsWith("✅") ? "text-emerald-700" : "text-amber-700"}`}>
                    {autoDetectMessage}
                  </div>
                )}
              </div>
            )}

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
                  <div className="relative">
                    <select
                      value={companyForm.ats_type}
                      onChange={(e) => setCompanyForm({ ...companyForm, ats_type: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white hover:bg-slate-50 pl-3 pr-8 py-2 outline-none text-slate-800 font-medium transition focus:border-slate-800 cursor-pointer shadow-2xs"
                    >
                      <option value="GREENHOUSE">Greenhouse</option>
                      <option value="LEVER">Lever</option>
                      <option value="ASHBY">Ashby</option>
                      <option value="SMARTRECRUITERS">SmartRecruiters</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
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
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white px-5 py-2 font-bold shadow-xs cursor-pointer"
                >
                  Save Company Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BULK ATS DISCOVERY MODAL */}
      {/* ======================================================== */}
      {showDiscoveryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#083327] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Auto-Discover Verified Tech Feeds
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct API handshake tests Greenhouse, Ashby, and Lever feeds with live active jobs.
                </p>
              </div>
              <button
                onClick={() => setShowDiscoveryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-3 text-xs">
              {isDiscovering ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#083327]" />
                  <p className="font-bold">Testing live ATS endpoints & verifying active jobs...</p>
                </div>
              ) : discoveredFeeds.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  No new feeds discovered. All top tech companies may already be in your database.
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-600 font-bold">
                    <span>Select Feeds to Import ({selectedDiscoveredSlugs.length} selected)</span>
                    <button
                      onClick={() => {
                        if (selectedDiscoveredSlugs.length === discoveredFeeds.filter((c) => !c.isAlreadyAdded).length) {
                          setSelectedDiscoveredSlugs([]);
                        } else {
                          setSelectedDiscoveredSlugs(discoveredFeeds.filter((c) => !c.isAlreadyAdded).map((c) => c.ats_identifier));
                        }
                      }}
                      className="text-xs text-[#083327] hover:underline cursor-pointer"
                    >
                      {selectedDiscoveredSlugs.length > 0 ? "Deselect All" : "Select All Available"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {discoveredFeeds.map((feed) => {
                      const isSelected = selectedDiscoveredSlugs.includes(feed.ats_identifier);
                      return (
                        <div
                          key={feed.ats_identifier}
                          onClick={() => {
                            if (feed.isAlreadyAdded) return;
                            if (isSelected) {
                              setSelectedDiscoveredSlugs(selectedDiscoveredSlugs.filter((s) => s !== feed.ats_identifier));
                            } else {
                              setSelectedDiscoveredSlugs([...selectedDiscoveredSlugs, feed.ats_identifier]);
                            }
                          }}
                          className={`p-3 rounded-xl border transition flex items-start justify-between cursor-pointer ${
                            feed.isAlreadyAdded
                              ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                              : isSelected
                              ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-1 overflow-hidden pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 truncate">{feed.name}</span>
                              <span className="px-1.5 py-0.5 rounded text-[0.65rem] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {feed.ats_type}
                              </span>
                            </div>
                            <div className="text-[0.68rem] text-slate-500 font-mono truncate">
                              slug: {feed.ats_identifier}
                            </div>
                            <div className="text-[0.7rem] font-bold text-emerald-700">
                              🟢 {feed.activeJobsCount} live active jobs
                            </div>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            {feed.isAlreadyAdded ? (
                              <span className="text-[0.65rem] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                Added
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-[#083327] accent-[#083327]"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                Imported companies will immediately be available for scraping.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscoveryModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleImportSelectedFeeds}
                  disabled={isImportingDiscovered || selectedDiscoveredSlugs.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#083327] hover:bg-[#0c4333] text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isImportingDiscovered
                    ? "Importing..."
                    : `Import (${selectedDiscoveredSlugs.length}) Feeds`}
                </button>
              </div>
            </div>
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
                  <div className="relative">
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white hover:bg-slate-50 pl-3 pr-8 py-2 outline-none text-slate-800 font-medium transition focus:border-slate-800 cursor-pointer shadow-2xs"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
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
