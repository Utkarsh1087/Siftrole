"use client";

import React, { useState } from "react";

const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  figma: "figma.com",
  stripe: "stripe.com",
  spotify: "spotify.com",
  linear: "linear.app",
  notion: "notion.so",
  smartrecruiters: "smartrecruiters.com",
  github: "github.com",
  vercel: "vercel.com",
  openai: "openai.com",
  datadog: "datadoghq.com",
  cloudflare: "cloudflare.com",
  airbnb: "airbnb.com",
  brex: "brex.com",
  ramp: "ramp.com",
  canva: "canva.com",
  supabase: "supabase.com",
  anthropic: "anthropic.com",
  scale: "scale.com",
  discord: "discord.com",
  uber: "uber.com",
  netflix: "netflix.com",
  amazon: "amazon.com",
  microsoft: "microsoft.com",
  google: "google.com",
  apple: "apple.com",
  meta: "meta.com",
  plaid: "plaid.com",
  coinbase: "coinbase.com",
  postman: "postman.com",
  gitlab: "gitlab.com",
  docker: "docker.com",
  ashby: "ashbyhq.com",
  greenhouse: "greenhouse.io",
  lever: "lever.co",
};

export function getCompanyDomain(companyName: string): string {
  const clean = (companyName || "").toLowerCase().trim();
  for (const [key, domain] of Object.entries(KNOWN_COMPANY_DOMAINS)) {
    if (clean.includes(key)) {
      return domain;
    }
  }
  return clean.replace(/[^a-z0-9]/g, "") + ".com";
}

interface CompanyLogoProps {
  company: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CompanyLogo({ company, size = "sm", className = "" }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);
  const domain = getCompanyDomain(company);
  
  // High resolution company icon from Google Favicon service
  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  const sizeClasses = {
    sm: "h-6 w-6 text-[0.65rem] rounded-lg p-0.5",
    md: "h-8 w-8 text-xs rounded-xl p-1",
    lg: "h-10 w-10 text-sm rounded-xl p-1.5",
  }[size];

  const imgSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const initials = (company || "Co").substring(0, 2).toUpperCase();

  return (
    <div
      className={`${sizeClasses} shrink-0 bg-white border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden transition-all ${className}`}
    >
      {!imgError ? (
        <img
          src={logoUrl}
          alt={`${company} logo`}
          className={`${imgSizeClasses} object-contain rounded`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-emerald-50 rounded font-black text-[#083327]">
          {initials}
        </div>
      )}
    </div>
  );
}
