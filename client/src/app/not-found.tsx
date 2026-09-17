"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, normX: 0, normY: 0 });
  const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      
      const normX = (clientX / width - 0.5) * 2; // -1 to 1
      const normY = (clientY / height - 0.5) * 2; // -1 to 1

      setMousePos({ x: clientX, y: clientY, normX, normY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Smooth lerp / interpolation loop for buttery physics
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setSmoothMouse((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.12,
        y: prev.y + (mousePos.y - prev.y) * 0.12,
      }));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [mousePos.x, mousePos.y]);

  // Calculate dynamic 3D text shadow offset based on cursor position
  const shadowX = -mousePos.normX * 18;
  const shadowY = -mousePos.normY * 18;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#f8f7f5] text-[#121816] font-sans antialiased selection:bg-[#84d64f]/30 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none"
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(650px circle at ${smoothMouse.x}px ${smoothMouse.y}px, rgba(132, 214, 79, 0.16), transparent 70%)`,
        }}
      />

      {/* Floating Background Accent Elements that react with inverted parallax */}
      <div
        className="fixed top-1/4 left-1/6 w-64 h-64 rounded-full bg-[#84d64f]/10 blur-3xl pointer-events-none z-0"
        style={{
          transform: `translate3d(${-mousePos.normX * 35}px, ${-mousePos.normY * 35}px, 0)`,
          transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      />
      <div
        className="fixed bottom-1/4 right-1/6 w-80 h-80 rounded-full bg-[#84d64f]/8 blur-3xl pointer-events-none z-0"
        style={{
          transform: `translate3d(${mousePos.normX * 45}px, ${mousePos.normY * 45}px, 0)`,
          transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      />

      {/* Top Status Bar */}
      <div className="relative z-10 w-full max-w-3xl mx-auto flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#55615b]">
        <span className="inline-flex items-center gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#84d64f] animate-ping" />
          HTTP 404
        </span>
        <span className="font-semibold text-[#14281a]/60 font-mono">
          X: {Math.round(mousePos.x)} | Y: {Math.round(mousePos.y)}
        </span>
      </div>

      {/* Main Center Content with 3D Parallax Movement */}
      <main
        className="relative z-10 w-full max-w-3xl mx-auto text-center py-12"
        style={{
          transform: `perspective(1000px) rotateX(${-mousePos.normY * 6}deg) rotateY(${mousePos.normX * 6}deg)`,
          transition: "transform 0.15s cubic-bezier(0.1, 0.9, 0.2, 1)",
        }}
      >
        {/* Giant Bold 404 with Dynamic Cursor-Reactive Text Shadow */}
        <div
          className="font-heading s__code font-black text-[#14281a] tracking-tight leading-none mb-2 transition-all duration-75"
          style={{
            textShadow: `${shadowX}px ${shadowY}px 30px rgba(20, 40, 26, 0.18), ${shadowX * 0.5}px ${shadowY * 0.5}px 10px rgba(132, 214, 79, 0.35)`,
            transform: `translate3d(${mousePos.normX * 12}px, ${mousePos.normY * 12}px, 20px)`,
          }}
        >
          404
        </div>

        {/* Bold Punchy Headline */}
        <h1
          className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14281a] leading-[1.1] mb-5"
          style={{
            transform: `translate3d(${mousePos.normX * 6}px, ${mousePos.normY * 6}px, 10px)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          This page does not exist.
        </h1>

        {/* Sarcastic Copy in Easy English */}
        <p
          className="text-base sm:text-xl font-medium text-[#55615b] max-w-xl mx-auto leading-relaxed mb-10"
          style={{
            transform: `translate3d(${mousePos.normX * 3}px, ${mousePos.normY * 3}px, 5px)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          Don&apos;t waste your time here like you do finding different apply links on different career pages.
        </p>

        {/* High-Contrast Bold Platform Button with Magnetic Hover Accent */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-[#14281a] hover:bg-[#1a3422] text-[#84d64f] hover:text-[#95e660] px-8 py-4 text-sm font-heading font-bold tracking-tight transition-all active:scale-[0.98] shadow-lg shadow-[#14281a]/15 cursor-pointer"
            style={{
              transform: `translate3d(${mousePos.normX * 8}px, ${mousePos.normY * 8}px, 15px)`,
              transition: "transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.2s",
            }}
          >
            <MoveLeft className="w-4 h-4 text-[#84d64f] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="relative z-10 w-full max-w-3xl mx-auto text-center text-xs font-mono text-[#79857f] pt-6 border-t border-[#e5e2db]">
        <span>404 // DEAD END</span>
      </footer>
    </div>
  );
}
