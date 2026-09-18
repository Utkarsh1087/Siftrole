"use client";

import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  grad_year?: string | number;
  degree?: string;
  target_role?: string;
  bio?: string;
  skills?: string[];
  github_url?: string;
  linkedin_url?: string;
  phone?: string;
  portfolio_url?: string;
  resume_name?: string;
  resume_url?: string;
  work_mode?: string;
  salary_expectation?: string;
  profile_status?: string;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("siftrole_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("siftrole_token");
  return Boolean(token);
}

export function saveStoredUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("siftrole_user", JSON.stringify(user));
  window.dispatchEvent(new Event("siftrole-auth-change"));
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("siftrole_token");
      const stored = getStoredUser();
      setIsLoggedIn(Boolean(token));
      setUser(stored);
      setIsLoaded(true);
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("siftrole-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("siftrole-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const updateUser = (data: Partial<AuthUser>) => {
    const current = user || getStoredUser() || {
      id: "user-student",
      name: data.name || "Candidate",
      email: data.email || "candidate@university.edu",
      role: "student",
    };
    const updated = { ...current, ...data };
    saveStoredUser(updated);
    setUser(updated);
    return updated;
  };

  const logout = () => {
    localStorage.removeItem("siftrole_token");
    localStorage.removeItem("siftrole_user");
    window.dispatchEvent(new Event("siftrole-auth-change"));
    setIsLoggedIn(false);
    setUser(null);
  };

  return { isLoggedIn, user, isLoaded, updateUser, logout };
}
