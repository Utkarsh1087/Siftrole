import { AtsType } from "@prisma/client";

export interface DiscoveredCompany {
  name: string;
  career_page_url: string;
  ats_type: AtsType;
  ats_identifier: string;
  activeJobsCount: number;
  sampleTitles?: string[];
  verified: boolean;
}

/**
 * Tests an ATS endpoint directly to verify if it is active and has live jobs.
 */
export async function testAtsEndpoint(
  atsType: AtsType,
  identifier: string
): Promise<{ isValid: boolean; activeJobsCount: number; sampleTitles: string[]; careerUrl: string }> {
  const cleanSlug = identifier.trim().toLowerCase();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    if (atsType === "GREENHOUSE") {
      const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(cleanSlug)}/jobs?content=false`;
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 0 } });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const jobs = data.jobs || [];
        return {
          isValid: jobs.length > 0,
          activeJobsCount: jobs.length,
          sampleTitles: jobs.slice(0, 3).map((j: any) => j.title),
          careerUrl: `https://boards.greenhouse.io/${cleanSlug}`,
        };
      }
    } else if (atsType === "ASHBY") {
      const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(cleanSlug)}`;
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 0 } });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const jobs = data.jobs || [];
        return {
          isValid: jobs.length > 0,
          activeJobsCount: jobs.length,
          sampleTitles: jobs.slice(0, 3).map((j: any) => j.title),
          careerUrl: `https://jobs.ashbyhq.com/${cleanSlug}`,
        };
      }
    } else if (atsType === "LEVER") {
      const url = `https://api.lever.co/v0/postings/${encodeURIComponent(cleanSlug)}?mode=json`;
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 0 } });
      clearTimeout(timeoutId);
      if (res.ok) {
        const jobs = await res.json();
        if (Array.isArray(jobs)) {
          return {
            isValid: jobs.length > 0,
            activeJobsCount: jobs.length,
            sampleTitles: jobs.slice(0, 3).map((j: any) => j.text || j.title),
            careerUrl: `https://jobs.lever.co/${cleanSlug}`,
          };
        }
      }
    } else if (atsType === "SMARTRECRUITERS") {
      const url = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(cleanSlug)}/postings`;
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 0 } });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const jobs = data.content || [];
        return {
          isValid: jobs.length > 0,
          activeJobsCount: data.totalFound || jobs.length,
          sampleTitles: jobs.slice(0, 3).map((j: any) => j.name || j.title),
          careerUrl: `https://jobs.smartrecruiters.com/${cleanSlug}`,
        };
      }
    }
  } catch (err) {
    // endpoint failed or timed out
  }

  return { isValid: false, activeJobsCount: 0, sampleTitles: [], careerUrl: "" };
}

/**
 * Automatically detects the ATS provider and slug given a company name or website/career URL.
 */
