"use client";

import { useState, useEffect } from "react";

const APPLIED_STORAGE_KEY = "siftrole_applied_job_ids";
const SAVED_STORAGE_KEY = "siftrole_saved_job_ids";
const TRACKED_APPS_STORAGE_KEY = "siftrole_tracked_applications";

export interface SimpleListingMeta {
  id: string;
  title: string;
  company: string;
  location?: string;
  stipend_or_salary?: string | null;
  apply_url: string;
}

export function getAppliedJobIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(APPLIED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function getSavedJobIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function syncTrackedApplication(
  job: SimpleListingMeta,
  status: "applied" | "saved" | "removed"
) {
  if (typeof window === "undefined" || !job?.id) return;
  try {
    const raw = localStorage.getItem(TRACKED_APPS_STORAGE_KEY);
    let apps: any[] = [];
    if (raw) {
      try {
        apps = JSON.parse(raw);
        if (!Array.isArray(apps)) apps = [];
      } catch {
        apps = [];
      }
    }

    const existingIndex = apps.findIndex((a) => a.listing_id === job.id || a.id === job.id);

    if (status === "removed") {
      if (existingIndex >= 0) {
        apps.splice(existingIndex, 1);
      }
    } else {
      const entry = {
        id: existingIndex >= 0 ? apps[existingIndex].id : `app-${Date.now()}`,
        listing_id: job.id,
        company: job.company || "Company",
        title: job.title || "Software Engineer",
        location: job.location || "Remote",
        stipend_or_salary: job.stipend_or_salary || "Competitive",
        apply_url: job.apply_url || "",
        status: status,
        applied_date: status === "applied" ? "Just now" : "Saved today",
        notes: status === "applied" ? "Applied directly via Siftrole verified feed." : "Saved for review.",
        next_step: status === "applied" ? "Awaiting recruiter review" : "Submit official application",
      };

      if (existingIndex >= 0) {
        apps[existingIndex] = { ...apps[existingIndex], ...entry, status };
      } else {
        apps.unshift(entry);
      }
    }

    localStorage.setItem(TRACKED_APPS_STORAGE_KEY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent("siftrole-tracker-change"));
  } catch (e) {
    console.error("Failed to sync tracked application", e);
  }
}

export function toggleAppliedJob(job: SimpleListingMeta | string): boolean {
  if (typeof window === "undefined") return false;
  const jobId = typeof job === "string" ? job : job.id;
  if (!jobId) return false;

  try {
    const current = getAppliedJobIds();
    let isNowApplied = false;
    if (current.has(jobId)) {
      current.delete(jobId);
      isNowApplied = false;
      if (typeof job !== "string") {
        syncTrackedApplication(job, "removed");
      }
    } else {
      current.add(jobId);
      isNowApplied = true;
      if (typeof job !== "string") {
        syncTrackedApplication(job, "applied");
      }
    }
    localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(Array.from(current)));
    window.dispatchEvent(new CustomEvent("siftrole-applied-change", { detail: { jobId, isNowApplied } }));
    return isNowApplied;
  } catch {
    return false;
  }
}

export function toggleSavedJob(job: SimpleListingMeta | string): boolean {
  if (typeof window === "undefined") return false;
  const jobId = typeof job === "string" ? job : job.id;
  if (!jobId) return false;

  try {
    const current = getSavedJobIds();
    let isNowSaved = false;
    if (current.has(jobId)) {
      current.delete(jobId);
      isNowSaved = false;
      if (typeof job !== "string") {
        syncTrackedApplication(job, "removed");
      }
    } else {
      current.add(jobId);
      isNowSaved = true;
      if (typeof job !== "string") {
        syncTrackedApplication(job, "saved");
      }
    }
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(Array.from(current)));
    window.dispatchEvent(new CustomEvent("siftrole-saved-change", { detail: { jobId, isNowSaved } }));
    return isNowSaved;
  } catch {
    return false;
  }
}

export function markJobAsApplied(job: SimpleListingMeta | string): void {
  if (typeof window === "undefined") return;
  const jobId = typeof job === "string" ? job : job.id;
  if (!jobId) return;

  try {
    const current = getAppliedJobIds();
    if (!current.has(jobId)) {
      current.add(jobId);
      localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(Array.from(current)));
      if (typeof job !== "string") {
        syncTrackedApplication(job, "applied");
      }
      window.dispatchEvent(new CustomEvent("siftrole-applied-change", { detail: { jobId, isNowApplied: true } }));
    }
  } catch {}
}

export function useAppliedJobs() {
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAppliedJobIds(getAppliedJobIds());
    setSavedJobIds(getSavedJobIds());

    const handleAppliedChange = () => setAppliedJobIds(getAppliedJobIds());
    const handleSavedChange = () => setSavedJobIds(getSavedJobIds());
    const handleStorage = () => {
      setAppliedJobIds(getAppliedJobIds());
      setSavedJobIds(getSavedJobIds());
    };

    window.addEventListener("siftrole-applied-change", handleAppliedChange);
    window.addEventListener("siftrole-saved-change", handleSavedChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("siftrole-applied-change", handleAppliedChange);
      window.removeEventListener("siftrole-saved-change", handleSavedChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleApplied = (job: SimpleListingMeta | string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleAppliedJob(job);
  };

  const toggleSaved = (job: SimpleListingMeta | string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleSavedJob(job);
  };

  const isApplied = (jobId: string) => appliedJobIds.has(jobId);
  const isSaved = (jobId: string) => savedJobIds.has(jobId);

  return { appliedJobIds, savedJobIds, toggleApplied, toggleSaved, isApplied, isSaved };
}
