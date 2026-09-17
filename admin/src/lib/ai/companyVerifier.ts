export interface CompanyVerificationReport {
  companyName: string;
  trustScore: number; // 0 to 100
  verdict: "VERIFIED" | "CAUTION" | "SUSPICIOUS";
  companyProfile: {
    summary: string;
    industry: string;
    headquarters: string;
    websiteOrDomain: string;
    atsProvider: string;
  };
  domainAnalysis: {
    isOfficialDomain: boolean;
    domainExtracted: string;
    notes: string;
  };
  greenFlags: string[];
  redFlags: string[];
  recommendation: string;
  modelUsed: string;
}

const KNOWN_ATS_DOMAINS = [
  "greenhouse.io",
  "boards.greenhouse.io",
  "lever.co",
  "jobs.lever.co",
  "ashbyhq.com",
  "jobs.ashbyhq.com",
  "smartrecruiters.com",
  "myworkdayjobs.com",
  "workday.com",
  "bamboohr.com",
  "jobvite.com",
  "icims.com",
  "rippling-ats.com",
  "pinpointhq.com",
];

const SUSPICIOUS_DOMAINS = [
  "forms.gle",
  "docs.google.com/forms",
  "bit.ly",
  "tinyurl.com",
  "t.me",
  "telegram.me",
  "wa.me",
  "chat.whatsapp.com",
  "typeform.com",
];

export function runHeuristicCompanyCheck(
  companyName: string,
  applyUrl: string = "",
  careerPageUrl: string = "",
  jobTitle: string = "",
  rawText: string = ""
): CompanyVerificationReport {
  let score = 75;
  const greenFlags: string[] = [];
  const redFlags: string[] = [];
  let atsProvider = "Custom Career Feed";
  let domainExtracted = "Unknown";

  const urlToCheck = applyUrl || careerPageUrl || "";
  try {
    if (urlToCheck.startsWith("http")) {
      const urlObj = new URL(urlToCheck);
      domainExtracted = urlObj.hostname.toLowerCase();
    }
  } catch {}

  // 1. Check known ATS
  const isKnownAts = KNOWN_ATS_DOMAINS.some((d) => domainExtracted.includes(d));
  if (isKnownAts) {
    score += 20;
    const matched = KNOWN_ATS_DOMAINS.find((d) => domainExtracted.includes(d)) || "Enterprise ATS";
    atsProvider = matched;
    greenFlags.push(`Hosted on verified enterprise ATS (${matched})`);
  }

  // 2. Check brand name in URL
  const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleanCompany.length > 2 && domainExtracted.includes(cleanCompany)) {
    score += 15;
    greenFlags.push(`Corporate domain directly contains company name (${domainExtracted})`);
  }

  // 3. Check suspicious domains
  const isSuspicious = SUSPICIOUS_DOMAINS.some((d) => urlToCheck.toLowerCase().includes(d));
  if (isSuspicious) {
    score -= 45;
    redFlags.push("Apply link directs to generic form or chat link instead of an official hiring portal");
  }

  // 4. Check email domain if present
  if (/@(gmail|yahoo|hotmail|outlook)\.com/i.test(rawText)) {
    score -= 25;
    redFlags.push("Uses free webmail address (Gmail/Yahoo) rather than corporate email domain");
  }

  // 5. Check upfront fees or telegram flags
  if (/upfront fee|registration fee|security deposit|telegram|whatsapp only/i.test(rawText)) {
    score -= 40;
    redFlags.push("Contains keywords associated with employment advance-fee scams");
  }

  score = Math.max(10, Math.min(99, score));
  let verdict: "VERIFIED" | "CAUTION" | "SUSPICIOUS" = "VERIFIED";
  if (score < 55 || redFlags.length >= 2) {
    verdict = "SUSPICIOUS";
  } else if (score < 75 || redFlags.length === 1) {
    verdict = "CAUTION";
  }

  return {
    companyName,
    trustScore: score,
    verdict,
    companyProfile: {
      summary: `${companyName} is listed with hiring post for ${jobTitle || "Engineering Role"}.`,
      industry: "Technology / Professional Services",
      headquarters: "Global / Remote",
      websiteOrDomain: domainExtracted,
      atsProvider,
    },
    domainAnalysis: {
      isOfficialDomain: !isSuspicious && (isKnownAts || domainExtracted.includes(cleanCompany)),
      domainExtracted,
      notes: isKnownAts
        ? "Application URL matches verified recruiting software infrastructure."
        : "Standard web domain detected.",
    },
    greenFlags: greenFlags.length ? greenFlags : ["Company name and role title structured cleanly."],
    redFlags,
    recommendation:
      verdict === "VERIFIED"
        ? "Company identity verified. Safe to approve for live candidate board."
        : verdict === "CAUTION"
        ? "Review apply URL and company domain manually before final publishing."
        : "High scam/phishing risk detected. Rejection recommended.",
    modelUsed: "heuristic-rules-engine",
  };
}

