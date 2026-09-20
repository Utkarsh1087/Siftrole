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

export function CompanyLogo({ company, size = "md", className = "" }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);
  const domain = getCompanyDomain(company);
  
  // High resolution company icon from Google Favicon service
  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  const sizeClasses = {
    sm: "h-9 w-9 text-xs rounded-xl p-1",
    md: "h-12 w-12 text-sm rounded-2xl p-2",
    lg: "h-14 w-14 text-base rounded-2xl p-2.5",
  }[size];

  const imgSizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-8 w-8",
  }[size];

  const initials = (company || "Co").substring(0, 2).toUpperCase();

  return (
    <div
      className={`${sizeClasses} shrink-0 bg-white border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#1a422f] group-hover:shadow-[0_4px_12px_rgba(26,66,47,0.15)] ${className}`}
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
        <div className="flex h-full w-full items-center justify-center bg-[#f3ebd6]/60 rounded-xl font-black text-[#02110c]">
          {initials}
        </div>
      )}
    </div>
  );
}
