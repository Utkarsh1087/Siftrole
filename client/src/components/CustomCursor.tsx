"use client";

import React, { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [inFooterZone, setInFooterZone] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isCursorHidden, setIsCursorHidden] = useState(false);
  const [cursorText, setCursorText] = useState<string | null>(null);

  // Smooth coordinates references
  const mousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const ringRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if cursor is in footer zone or pre-footer card
      const footerElement = target.closest("footer, [data-footer-zone], #footer-zone, .footer-zone");
      const isInsideFooter = Boolean(footerElement);

      if (isInsideFooter) {
        setInFooterZone(true);

        // Check if inside fisheye lens element
        const hideTarget = target.closest("[data-cursor-hide='true']");
        if (hideTarget) {
          setIsCursorHidden(true);
          return;
        } else {
          setIsCursorHidden(false);
        }

        // Check for general interactive elements in footer
        const interactive = target.closest("a, button, input, textarea, [role='button'], [data-cursor]");
        if (interactive) {
          setIsHovered(true);
          const customText = interactive.getAttribute("data-cursor-text");
          setCursorText(customText || null);
        } else {
          setIsHovered(false);
          setCursorText(null);
        }
      } else {
        setInFooterZone(false);
        setIsCursorHidden(false);
        setIsHovered(false);
        setCursorText(null);
      }
    };

    const onMouseDown = () => {
      if (inFooterZone) setIsClicking(true);
    };

    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => {
      setInFooterZone(false);
      setIsCursorHidden(false);
    };

    // Smooth Lerp Loop
    const animate = () => {
      const ease = 0.2;
      followerPos.current.x += (mousePos.current.x - followerPos.current.x) * ease;
      followerPos.current.y += (mousePos.current.y - followerPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [inFooterZone, isCursorHidden]);

  if (!mounted) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-99999 overflow-hidden transition-opacity duration-300 ${
        inFooterZone && !isCursorHidden ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Outer Follower Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full pointer-events-none transition-all duration-300 ease-out will-change-transform mix-blend-difference bg-white ${
          !inFooterZone || isCursorHidden ? "scale-0 opacity-0" : "opacity-100"
        } ${
          isHovered
            ? "h-14 w-14 -ml-7 -mt-7 scale-110"
            : "h-8 w-8 -ml-4 -mt-4 scale-100"
        } ${isClicking ? "scale-90" : ""}`}
      >
        {cursorText && (
          <span className="text-[10px] font-black uppercase tracking-wider text-black select-none">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