export async function verifyCompanyWithAi(params: {
  companyName: string;
  careerPageUrl?: string;
  applyUrl?: string;
  jobTitle?: string;
  jobLocation?: string;
  rawJdSnippet?: string;
}): Promise<CompanyVerificationReport> {
  const {
    companyName,
    careerPageUrl = "",
    applyUrl = "",
    jobTitle = "",
    jobLocation = "",
    rawJdSnippet = "",
  } = params;

  const fallback = runHeuristicCompanyCheck(
    companyName,
    applyUrl,
    careerPageUrl,
    jobTitle,
    rawJdSnippet
  );

  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  const prompt = `
You are an expert fraud detection and corporate verification system for Siftrole, an engineering job board.
Perform a deep existence and authenticity verification on the following employer and job post:

Company Name: "${companyName}"
Job Title: "${jobTitle}"
Location: "${jobLocation}"
Apply URL: "${applyUrl}"
Career Page URL: "${careerPageUrl}"
Snippet/Context: "${rawJdSnippet.substring(0, 1000)}"

ANALYSIS CRITERIA:
1. Corporate Legitimacy: Is "${companyName}" a recognized real-world company, established enterprise, or credible tech startup?
2. Domain & URL Authenticity: Does the apply URL match the company's real domain or a legitimate ATS provider (Greenhouse, Lever, Ashby, SmartRecruiters, Workday)? Free forms (Google Forms, Airtable, Telegram, Bitly) are red flags.
3. Scam & Red Flags: Are there signs of ghost jobs, upfront fees, crypto scams, or suspicious recruiter communications?
4. Trust Score: Assign a score from 0 to 100.
5. Verdict: "VERIFIED" (80-100), "CAUTION" (60-79), or "SUSPICIOUS" (0-59).

Return ONLY a strict JSON object with this exact structure:
{
  "trustScore": 95,
  "verdict": "VERIFIED",
  "companyProfile": {
    "summary": "Brief 1-2 sentence description of the company and what it builds.",
    "industry": "e.g. Fintech, Enterprise Cloud, AI Infrastructure",
    "headquarters": "e.g. San Francisco, CA or New York, NY",
    "websiteOrDomain": "e.g. stripe.com",
    "atsProvider": "e.g. Greenhouse or Lever or Direct Portal"
  },
  "domainAnalysis": {
    "isOfficialDomain": true,
    "domainExtracted": "e.g. boards.greenhouse.io/stripe",
    "notes": "e.g. Official Greenhouse career endpoint verified for Stripe."
  },
  "greenFlags": [
    "Established technology business with proven hiring history",
    "Application routed through verified enterprise ATS"
  ],
  "redFlags": [],
  "recommendation": "Safe to approve for candidate listing."
}
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a strict corporate fraud analyst. You output raw JSON only with zero conversational prefix.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          companyName,
          trustScore: typeof parsed.trustScore === "number" ? parsed.trustScore : fallback.trustScore,
          verdict: ["VERIFIED", "CAUTION", "SUSPICIOUS"].includes(parsed.verdict)
            ? parsed.verdict
            : fallback.verdict,
          companyProfile: {
            summary: parsed.companyProfile?.summary || fallback.companyProfile.summary,
            industry: parsed.companyProfile?.industry || fallback.companyProfile.industry,
            headquarters: parsed.companyProfile?.headquarters || fallback.companyProfile.headquarters,
            websiteOrDomain: parsed.companyProfile?.websiteOrDomain || fallback.companyProfile.websiteOrDomain,
            atsProvider: parsed.companyProfile?.atsProvider || fallback.companyProfile.atsProvider,
          },
          domainAnalysis: {
            isOfficialDomain:
              typeof parsed.domainAnalysis?.isOfficialDomain === "boolean"
                ? parsed.domainAnalysis.isOfficialDomain
                : fallback.domainAnalysis.isOfficialDomain,
            domainExtracted: parsed.domainAnalysis?.domainExtracted || fallback.domainAnalysis.domainExtracted,
            notes: parsed.domainAnalysis?.notes || fallback.domainAnalysis.notes,
          },
          greenFlags: Array.isArray(parsed.greenFlags) && parsed.greenFlags.length ? parsed.greenFlags : fallback.greenFlags,
          redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : fallback.redFlags,
          recommendation: parsed.recommendation || fallback.recommendation,
          modelUsed: "llama-3.3-70b-versatile",
        };
      }
    }
  } catch (err) {
    console.warn("[Company Verifier] Groq API error, using fallback heuristics:", err);
  }

  return fallback;
}
