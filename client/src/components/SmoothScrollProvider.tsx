"use client";

import React, { useEffect } from "react";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenisInstance: any = null;
    let rafId: number;

    const scrollToHash = (hash: string) => {
      if (!hash) return;
      const targetId = hash.replace("#", "");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, { offset: -90, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      if (href === "#faq" || href.endsWith("/#faq") || href.endsWith("#faq")) {
        const currentPath = window.location.pathname;
        if (currentPath === "/" || href === "#faq") {
          e.preventDefault();
          scrollToHash("#faq");
          window.history.pushState(null, "", "#faq");
        }
      } else if (href.startsWith("#")) {
        e.preventDefault();
        scrollToHash(href);
        window.history.pushState(null, "", href);
      }
    };

    const initLenis = async () => {
      try {
        const Lenis = (await import("lenis")).default;
        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.5,
          infinite: false,
        });

        function raf(time: number) {
          lenisInstance.raf(time);
          rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        // Check if user landed directly with hash (e.g. /#faq)
        if (window.location.hash) {
          setTimeout(() => scrollToHash(window.location.hash), 400);
        }
      } catch (e) {
        console.warn("Lenis smooth scroll fallback to native smooth scroll", e);
      }
    };

    initLenis();
    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  return <>{children}</>;
}
