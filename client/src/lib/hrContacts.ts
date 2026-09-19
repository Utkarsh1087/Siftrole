export interface HRContact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  department: "Engineering" | "Early Career / University" | "AI & Research" | "Product & Design";
  location: string;
  linkedin_url?: string;
  verified: boolean;
  hiring_for: string[];
}

export const HR_CONTACTS_DATA: HRContact[] = [
  {
    id: "hr-1",
    name: "Sarah Chen",
    title: "University Talent Lead & Early Career SWE",
    company: "Stripe",
    email: "sarah.chen@stripe.com",
    department: "Early Career / University",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["SWE Intern 2026", "New Grad SWE", "Backend Infrastructure"],
  },
  {
    id: "hr-2",
    name: "Alex Rivera",
    title: "Senior Technical Recruiter, Platform & Core",
    company: "Figma",
    email: "arivera@figma.com",
    department: "Engineering",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Frontend Engineers", "WebGL / Graphics", "Full Stack Interns"],
  },
  {
    id: "hr-3",
    name: "Elena Rostova",
    title: "Head of Technical Talent Acquisition",
    company: "Linear",
    email: "elena@linear.app",
    department: "Engineering",
    location: "San Francisco, CA / Hybrid",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Full Stack SWE", "Desktop Client Engineers", "Systems Interns"],
  },
  {
    id: "hr-4",
    name: "Marcus Thorne",
    title: "Global Talent Partner, R&D Engineering",
    company: "Spotify",
    email: "marcust@spotify.com",
    department: "Engineering",
    location: "New York, NY / Stockholm",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Distributed Systems", "Audio AI / ML", "Mobile Engineers"],
  },
  {
    id: "hr-5",
    name: "Priya Sharma",
    title: "University & Emerging Talent Lead",
    company: "Notion",
    email: "psharma@notion.so",
    department: "Early Career / University",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Summer 2026 Interns", "AI Features SWE", "Product Engineers"],
  },
  {
    id: "hr-6",
    name: "David Kim",
    title: "AI Talent & Research Recruiter",
    company: "OpenAI",
    email: "dkim@openai.com",
    department: "AI & Research",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Research Engineers", "Platform SWE", "Post-Grad Fellowships"],
  },
  {
    id: "hr-7",
    name: "Jessica Vance",
    title: "Lead Technical Recruiter, Cloud Infrastructure",
    company: "Datadog",
    email: "jvance@datadoghq.com",
    department: "Engineering",
    location: "Boston, MA / New York, NY",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Distributed Tracing", "Go / Rust Engineers", "SRE Interns"],
  },
  {
    id: "hr-8",
    name: "Liam O'Connor",
    title: "Campus Recruiting Partner",
    company: "Airbnb",
    email: "liam.oconnor@airbnb.com",
    department: "Early Career / University",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Software Engineering Intern", "Full Stack New Grad", "Data Platform"],
  },
  {
    id: "hr-9",
    name: "Maya Lin",
    title: "Engineering Talent Partner",
    company: "Brex",
    email: "maya.lin@brex.com",
    department: "Engineering",
    location: "New York, NY / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Fintech Backend", "Elixir / Kotlin", "Frontend Infrastructure"],
  },
  {
    id: "hr-10",
    name: "Kevin Patel",
    title: "Technical Sourcing Lead, Product & Infra",
    company: "Ramp",
    email: "kpatel@ramp.com",
    department: "Engineering",
    location: "New York, NY",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Core SWE", "Risk Engineering", "Summer 2026 Interns"],
  },
  // ==========================================
  // PREMIUM / LOCKED CONTACTS (Index 10+)
  // ==========================================
  {
    id: "hr-11",
    name: "Chloe Dupont",
    title: "Senior AI Talent Partner",
    company: "Anthropic",
    email: "chloe.dupont@anthropic.com",
    department: "AI & Research",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Alignment Engineers", "Systems Scalability", "Research Fellows"],
  },
  {
    id: "hr-12",
    name: "Brandon Cole",
    title: "Head of Developer Tools Recruiting",
    company: "Vercel",
    email: "bcole@vercel.com",
    department: "Engineering",
    location: "Remote / San Francisco",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Next.js Core", "Turborepo Engineers", "Edge Compute"],
  },
  {
    id: "hr-13",
    name: "Rachel Green",
    title: "Lead Technical Recruiter, Database & Systems",
    company: "Supabase",
    email: "rachel@supabase.com",
    department: "Engineering",
    location: "Remote / Singapore",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["PostgreSQL Hackers", "Elixir / Go SWE", "Frontend Devs"],
  },
  {
    id: "hr-14",
    name: "Noah Washington",
    title: "University Recruiting Lead",
    company: "Scale",
    email: "noah.w@scale.com",
    department: "Early Career / University",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Generative AI SWE", "RLHF Pipeline Engineers", "Interns"],
  },
  {
    id: "hr-15",
    name: "Sofia Alvarez",
    title: "Technical Talent Acquisition Partner",
    company: "Cloudflare",
    email: "salvarez@cloudflare.com",
    department: "Engineering",
    location: "Austin, TX / San Francisco",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Networking Engineers", "Rust Workers", "Security Interns"],
  },
  {
    id: "hr-16",
    name: "Ethan Wright",
    title: "Senior Recruiter, Real-Time Communications",
    company: "Discord",
    email: "ethanw@discord.com",
    department: "Engineering",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Audio/Video Infra", "Rust SWE", "Community Safety"],
  },
  {
    id: "hr-17",
    name: "Aisha Khan",
    title: "Early Career Technical Sourcer",
    company: "Google",
    email: "aishak@google.com",
    department: "Early Career / University",
    location: "Mountain View, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["STEP Interns", "SWE Summer 2026", "Cloud Systems"],
  },
  {
    id: "hr-18",
    name: "Lucas Bennett",
    title: "Talent Partner, Financial Systems",
    company: "Plaid",
    email: "lbennett@plaid.com",
    department: "Engineering",
    location: "San Francisco, CA / Salt Lake City",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Core API SWE", "Security Engineering", "Interns"],
  },
  {
    id: "hr-19",
    name: "Hannah Becker",
    title: "Lead Technical Recruiter, Crypto & Infra",
    company: "Coinbase",
    email: "hbecker@coinbase.com",
    department: "Engineering",
    location: "Remote (US/Global)",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Blockchain Infra", "Backend SWE (Go)", "Security Specialists"],
  },
  {
    id: "hr-20",
    name: "Tyler Scott",
    title: "Product & Engineering Talent Lead",
    company: "Canva",
    email: "tscott@canva.com",
    department: "Product & Design",
    location: "San Francisco, CA / Sydney",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Web Canvas Engineers", "Mobile SWE", "UI Designers"],
  },
  {
    id: "hr-21",
    name: "Maya Patel",
    title: "Head of AI Engineering Recruiting",
    company: "Cursor",
    email: "maya@cursor.com",
    department: "AI & Research",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["AI Research Engineers", "Electron & Core SWE", "Compiler Specialists"],
  },
  {
    id: "hr-22",
    name: "Jordan Lee",
    title: "Senior Technical Talent Partner",
    company: "Retool",
    email: "jordan.lee@retool.com",
    department: "Engineering",
    location: "San Francisco, CA / New York",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Full Stack Engineers", "Enterprise Core SWE", "Frontend Architects"],
  },
  {
    id: "hr-23",
    name: "Rachel Goldman",
    title: "University Recruiting Lead",
    company: "Ramp",
    email: "rachel.g@ramp.com",
    department: "Early Career / University",
    location: "New York, NY",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["SWE Intern Summer 2026", "New Grad Product Engineers", "Data Science"],
  },
  {
    id: "hr-24",
    name: "Liam O'Connor",
    title: "Principal Recruiter, Distributed Systems",
    company: "Snowflake",
    email: "liam.oconnor@snowflake.com",
    department: "Engineering",
    location: "San Mateo, CA / Bellevue",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Database Kernel SWE", "Query Optimization", "C++ Engineers"],
  },
  {
    id: "hr-25",
    name: "Chloe Dupont",
    title: "Senior Recruiter, Open Source & DB Infra",
    company: "Supabase",
    email: "chloe@supabase.io",
    department: "Engineering",
    location: "Remote (Global)",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Postgres Infra", "Elixir SWE", "Developer Advocates"],
  },
  {
    id: "hr-26",
    name: "Kevin Zhang",
    title: "Technical Talent Acquisition Lead",
    company: "Datadog",
    email: "kzhang@datadoghq.com",
    department: "Engineering",
    location: "New York, NY / Boston",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Telemetry Pipeline SWE", "Go / C++ Infra", "Observability Interns"],
  },
  {
    id: "hr-27",
    name: "Samantha Brooks",
    title: "University & Early Talent Sourcer",
    company: "GitHub",
    email: "sbrooks@github.com",
    department: "Early Career / University",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Copilot Team Interns", "Ecosystem Engineers", "Web Platform"],
  },
  {
    id: "hr-28",
    name: "Daniel Foster",
    title: "Staff Technical Recruiter, Core Experience",
    company: "Airbnb",
    email: "dfoster@airbnb.com",
    department: "Engineering",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Design Systems Engineers", "Mobile iOS/Android", "Search Backend"],
  },
  {
    id: "hr-29",
    name: "Natalie Vance",
    title: "Design & Product Recruiting Partner",
    company: "Figma",
    email: "nvance@figma.com",
    department: "Product & Design",
    location: "San Francisco, CA / Remote",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Product Designers", "Design Systems SWE", "UX Researchers"],
  },
  {
    id: "hr-30",
    name: "Benjamin Reed",
    title: "AI Infrastructure Recruiter",
    company: "Anthropic",
    email: "breed@anthropic.com",
    department: "AI & Research",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com",
    verified: true,
    hiring_for: ["Supercomputing Cluster Infra", "Kubernetes SWE", "Model Training Ops"],
  },
];

