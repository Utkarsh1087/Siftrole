"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress on route change
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Intercept link clicks for instant visual feedback
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      // Check if it's an internal route navigation
      if (
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("//") &&
        !target.getAttribute("target") &&
        !target.getAttribute("download")
      ) {
        try {
          const targetUrl = new URL(href, window.location.origin);
          if (targetUrl.pathname !== window.location.pathname) {
            setLoading(true);
            setProgress(30);
            setTimeout(() => setProgress((p) => (p > 0 && p < 100 ? 75 : p)), 120);
          }
        } catch {
          // Fallback ignore if invalid URL
        }
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#84d64f] via-[#9fe86d] to-[#4fa320] shadow-[0_0_12px_rgba(132,214,79,0.75)]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? "width 200ms ease-out, opacity 250ms ease 100ms" : "width 400ms cubic-bezier(0.1, 0.9, 0.2, 1)",
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
