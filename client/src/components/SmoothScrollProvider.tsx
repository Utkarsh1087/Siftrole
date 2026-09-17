"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<any>(null);

  // Reset scroll smoothly on route transitions when no hash is targeted
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  useEffect(() => {
    let rafId: number;

    const scrollToHash = (hash: string) => {
      if (!hash) return;
      const targetId = hash.replace("#", "");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(targetEl, { offset: -90, duration: 1.2 });
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
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.5,
          infinite: false,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
          lenis.raf(time);
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
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return <>{children}</>;
}
