"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse offset from screen center
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 24;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#141414] font-sans antialiased flex items-center justify-center p-6 sm:p-12 select-none">
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
        
        {/* Left: One-Eyed Green Monster Character */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 300 320"
            className="w-full h-full drop-shadow-xl overflow-visible"
          >
            <defs>
              {/* Radial gradient for 3D sphere depth */}
              <radialGradient id="monsterBody" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#a3e635" />
                <stop offset="45%" stopColor="#84cc16" />
                <stop offset="85%" stopColor="#65a30d" />
                <stop offset="100%" stopColor="#4d7c0f" />
              </radialGradient>
              
              {/* Radial gradient for Iris */}
              <radialGradient id="monsterIris" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="60%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#115e59" />
              </radialGradient>

              {/* Floor Shadow Gradient */}
              <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#000000" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Floor Soft Shadow */}
            <ellipse cx="150" cy="295" rx="90" ry="14" fill="url(#floorShadow)" />

            {/* Monster Left Leg */}
            <path
              d="M 115 220 C 110 245 105 265 95 285"
              stroke="#65a30d"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left Foot */}
            <path
              d="M 80 288 C 80 280 115 280 115 288 C 115 294 75 294 80 288 Z"
              fill="#4d7c0f"
            />
            <circle cx="84" cy="289" r="4.5" fill="#3f6212" />
            <circle cx="94" cy="289" r="4.5" fill="#3f6212" />
            <circle cx="104" cy="289" r="4.5" fill="#3f6212" />

            {/* Monster Right Leg */}
            <path
              d="M 185 220 C 190 245 195 265 205 285"
              stroke="#65a30d"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Foot */}
            <path
              d="M 185 288 C 185 280 220 280 220 288 C 220 294 180 294 185 288 Z"
              fill="#4d7c0f"
            />
            <circle cx="196" cy="289" r="4.5" fill="#3f6212" />
            <circle cx="206" cy="289" r="4.5" fill="#3f6212" />
            <circle cx="216" cy="289" r="4.5" fill="#3f6212" />

            {/* Monster Left Arm */}
            <path
              d="M 75 145 C 50 170 52 215 58 245"
              stroke="#65a30d"
              strokeWidth="13"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="58" cy="247" r="8" fill="#4d7c0f" />

            {/* Monster Right Arm */}
            <path
              d="M 225 145 C 250 170 248 215 242 245"
              stroke="#65a30d"
              strokeWidth="13"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="242" cy="247" r="8" fill="#4d7c0f" />

            {/* Cute Horns */}
            {/* Left Horn */}
            <path
              d="M 98 75 C 92 50 82 45 74 48 C 82 62 88 72 96 82 Z"
              fill="#d9f99d"
              stroke="#4d7c0f"
              strokeWidth="2"
            />
            {/* Right Horn */}
            <path
              d="M 202 75 C 208 50 218 45 226 48 C 218 62 212 72 204 82 Z"
              fill="#d9f99d"
              stroke="#4d7c0f"
              strokeWidth="2"
            />

            {/* Big Round Monster Body */}
            <circle
              cx="150"
              cy="150"
              r="85"
              fill="url(#monsterBody)"
            />

            {/* Eye Outer Whites */}
            <ellipse
              cx="150"
              cy="125"
              rx="42"
              ry="42"
              fill="#ffffff"
              stroke="#4d7c0f"
              strokeWidth="4"
            />

            {/* Interactive Eye Gaze (Iris + Pupil + Highlights) */}
            <g
              style={{
                transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                transition: "transform 0.08s ease-out",
              }}
            >
              {/* Iris */}
              <circle
                cx="150"
                cy="125"
                r="22"
                fill="url(#monsterIris)"
              />
              
              {/* Pupil */}
              <circle
                cx="150"
                cy="125"
                r="11"
                fill="#0f172a"
              />

              {/* Glossy Eye Reflections */}
              <circle
                cx="144"
                cy="118"
                r="4.5"
                fill="#ffffff"
              />
              <circle
                cx="156"
                cy="131"
                r="2"
                fill="#ffffff"
                opacity="0.8"
              />
            </g>

            {/* Upper Eyelid / Brow Expression */}
            <path
              d="M 112 104 Q 150 92 188 104"
              fill="none"
              stroke="#3f6212"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Surprised / Shocked Mouth */}
            <path
              d="M 132 185 Q 150 178 168 185 Q 168 206 150 208 Q 132 206 132 185 Z"
              fill="#1c1917"
              stroke="#3f6212"
              strokeWidth="2.5"
            />
            {/* Cute Monster Teeth */}
            <path
              d="M 142 184 L 145 189 L 148 184"
              fill="#ffffff"
            />
            <path
              d="M 152 184 L 155 189 L 158 184"
              fill="#ffffff"
            />

          </svg>
        </div>

        {/* Right: Bold Headline, Sarcastic Text, Pill Button */}
        <div className="flex-1 text-center md:text-left max-w-md">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#111827] leading-[1.08] mb-4">
            OOPS! PAGE<br />NOT FOUND.
          </h1>

          <p className="text-sm sm:text-base text-[#4b5563] font-normal leading-relaxed mb-8">
            You must have picked the wrong door because this page does not exist. Stop wasting your time here like you do hunting down dead apply links on broken career pages.
          </p>

          <div>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
            >
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
