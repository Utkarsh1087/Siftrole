"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

interface FisheyeWordmarkProps {
  text?: string;
  className?: string;
}

export function FisheyeWordmark({
  text = "siftrole",
  className = "",
}: FisheyeWordmarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState(110); // radius in px

  // Responsive lens size based on viewport
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) setLensSize(75);
      else if (width < 1024) setLensSize(95);
      else setLensSize(125);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Smooth lerp loop for the fisheye lens
  useEffect(() => {
    if (!isHovered) return;
    let animationFrameId: number;

    const lerp = () => {
      setMousePos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.22,
        y: prev.y + (targetPos.y - prev.y) * 0.22,
      }));
      animationFrameId = requestAnimationFrame(lerp);
    };

    animationFrameId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, targetPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTargetPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const initial = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setTargetPos(initial);
    setMousePos(initial);
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor-hide="true"
      className={`relative select-none cursor-none inline-block w-full text-center ${className}`}
    >
      {/* 1. Base Layer (Normal Wordmark) */}
      <h1 className="s__code text-[#14281a] inline-block transition-opacity duration-200">
        {text}
      </h1>

      {/* 2. Zoomed Fisheye Magnification Layer (Clipped to circle) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none transition-opacity duration-200 will-change-transform"
        style={{
          opacity: isHovered ? 1 : 0,
          clipPath: isHovered
            ? `circle(${lensSize}px at ${mousePos.x}px ${mousePos.y}px)`
            : "circle(0px at 0px 0px)",
          WebkitClipPath: isHovered
            ? `circle(${lensSize}px at ${mousePos.x}px ${mousePos.y}px)`
            : "circle(0px at 0px 0px)",
        }}
      >
        <div
          className="w-full text-center"
          style={{
            transformOrigin: `${mousePos.x}px ${mousePos.y}px`,
            transform: "scale(1.48)",
          }}
        >
          <h1 className="s__code text-[#14281a] font-bold inline-block drop-shadow-[0_4px_16px_rgba(132,214,79,0.4)]">
            {text}
          </h1>
        </div>
      </div>

      {/* 3. Transparent Glass Fisheye Lens Ring */}
      {isHovered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full border-2 border-[#84d64f]/80 bg-[#84d64f]/10 backdrop-blur-[0.5px] shadow-[inset_0_0_30px_rgba(132,214,79,0.25),0_12px_40px_rgba(20,40,26,0.18)] will-change-transform transition-transform duration-75"
          style={{
            width: `${lensSize * 2}px`,
            height: `${lensSize * 2}px`,
            left: `${mousePos.x - lensSize}px`,
            top: `${mousePos.y - lensSize}px`,
          }}
        >
          {/* Subtle Glass Reflection Curve Accent */}
          <div className="absolute top-2 left-4 w-1/3 h-1/4 rounded-full bg-white/20 blur-[1px] transform -rotate-12" />
        </div>
      )}
    </div>
  );
}
