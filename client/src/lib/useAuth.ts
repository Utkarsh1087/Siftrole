"use client";

import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  grad_year?: string;
  degree?: string;
  resume_url?: string;
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

  const logout = () => {
    localStorage.removeItem("siftrole_token");
    localStorage.removeItem("siftrole_user");
    window.dispatchEvent(new Event("siftrole-auth-change"));
    setIsLoggedIn(false);
    setUser(null);
  };

  return { isLoggedIn, user, isLoaded, logout };
}
