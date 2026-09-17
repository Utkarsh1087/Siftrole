"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "siftrole_applied_job_ids";

export function getAppliedJobIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (e) {
    return new Set();
  }
}

export function toggleAppliedJobId(jobId: string): boolean {
  if (typeof window === "undefined" || !jobId) return false;
  try {
    const current = getAppliedJobIds();
    let isNowApplied = false;
    if (current.has(jobId)) {
      current.delete(jobId);
      isNowApplied = false;
    } else {
      current.add(jobId);
      isNowApplied = true;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
    window.dispatchEvent(new CustomEvent("siftrole-applied-change", { detail: { jobId, isNowApplied } }));
    return isNowApplied;
  } catch (e) {
    return false;
  }
}

export function markJobAsApplied(jobId: string): void {
  if (typeof window === "undefined" || !jobId) return;
  try {
    const current = getAppliedJobIds();
    if (!current.has(jobId)) {
      current.add(jobId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
      window.dispatchEvent(new CustomEvent("siftrole-applied-change", { detail: { jobId, isNowApplied: true } }));
    }
  } catch (e) {}
}

export function useAppliedJobs() {
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAppliedJobIds(getAppliedJobIds());

    const handleChange = () => {
      setAppliedJobIds(getAppliedJobIds());
    };

    window.addEventListener("siftrole-applied-change", handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener("siftrole-applied-change", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const toggleApplied = (jobId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleAppliedJobId(jobId);
  };

  const isApplied = (jobId: string) => appliedJobIds.has(jobId);

  return { appliedJobIds, toggleApplied, isApplied };
}
