"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Check,
  RefreshCw,
  ExternalLink,
  Eye,
} from "lucide-react";

interface Listing {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type?: string;
  stipend_or_salary?: string;
  skills_required?: string[];
  apply_url?: string;
  status: string;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  is_verified: number;
  created_at: string;
}

export function NewsletterBroadcastView() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [listingSearch, setListingSearch] = useState("");
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Email Customization Form
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("We found new verified openings: do not miss these opportunities");
  const [customNote, setCustomNote] = useState("");
  const [testEmail, setTestEmail] = useState("utkarsh.rajput.2005@gmail.com");

  // Send States
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);

  useEffect(() => {
    fetchSubscribers();
    fetchListings();
  }, []);

  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const res = await fetch("/api/newsletter");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setSubscribersCount(data.count || (data.subscribers || []).length);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const fetchListings = async () => {
    setIsLoadingListings(true);
    try {
      const res = await fetch("/api/listings?status=active");
      if (res.ok) {
        const data = await res.json();
        const activeListings = data.listings || [];
        setListings(activeListings);
        // Pre-select top 4 newest listings
        if (activeListings.length > 0) {
          const topIds = activeListings.slice(0, 4).map((l: any) => l.id);
          setSelectedListingIds(topIds);
          setSubject(`New verified openings: ${activeListings[0]?.company || "Top Tech"} and ${activeListings.length > 1 ? activeListings.length - 1 + " more roles" : "new roles"} hiring now`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const handleToggleListing = (id: string) => {
    setSelectedListingIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (updated.length > 0) {
        const firstSelected = listings.find((l) => l.id === updated[0]);
        if (firstSelected) {
          setSubject(`New verified openings: ${firstSelected.company} and ${updated.length > 1 ? updated.length - 1 + " more roles" : "new role"} hiring now`);
        }
      }
      return updated;
    });
  };

  const handleSelectTop5 = () => {
    const topIds = listings.slice(0, 5).map((l) => l.id);
    setSelectedListingIds(topIds);
    if (listings.length > 0) {
      setSubject(`New verified openings: ${listings[0].company} and ${topIds.length - 1} more roles hiring now`);
    }
  };

  const handleSelectAllInternships = () => {
    const internshipIds = listings
      .filter((l) => (l.employment_type || "").toLowerCase().includes("intern") || (l.title || "").toLowerCase().includes("intern"))
      .map((l) => l.id);
    if (internshipIds.length > 0) {
      setSelectedListingIds(internshipIds.slice(0, 6));
      setSubject(`Verified Internships: ${internshipIds.length} new early-career opportunities on Siftrole`);
    } else {
      handleSelectTop5();
    }
  };

  const selectedListings = listings.filter((l) => selectedListingIds.includes(l.id));

  // Send Test Email to Admin
  const handleSendTest = async () => {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      setStatusBanner({ type: "error", text: "Please enter a valid test email address." });
      return;
    }
    if (selectedListings.length === 0) {
      setStatusBanner({ type: "error", text: "Please select at least 1 job opening to broadcast." });
      return;
    }

    setIsSendingTest(true);
    setStatusBanner(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEmail: testEmail.trim(),
          listingIds: selectedListingIds,
          subject: subject || "We found new verified openings: do not miss these opportunities",
          headline,
          customNote: customNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test email");

      setStatusBanner({
        type: "success",
        text: `Test email successfully delivered to ${testEmail}! Check your inbox.`,
      });
    } catch (err: any) {
      setStatusBanner({ type: "error", text: `Test send failed: ${err.message}` });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Broadcast Live to All Verified Subscribers
  const handleBroadcastLive = async () => {
    if (subscribersCount === 0) {
      setStatusBanner({ type: "error", text: "No active verified subscribers found to receive broadcast." });
      return;
    }
    if (selectedListings.length === 0) {
      setStatusBanner({ type: "error", text: "Please select at least 1 job opening to include in the email." });
      return;
    }

    const confirmMsg = `Broadcast this job alert digest to ALL ${subscribersCount} active verified subscriber(s)?`;
    if (!confirm(confirmMsg)) return;

    setIsBroadcasting(true);
    setStatusBanner(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingIds: selectedListingIds,
          subject: subject || "We found new verified openings: do not miss these opportunities",
          headline,
          customNote: customNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Broadcast failed");

      setStatusBanner({
        type: "success",
        text: data.message || `Job alert digest dispatched to ${subscribersCount} subscriber(s).`,
      });
      fetchSubscribers();
    } catch (err: any) {
      setStatusBanner({ type: "error", text: `Broadcast failed: ${err.message}` });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const filteredListings = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.company.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.location.toLowerCase().includes(listingSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Subscribers</div>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              {isLoadingSubscribers ? (
                <div className="h-6 w-12 bg-slate-100 animate-pulse rounded" />
              ) : (
                subscribersCount
              )}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSubscribersModal(true)}
            className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="View Subscribers List"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Provider</div>
          <div className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-bold">Resend API (Live)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">High inbox placement · Verified sender</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Job Pool</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {listings.length} <span className="text-xs font-medium text-slate-500 font-normal">roles live</span>
          </div>
        </div>

        <div className="bg-[#14281a] text-white p-5 rounded-2xl border border-[#84d64f]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#84d64f] uppercase tracking-wider">Selected for Digest</div>
            <span className="text-xs font-extrabold bg-[#84d64f] text-[#14281a] px-2 py-0.5 rounded-full">
              {selectedListingIds.length} Roles
            </span>
          </div>
          <div className="text-xs text-slate-300 mt-2">
            {selectedListingIds.length > 0 ? "Ready to compose & dispatch" : "Pick openings from table below"}
          </div>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusBanner && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold transition ${
            statusBanner.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusBanner.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Job Selector & Email Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Job Selector & Composer Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Email Composer Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#3c7818]" />
                <h3 className="text-base font-bold text-slate-900">Email Digest Composer</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Clean Minimal Layout</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. We found new verified openings: do not miss these opportunities"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#3c7818] focus:ring-1 focus:ring-[#3c7818] outline-none font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Digest Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. We found new verified openings: do not miss these opportunities"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#3c7818] focus:ring-1 focus:ring-[#3c7818] outline-none font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Custom Team Note <span className="text-slate-400 normal-case font-normal">(Optional intro paragraph)</span>
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. New high-priority roles matching our verified criteria were just published. Review the details below and apply directly:"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#3c7818] focus:ring-1 focus:ring-[#3c7818] outline-none text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Job Selection Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Job Openings to Include</h3>
                <p className="text-xs text-slate-500">Pick which verified roles to send in this email digest</p>
              </div>
              
              {/* Quick Select Presets */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectTop5}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Top 5 Newest
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllInternships}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#3c7818] transition cursor-pointer"
                >
                  Internships
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedListingIds([])}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder="Search job title, company, or location..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#3c7818] outline-none"
              />
            </div>

            {/* Listings Checklist */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {isLoadingListings ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading active listings...</div>
              ) : filteredListings.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No matching job openings found</div>
              ) : (
                filteredListings.map((job) => {
                  const isSelected = selectedListingIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      onClick={() => handleToggleListing(job.id)}
                      className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#eef8e5] border-[#84d64f] shadow-xs"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 transition ${
                            isSelected ? "bg-[#3c7818] text-white" : "border border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                            <span>{job.title}</span>
                            <span className="text-[10px] font-extrabold text-[#3c7818] bg-white px-1.5 py-0.5 rounded border border-[#cce8be]">
                              {job.company}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {job.location} • {job.stipend_or_salary || "Competitive"} • {job.employment_type || "Full-time"}
                          </div>
                        </div>
                      </div>

                      <a
                        href={job.apply_url || `http://localhost:3000/jobs/${job.id}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-slate-700 p-1.5 shrink-0 ml-2"
                        title="View apply page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons: Test Send & Live Broadcast */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Dispatch Controls</h4>

            {/* Test Send Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="w-full sm:flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest || isBroadcasting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Test...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Test Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Broadcast Primary Button */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Will be delivered to <strong className="text-slate-900">{subscribersCount}</strong> active verified subscriber(s).
              </div>
              <button
                type="button"
                onClick={handleBroadcastLive}
                disabled={isBroadcasting || isSendingTest || selectedListingIds.length === 0}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#14281a] hover:bg-[#1f3d27] text-[#84d64f] font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#84d64f]" />
                    <span>Dispatching Broadcast...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#84d64f]" />
                    <span>Broadcast to All Subscribers</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Live Side-by-Side Visual Email Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Email Preview</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {selectedListings.length} Roles Included
              </span>
            </div>

            {/* Rendered Email Frame */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 overflow-hidden">
              <div
                className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs max-w-full text-slate-700 text-left space-y-4 text-xs"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
              >
                
                {/* Header Logo */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="font-semibold text-base text-slate-900 tracking-tight">
                    Sift<span className="text-emerald-600">role</span>
                    <span className="text-[9px] font-medium tracking-wider text-slate-400 border-l border-slate-200 pl-2 ml-2">
                      Job Radar
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Today</span>
                </div>

                {/* Headline */}
                <div>
                  <h4 className="text-[13.5px] font-semibold text-slate-900 leading-snug">
                    {headline || "We found new verified openings: do not miss these opportunities"}
                  </h4>
                  {customNote ? (
                    <div className="mt-2 p-3 rounded-lg bg-slate-50 border-l-2 border-emerald-600 text-[11px] text-slate-600 leading-relaxed font-normal">
                      {customNote}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1 font-normal leading-relaxed">
                      New high-priority roles matching our verified criteria were just published. Review the details below and apply directly:
                    </p>
                  )}
                </div>

                {/* Job Cards */}
                <div className="space-y-2.5 pt-1">
                  {selectedListings.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 border border-dashed rounded-lg font-normal">
                      Select job openings from the left checklist to preview them here.
                    </div>
                  ) : (
                    selectedListings.map((job) => (
                      <div key={job.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                        <div className="text-[10.5px] font-semibold text-emerald-600 tracking-wide">
                          {job.company}
                        </div>
                        <div className="text-[12.5px] font-medium text-slate-900">
                          {job.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {job.location} • <strong className="text-slate-800 font-medium">{job.stipend_or_salary || "Competitive"}</strong> • {job.employment_type || "Full-time"}
                        </div>
                        <div className="pt-0.5">
                          <span className="inline-block bg-slate-900 text-white text-[10px] font-medium px-3 py-1.5 rounded-md">
                            View Role & Apply &rarr;
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer CTA */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <span className="inline-block bg-emerald-600 text-white text-[11px] font-medium px-4 py-2 rounded-lg">
                    View All Open Opportunities on Siftrole &rarr;
                  </span>
                  <div className="text-[9px] text-slate-400 mt-3 font-normal">
                    You received this digest from Siftrole Job Alerts. · Unsubscribe
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Subscribers Modal Drawer */}
      {showSubscribersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3c7818]" />
                <h3 className="text-base font-bold text-slate-900">Active Verified Subscribers</h3>
              </div>
              <button
                onClick={() => setShowSubscribersModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Total active verified newsletter subscribers: <strong className="text-slate-900">{subscribers.length}</strong>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {subscribers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No subscribers registered yet.</div>
              ) : (
                subscribers.map((sub, i) => (
                  <div key={sub.id || i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="font-mono font-medium text-slate-800">{sub.email}</div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSubscribersModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