/**
 * Launch Special: Free for First 2 Months
 * Full platform features, recruiter database, and AI cold email tooling are 100% free.
 */
export const IS_PROMOTIONAL_FREE_PERIOD = true;
export const PROMOTION_DURATION = "First 2 Months Free";
export const FREE_CONTACTS_LIMIT = 99999;

export function isProUser(): boolean {
  // Free for first two months for all users
  if (IS_PROMOTIONAL_FREE_PERIOD) return true;
  if (typeof window === "undefined") return false;
  try {
    const pro = localStorage.getItem("siftrole_pro_unlocked");
    return pro === "true";
  } catch {
    return false;
  }
}

export function unlockProAccess(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("siftrole_pro_unlocked", "true");
    window.dispatchEvent(new Event("siftrole-pro-change"));
  } catch {}
}

export function getMailedContactIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("siftrole_mailed_hr_ids");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function toggleMailedContactId(id: string): boolean {
  if (typeof window === "undefined" || !id) return false;
  try {
    const current = getMailedContactIds();
    let isMailed = false;
    if (current.has(id)) {
      current.delete(id);
      isMailed = false;
    } else {
      current.add(id);
      isMailed = true;
    }
    localStorage.setItem("siftrole_mailed_hr_ids", JSON.stringify(Array.from(current)));
    window.dispatchEvent(new Event("siftrole-mailed-change"));
    return isMailed;
  } catch {
    return false;
  }
}

export function markContactAsMailed(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const current = getMailedContactIds();
    if (!current.has(id)) {
      current.add(id);
      localStorage.setItem("siftrole_mailed_hr_ids", JSON.stringify(Array.from(current)));
      window.dispatchEvent(new Event("siftrole-mailed-change"));
    }
  } catch {}
}

export const RECRUITER_CONTACTS = HR_CONTACTS_DATA;