export async function detectAtsFromInput(input: string): Promise<{
  detected: boolean;
  name: string;
  ats_type?: AtsType;
  ats_identifier?: string;
  career_page_url?: string;
  activeJobsCount?: number;
  sampleTitles?: string[];
  error?: string;
}> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { detected: false, name: "", error: "Input is empty" };
  }

  // 1. Check if input is a direct ATS URL
  const greenhouseMatch = trimmed.match(/boards\.greenhouse\.io\/([a-zA-Z0-9_-]+)/i);
  if (greenhouseMatch) {
    const slug = greenhouseMatch[1];
    const test = await testAtsEndpoint("GREENHOUSE", slug);
    if (test.isValid) {
      return {
        detected: true,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        ats_type: "GREENHOUSE",
        ats_identifier: slug,
        career_page_url: test.careerUrl,
        activeJobsCount: test.activeJobsCount,
        sampleTitles: test.sampleTitles,
      };
    }
  }

  const ashbyMatch = trimmed.match(/jobs\.ashbyhq\.com\/([a-zA-Z0-9_-]+)/i);
  if (ashbyMatch) {
    const slug = ashbyMatch[1];
    const test = await testAtsEndpoint("ASHBY", slug);
    if (test.isValid) {
      return {
        detected: true,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        ats_type: "ASHBY",
        ats_identifier: slug,
        career_page_url: test.careerUrl,
        activeJobsCount: test.activeJobsCount,
        sampleTitles: test.sampleTitles,
      };
    }
  }

  const leverMatch = trimmed.match(/jobs\.lever\.co\/([a-zA-Z0-9_-]+)/i);
  if (leverMatch) {
    const slug = leverMatch[1];
    const test = await testAtsEndpoint("LEVER", slug);
    if (test.isValid) {
      return {
        detected: true,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        ats_type: "LEVER",
        ats_identifier: slug,
        career_page_url: test.careerUrl,
        activeJobsCount: test.activeJobsCount,
        sampleTitles: test.sampleTitles,
      };
    }
  }

  const smartRecruitersMatch = trimmed.match(/jobs\.smartrecruiters\.com\/([a-zA-Z0-9_-]+)/i);
  if (smartRecruitersMatch) {
    const slug = smartRecruitersMatch[1];
    const test = await testAtsEndpoint("SMARTRECRUITERS", slug);
    if (test.isValid) {
      return {
        detected: true,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        ats_type: "SMARTRECRUITERS",
        ats_identifier: slug,
        career_page_url: test.careerUrl,
        activeJobsCount: test.activeJobsCount,
        sampleTitles: test.sampleTitles,
      };
    }
  }

  // 2. Derive candidate slugs from company name or domain
  const cleanName = trimmed
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/\.(com|io|ai|app|co|net|org|dev)(\/.*)?$/i, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim();

  const slugCandidates = [
    cleanName.toLowerCase().replace(/\s+/g, ""),
    cleanName.toLowerCase().replace(/\s+/g, "-"),
    cleanName.toLowerCase().replace(/\s+/g, "_"),
  ];

  const atsTypesToTest: AtsType[] = ["GREENHOUSE", "ASHBY", "LEVER", "SMARTRECRUITERS"];

  for (const slug of Array.from(new Set(slugCandidates))) {
    if (!slug) continue;
    for (const atsType of atsTypesToTest) {
      const test = await testAtsEndpoint(atsType, slug);
      if (test.isValid) {
        return {
          detected: true,
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          ats_type: atsType,
          ats_identifier: slug,
          career_page_url: test.careerUrl,
          activeJobsCount: test.activeJobsCount,
          sampleTitles: test.sampleTitles,
        };
      }
    }
  }

  // 3. Fallback: Ask Google Gemini to locate official ATS slug
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiApiKey) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const prompt = `Identify the official ATS job board (Greenhouse, Ashby, Lever, or SmartRecruiters) and company slug for: "${trimmed}".
Respond STRICTLY with valid JSON:
{
  "name": "Official Company Name",
  "ats_type": "GREENHOUSE" | "ASHBY" | "LEVER" | "SMARTRECRUITERS" | null,
  "ats_identifier": "slug or null"
}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.ats_type && parsed.ats_identifier) {
            const test = await testAtsEndpoint(parsed.ats_type, parsed.ats_identifier);
            if (test.isValid) {
              return {
                detected: true,
                name: parsed.name || cleanName,
                ats_type: parsed.ats_type,
                ats_identifier: parsed.ats_identifier,
                career_page_url: test.careerUrl,
                activeJobsCount: test.activeJobsCount,
                sampleTitles: test.sampleTitles,
              };
            }
          }
        }
      }
    }
  } catch {
    // fallback failed
  }

  return {
    detected: false,
    name: cleanName,
    error: `Could not detect an active Greenhouse, Ashby, Lever, or SmartRecruiters board for "${trimmed}".`,
  };
}

/**
 * Curated high-growth tech company directory for automated bulk discovery.
 */
export const POPULAR_TECH_FEEDS: Array<{ name: string; ats_type: AtsType; ats_identifier: string }> = [
  // Greenhouse leaders
  { name: "OpenAI", ats_type: "GREENHOUSE", ats_identifier: "openai" },
  { name: "Figma", ats_type: "GREENHOUSE", ats_identifier: "figma" },
  { name: "Stripe", ats_type: "GREENHOUSE", ats_identifier: "stripe" },
  { name: "Airbnb", ats_type: "GREENHOUSE", ats_identifier: "airbnb" },
  { name: "Coinbase", ats_type: "GREENHOUSE", ats_identifier: "coinbase" },
  { name: "Discord", ats_type: "GREENHOUSE", ats_identifier: "discord" },
  { name: "Datadog", ats_type: "GREENHOUSE", ats_identifier: "datadog" },
  { name: "Pinterest", ats_type: "GREENHOUSE", ats_identifier: "pinterest" },
  { name: "Retool", ats_type: "GREENHOUSE", ats_identifier: "retool" },
  { name: "DoorDash", ats_type: "GREENHOUSE", ats_identifier: "doordash" },
  { name: "Snapchat", ats_type: "GREENHOUSE", ats_identifier: "snap" },
  { name: "Palantir", ats_type: "GREENHOUSE", ats_identifier: "palantirtechnologies" },
  { name: "Instacart", ats_type: "GREENHOUSE", ats_identifier: "instacart" },
  { name: "Robinhood", ats_type: "GREENHOUSE", ats_identifier: "robinhood" },
  { name: "Brex", ats_type: "GREENHOUSE", ats_identifier: "brex" },

  // Ashby leaders
  { name: "Anthropic", ats_type: "ASHBY", ats_identifier: "anthropic" },
  { name: "Vercel", ats_type: "ASHBY", ats_identifier: "vercel" },
  { name: "Linear", ats_type: "ASHBY", ats_identifier: "linear" },
  { name: "Ramp", ats_type: "ASHBY", ats_identifier: "ramp" },
  { name: "Replit", ats_type: "ASHBY", ats_identifier: "replit" },
  { name: "Perplexity AI", ats_type: "ASHBY", ats_identifier: "perplexity" },
  { name: "Cursor (Anysphere)", ats_type: "ASHBY", ats_identifier: "anysphere" },
  { name: "Loom", ats_type: "ASHBY", ats_identifier: "loom" },
  { name: "Supabase", ats_type: "ASHBY", ats_identifier: "supabase" },
  { name: "Resend", ats_type: "ASHBY", ats_identifier: "resend" },
  { name: "ElevenLabs", ats_type: "ASHBY", ats_identifier: "elevenlabs" },

  // Lever leaders
  { name: "Spotify", ats_type: "LEVER", ats_identifier: "spotify" },
  { name: "Netflix", ats_type: "LEVER", ats_identifier: "netflix" },
  { name: "Atlassian", ats_type: "LEVER", ats_identifier: "atlassian" },
  { name: "Eventbrite", ats_type: "LEVER", ats_identifier: "eventbrite" },
  { name: "Plex", ats_type: "LEVER", ats_identifier: "plex" },

  // SmartRecruiters leaders
  { name: "Visa", ats_type: "SMARTRECRUITERS", ats_identifier: "Visa" },
  { name: "Block (Square)", ats_type: "SMARTRECRUITERS", ats_identifier: "Square" },
  { name: "Bosch", ats_type: "SMARTRECRUITERS", ats_identifier: "BoschGroup" },
  { name: "Skechers", ats_type: "SMARTRECRUITERS", ats_identifier: "SKECHERS" },
];

/**
 * Discovers and tests active companies in bulk, returning only those with live jobs.
 */
export async function discoverActiveCompanies(limit = 15): Promise<DiscoveredCompany[]> {
  const discovered: DiscoveredCompany[] = [];
  
  // Test candidate feeds concurrently in chunks of 5
  const chunk = POPULAR_TECH_FEEDS.slice(0, 30);
  
  for (let i = 0; i < chunk.length; i += 5) {
    const batch = chunk.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (item) => {
        const test = await testAtsEndpoint(item.ats_type, item.ats_identifier);
        if (test.isValid && test.activeJobsCount > 0) {
          return {
            name: item.name,
            career_page_url: test.careerUrl,
            ats_type: item.ats_type,
            ats_identifier: item.ats_identifier,
            activeJobsCount: test.activeJobsCount,
            sampleTitles: test.sampleTitles,
            verified: true,
          };
        }
        return null;
      })
    );

    for (const r of results) {
      if (r) {
        discovered.push(r);
        if (discovered.length >= limit) return discovered;
      }
    }
  }

  return discovered;
}
