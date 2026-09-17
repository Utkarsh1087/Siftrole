"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type AvatarType = "monster" | "bot" | "ghost";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeAvatar, setActiveAvatar] = useState<AvatarType>("monster");
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse offset from screen center
      const x = (e.clientX / window.innerWidth - 0.5) * 26;
      const y = (e.clientY / window.innerHeight - 0.5) * 26;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Random blink interval for extra life & responsiveness
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#141414] font-sans antialiased flex items-center justify-center p-6 sm:p-12 select-none">
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
        
        {/* Left: Responsive Interactive Avatar Container */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => {
              // Clicking avatar cycles through avatars playfully
              const next: Record<AvatarType, AvatarType> = {
                monster: "bot",
                bot: "ghost",
                ghost: "monster",
              };
              setActiveAvatar(next[activeAvatar]);
            }}
            title="Click to switch avatar!"
            className="relative w-64 h-64 sm:w-80 sm:h-80 shrink-0 flex items-center justify-center cursor-pointer group"
          >
            {/* AVATAR 1: One-Eyed Green Monster (Mike Wazowski style) */}
            {activeAvatar === "monster" && (
              <svg
                viewBox="0 0 300 320"
                className="w-full h-full drop-shadow-xl overflow-visible transition-transform duration-300 group-hover:scale-105"
              >
                <defs>
                  <radialGradient id="monsterBody" cx="38%" cy="32%" r="65%">
                    <stop offset="0%" stopColor="#a3e635" />
                    <stop offset="45%" stopColor="#84cc16" />
                    <stop offset="85%" stopColor="#65a30d" />
                    <stop offset="100%" stopColor="#4d7c0f" />
                  </radialGradient>
                  
                  <radialGradient id="monsterIris" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="60%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#115e59" />
                  </radialGradient>

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

                {/* Horns */}
                <path
                  d="M 98 75 C 92 50 82 45 74 48 C 82 62 88 72 96 82 Z"
                  fill="#d9f99d"
                  stroke="#4d7c0f"
                  strokeWidth="2"
                />
                <path
                  d="M 202 75 C 208 50 218 45 226 48 C 218 62 212 72 204 82 Z"
                  fill="#d9f99d"
                  stroke="#4d7c0f"
                  strokeWidth="2"
                />

                {/* Big Round Body */}
                <circle cx="150" cy="150" r="85" fill="url(#monsterBody)" />

                {/* Eye Whites */}
                <ellipse
                  cx="150"
                  cy="125"
                  rx="42"
                  ry={isBlinking ? 4 : 42}
                  fill="#ffffff"
                  stroke="#4d7c0f"
                  strokeWidth="4"
                  className="transition-all duration-100"
                />

                {/* Interactive Eye Gaze */}
                {!isBlinking && (
                  <g
                    style={{
                      transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                      transition: "transform 0.08s ease-out",
                    }}
                  >
                    <circle cx="150" cy="125" r="22" fill="url(#monsterIris)" />
                    <circle cx="150" cy="125" r="11" fill="#0f172a" />
                    <circle cx="144" cy="118" r="4.5" fill="#ffffff" />
                    <circle cx="156" cy="131" r="2" fill="#ffffff" opacity="0.8" />
                  </g>
                )}

                {/* Brow Expression */}
                <path
                  d="M 112 104 Q 150 92 188 104"
                  fill="none"
                  stroke="#3f6212"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Surprised Mouth */}
                <path
                  d="M 132 185 Q 150 178 168 185 Q 168 206 150 208 Q 132 206 132 185 Z"
                  fill="#1c1917"
                  stroke="#3f6212"
                  strokeWidth="2.5"
                />
                <path d="M 142 184 L 145 189 L 148 184" fill="#ffffff" />
                <path d="M 152 184 L 155 189 L 158 184" fill="#ffffff" />
              </svg>
            )}

            {/* AVATAR 2: The Lost 404 Bot */}
            {activeAvatar === "bot" && (
              <svg
                viewBox="0 0 300 320"
                className="w-full h-full drop-shadow-xl overflow-visible transition-transform duration-300 group-hover:scale-105"
              >
                <defs>
                  <radialGradient id="botHead" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#f1f5f9" />
                    <stop offset="60%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </radialGradient>
                  <radialGradient id="botScreen" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>
                  <radialGradient id="floorShadowBot" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Hovering Shadow */}
                <ellipse cx="150" cy="285" rx="70" ry="12" fill="url(#floorShadowBot)" />

                {/* Floating Antenna with blinking LED */}
                <line x1="150" y1="65" x2="150" y2="35" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
                <circle cx="150" cy="30" r="10" fill="#ef4444" className="animate-pulse" />
                <circle cx="150" cy="30" r="16" fill="#ef4444" opacity="0.3" className="animate-ping" />

                {/* Robot Head Body */}
                <rect x="70" y="65" width="160" height="140" rx="36" fill="url(#botHead)" stroke="#64748b" strokeWidth="4" />

                {/* Ear Bolts */}
                <rect x="52" y="110" width="18" height="50" rx="8" fill="#64748b" />
                <rect x="230" y="110" width="18" height="50" rx="8" fill="#64748b" />

                {/* Visor Screen */}
                <rect x="90" y="85" width="120" height="95" rx="20" fill="url(#botScreen)" stroke="#1e293b" strokeWidth="3" />

                {/* Floating Magnetic Hover Hands */}
                <g
                  style={{
                    transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
                    transition: "transform 0.1s ease-out",
                  }}
                >
                  <circle cx="45" cy="180" r="18" fill="url(#botHead)" stroke="#64748b" strokeWidth="3" />
                  <circle cx="255" cy="180" r="18" fill="url(#botHead)" stroke="#64748b" strokeWidth="3" />
                </g>

                {/* Digital Glowing LED Eyes on Visor */}
                {!isBlinking ? (
                  <g
                    style={{
                      transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
                      transition: "transform 0.08s ease-out",
                    }}
                  >
                    {/* Left Eye */}
                    <rect x="110" y="112" width="28" height="28" rx="8" fill="#38bdf8" />
                    <rect x="114" y="116" width="8" height="8" rx="2" fill="#ffffff" />
                    
                    {/* Right Eye (Confused question/wink style) */}
                    <rect x="162" y="112" width="28" height="28" rx="8" fill="#38bdf8" />
                    <rect x="166" y="116" width="8" height="8" rx="2" fill="#ffffff" />

                    {/* Cute Confused Mouth Display */}
                    <rect x="140" y="152" width="20" height="4" rx="2" fill="#38bdf8" />
                  </g>
                ) : (
                  <g>
                    <rect x="110" y="124" width="28" height="4" rx="2" fill="#38bdf8" />
                    <rect x="162" y="124" width="28" height="4" rx="2" fill="#38bdf8" />
                  </g>
                )}

                {/* Bottom Thruster Jet Glow */}
                <path d="M 125 205 L 175 205 L 150 235 Z" fill="#38bdf8" opacity="0.75" className="animate-pulse" />
              </svg>
            )}

            {/* AVATAR 3: The Lost Ghost Seeker */}
            {activeAvatar === "ghost" && (
              <svg
                viewBox="0 0 300 320"
                className="w-full h-full drop-shadow-xl overflow-visible transition-transform duration-300 group-hover:scale-105"
              >
                <defs>
                  <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <radialGradient id="floorShadowGhost" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Floating Shadow */}
                <ellipse cx="150" cy="290" rx="65" ry="12" fill="url(#floorShadowGhost)" />

                {/* Ghost Sheet Body with Wavy Skirt */}
                <path
                  d="M 80 150 C 80 80 220 80 220 150 C 220 220 230 260 210 265 C 190 270 180 250 165 265 C 150 280 135 255 120 265 C 105 275 95 255 80 265 C 70 255 80 210 80 150 Z"
                  fill="url(#ghostGrad)"
                  stroke="#cbd5e1"
                  strokeWidth="3.5"
                />

                {/* Rosy Cheeks */}
                <circle cx="110" cy="155" r="8" fill="#fda4af" opacity="0.6" />
                <circle cx="190" cy="155" r="8" fill="#fda4af" opacity="0.6" />

                {/* Expressive Ghost Eyes */}
                {!isBlinking ? (
                  <g
                    style={{
                      transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
                      transition: "transform 0.08s ease-out",
                    }}
                  >
                    {/* Left Eye */}
                    <ellipse cx="125" cy="140" rx="9" ry="13" fill="#1e293b" />
                    <circle cx="122" cy="135" r="3.5" fill="#ffffff" />

                    {/* Right Eye */}
                    <ellipse cx="175" cy="140" rx="9" ry="13" fill="#1e293b" />
                    <circle cx="172" cy="135" r="3.5" fill="#ffffff" />

                    {/* Confused Open Mouth (O-shape) */}
                    <ellipse cx="150" cy="162" rx="7" ry="10" fill="#1e293b" />
                  </g>
                ) : (
                  <g>
                    <path d="M 116 140 Q 125 146 134 140" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 166 140 Q 175 146 184 140" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </g>
                )}

                {/* Floating Little Ghost Arms */}
                <path d="M 75 170 Q 50 185 65 200" stroke="#cbd5e1" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M 225 170 Q 250 185 235 200" stroke="#cbd5e1" strokeWidth="7" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </div>

          {/* Avatar Switcher Pills */}
          <div className="flex items-center gap-2 mt-3 bg-neutral-200/70 p-1 rounded-full text-xs font-semibold text-neutral-600">
            <button
              type="button"
              onClick={() => setActiveAvatar("monster")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeAvatar === "monster"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "hover:text-neutral-900"
              }`}
            >
              Monster
            </button>
            <button
              type="button"
              onClick={() => setActiveAvatar("bot")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeAvatar === "bot"
                  ? "bg-white text-sky-800 shadow-xs font-bold"
                  : "hover:text-neutral-900"
              }`}
            >
              Bot
            </button>
            <button
              type="button"
              onClick={() => setActiveAvatar("ghost")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeAvatar === "ghost"
                  ? "bg-white text-purple-900 shadow-xs font-bold"
                  : "hover:text-neutral-900"
              }`}
            >
              Ghost
            </button>
          </div>
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
              className="inline-flex items-center justify-center rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
