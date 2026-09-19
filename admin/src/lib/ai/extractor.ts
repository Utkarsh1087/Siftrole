import prisma from "../prisma";
import { NormalizedListing, ListingSchema } from "../scrapers/types";

export const STRICT_EXTRACTION_SYSTEM_PROMPT = `
You are an elite, highly meticulous technical recruiter and job parser for Siftrole.
Your mission is to parse raw, messy, unstructured job descriptions into a beautiful, complete, structured JSON schema.

CRITICAL PARSING RULES:
1. STRIP ALL GARBAGE: Strip out scraped UI artifacts like 'info_outline', 'X', close buttons, navigation headers, or cookie banners.
2. TITLE: Extract the clean official title (e.g. 'Software Engineering Intern, PhD (Summer 2027)'). Never include URLs or raw UI tags in the title.
3. COMPANY: Detect the accurate company name (e.g. 'Google').
4. LOCATION: Detect primary locations or summarize if multiple (e.g. 'United States (Multiple Locations: Mountain View, NYC, Seattle, etc.)').
5. EMPLOYMENT TYPE: 'Internship' | 'Full-time' | 'Part-time' | 'Contract' | null.
6. SALARY / STIPEND: Extract exact figures or range with currency (e.g. '$118,000 - $157,000 (USD)'). If not mentioned, set to null.
7. DEADLINE: Extract exact deadline if mentioned (e.g. '2027-02-26' or 'February 26, 2027'). If unstated, set to null.
8. ELIGIBILITY: Explicit degree level, graduation criteria, or work authorization (e.g. 'Pursuing a PhD program in Computer Science or a related technical field'). If unstated, set to null.
9. EXPERIENCE LEVEL: 'Intern' | 'PhD Intern' | 'New Grad' | 'Entry Level' | 'Mid Level' | 'Senior' | null.
10. SKILLS REQUIRED: Extract all technical skills, programming languages, and domains explicitly mentioned (e.g. ['C', 'C++', 'Java', 'Python', 'Algorithms', 'Distributed Systems', 'Machine Learning', 'Data Structures']).
11. SUMMARY: A concise, human-readable 2-3 sentence overview explaining what the candidate will work on and why this role is exciting.
12. RESPONSIBILITIES: Extract 4-6 clean, active bullet points of day-to-day duties.
13. QUALIFICATIONS: Extract 4-6 clean bullet points combining minimum and preferred qualifications.
14. BENEFITS: Extract bullet points of perks/benefits (health insurance, sick days, paid holidays, speaker series, etc.).
15. CLEAN_DESCRIPTION: Formatted markdown representation of the job description with clear headings (## About the Role, ## Key Responsibilities, ## Qualifications & Eligibility, ## Benefits & Location). Do NOT include raw scraped junk.

Output MUST be valid JSON adhering strictly to:
{
  "title": "string",
  "company": "string",
  "location": "string",
  "employment_type": "string | null",
  "stipend_or_salary": "string | null",
  "deadline": "string | null",
  "eligibility": "string | null",
  "experience_level": "string | null",
  "skills_required": ["string"],
  "apply_url": "string",
  "summary": "string | null",
  "responsibilities": ["string"],
  "qualifications": ["string"],
  "benefits": ["string"],
  "clean_description": "string | null"
}
`;

export function cleanInputText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^https?:\/\/[^\s\n]+/gm, "")
    .replace(/^info_outline\s*$/gim, "")
    .replace(/^X\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function localRuleBasedExtract(rawText: string): {
  title: string;
  company: string;
  location: string;
  employment_type: string | null;
  eligibility: string | null;
  stipend_or_salary: string | null;
  deadline: string | null;
  skills_required: string[];
  experience_level: string | null;
  apply_url: string;
  summary: string | null;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  clean_description: string | null;
} {
  const cleaned = cleanInputText(rawText);
  const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);
  
  let title = "Software Engineer";
  for (const l of lines) {
    if (/engineer|developer|designer|manager|intern|analyst|architect|specialist|lead|consultant/i.test(l) && !l.includes("http")) {
      title = l.replace(/^(job title|role|position):\s*/i, "").trim();
      break;
    }
  }

  let company = "Tech Company";
  for (const line of lines) {
    if (/company|organization|at\s+/i.test(line) && !line.includes("http")) {
      const match = line.replace(/^(company|organization):\s*/i, "").trim();
      if (match.length > 1 && match.length < 50) company = match;
    }
  }

  let location = "Remote / Unspecified";
  for (const line of lines) {
    if (/location|city|country|based in/i.test(line)) {
      const match = line.replace(/^(location|based in):\s*/i, "").trim();
      if (match.length > 1 && match.length < 60) location = match;
    }
  }

  let employment_type: string | null = null;
  if (/intern(ship)?/i.test(cleaned)) employment_type = "Internship";
  else if (/full[-\s]?time/i.test(cleaned)) employment_type = "Full time";
  else if (/part[-\s]?time/i.test(cleaned)) employment_type = "Part time";
  else if (/contract/i.test(cleaned)) employment_type = "Contract";

  let stipend_or_salary: string | null = null;
  const salaryMatch = cleaned.match(/(\$|€|£|₹|INR|USD)\s*[\d,]+(\s*-\s*[\d,]+)?(\s*(k|K|LPA|per month|hr|year|annum|\/yr|\/mo))?/i);
  if (salaryMatch) stipend_or_salary = salaryMatch[0].trim();

  let deadline: string | null = null;
  const deadlineMatch = cleaned.match(/(?:deadline|application window is open until|apply before|closes)\s*:?\s*([A-Za-z]+ \d{1,2}, \d{4}|\d{4}-\d{2}-\d{2})/i);
  if (deadlineMatch) deadline = deadlineMatch[1].trim();

  let eligibility: string | null = null;
  const eligMatch = cleaned.match(/(?:pursuing|enrolled in|bachelor|master|phd|degree)[\w\s,]+(?:program|field)?/i);
  if (eligMatch) eligibility = eligMatch[0].trim();

  let apply_url = "https://siftrole.com/jobs";
  const urlMatch = rawText.match(/https?:\/\/[^\s"'<>]+/);
  if (urlMatch) apply_url = urlMatch[0];

  const COMMON_SKILLS = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C", "C#", "Go", "Rust", "React", "Next.js",
    "Node.js", "Express", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Git",
    "Tailwind CSS", "GraphQL", "REST", "Machine Learning", "PyTorch", "Algorithms", "Distributed Systems", "Data Structures"
  ];
  const skills_required: string[] = [];
  for (const s of COMMON_SKILLS) {
    if (new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(cleaned)) {
      skills_required.push(s);
    }
  }

  // Extract sections
  let summary = "";
  const aboutMatch = cleaned.match(/About the job\s*([\s\S]*?)(?=(?:Responsibilities|Minimum qualifications|Preferred qualifications|Individual pay|$))/i);
  if (aboutMatch) summary = aboutMatch[1].trim();

  const responsibilities: string[] = [];
  const respMatch = cleaned.match(/Responsibilities\s*([\s\S]*?)(?=(?:Minimum qualifications|Preferred qualifications|About the job|Benefits|$))/i);
  if (respMatch) {
    responsibilities.push(
      ...respMatch[1]
        .split("\n")
        .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
        .filter((s) => s.length > 5 && !/^[A-Z\s]{3,}$/.test(s))
    );
  }

  const qualifications: string[] = [];
  const minQualMatch = cleaned.match(/Minimum qualifications:?\s*([\s\S]*?)(?=(?:Preferred qualifications|About the job|Responsibilities|$))/i);
  const prefQualMatch = cleaned.match(/Preferred qualifications:?\s*([\s\S]*?)(?=(?:Minimum qualifications|About the job|Responsibilities|$))/i);
  if (minQualMatch) {
    qualifications.push(
      ...minQualMatch[1]
        .split("\n")
        .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
        .filter((s) => s.length > 5)
        .map((s) => `Minimum: ${s}`)
    );
  }
  if (prefQualMatch) {
    qualifications.push(
      ...prefQualMatch[1]
        .split("\n")
        .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
        .filter((s) => s.length > 5)
        .map((s) => `Preferred: ${s}`)
    );
  }

  const benefits: string[] = [];
  const benMatch = cleaned.match(/Benefits for this role include:?\s*([\s\S]*?)(?=(?:Note:|Minimum qualifications|About the job|$))/i);
  if (benMatch) {
    benefits.push(
      ...benMatch[1]
        .split("\n")
        .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
        .filter((s) => s.length > 5)
    );
  }

  return {
    title,
    company,
    location,
    employment_type,
    eligibility,
    stipend_or_salary,
    deadline,
    skills_required,
    experience_level: /phd/i.test(title) ? "PhD Intern" : /intern/i.test(title) ? "Intern" : null,
    apply_url,
    summary: summary || null,
    responsibilities,
    qualifications,
    benefits,
    clean_description: cleaned,
  };
}

export async function extractJobListingWithAI(rawJdText: string): Promise<{
  listing: NormalizedListing;
  modelUsed: string;
  tokensUsed?: number;
  rawExtractedJson: any;
}> {
  let rawJson: any = null;
  let modelUsed = "local-rule-engine";
  let tokensUsed = 0;

  // Clean prompt input text
  const cleanInput = cleanInputText(rawJdText);

  // --- Build multi-key cascade (Groq keys first, then Gemini fallback) ---
  const rawGroqKeys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
    process.env.GROQ_API_KEY,
    process.env.AI_API_KEY,
  ]
    .filter(Boolean)
    .map((k) => k!.replace(/^["']|["']$/g, "").trim())
    .filter((k) => k.length > 0);

  const uniqueGroqKeys = Array.from(new Set(rawGroqKeys));

  const rawGeminiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ]
    .filter(Boolean)
    .map((k) => k!.replace(/^["']|["']$/g, "").trim())
    .filter((k) => k.length > 0);

  const uniqueGeminiKeys = Array.from(new Set(rawGeminiKeys));

  // Try each Groq key with high-intelligence openai/gpt-oss-120b, then fast qwen/qwen3.8-27b
  for (const apiKey of uniqueGroqKeys) {
    const groqModels = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
    for (const model of groqModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: STRICT_EXTRACTION_SYSTEM_PROMPT },
              { role: "user", content: `Raw Job Description:\n\n${rawJdText}` },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const completion = await response.json();
          const content = completion.choices?.[0]?.message?.content;
          if (content) {
            rawJson = JSON.parse(content);
            modelUsed = `groq/${model}`;
            tokensUsed = completion.usage?.total_tokens || 0;
            break;
          }
        } else if (response.status === 429 || response.status === 503) {
          console.warn(`[AI Extractor] Groq key rate-limited (${response.status}), trying next key...`);
          break; // Move to next key
        }
      } catch (err: any) {
        const isAbort = err?.name === "AbortError";
        console.warn(`[AI Extractor] Groq ${model} failed (${isAbort ? "timeout" : err?.message}), trying next...`);
      }
    }
    if (rawJson) break;
  }

  // Gemini fallback if all Groq keys failed
  if (!rawJson) {
    for (const apiKey of uniqueGeminiKeys) {
      for (const geminiModel of ["gemini-1.5-flash", "gemini-2.0-flash"]) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${STRICT_EXTRACTION_SYSTEM_PROMPT}\n\nRaw Job Description:\n\n${rawJdText}` }],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              rawJson = JSON.parse(content);
              modelUsed = `gemini/${geminiModel}`;
              break;
            }
          } else if (response.status === 429) {
            console.warn("[AI Extractor] Gemini key rate-limited, trying next...");
          }
        } catch (err: any) {
          const isAbort = err?.name === "AbortError";
          console.warn(`[AI Extractor] Gemini failed (${isAbort ? "timeout" : err?.message}), trying next...`);
        }
      }
      if (rawJson) break;
    }
  }

  if (!rawJson) {
    rawJson = localRuleBasedExtract(rawJdText);
    modelUsed = "local-rule-engine";
  }

  const parseResult = ListingSchema.safeParse(rawJson);
  const validated = parseResult.success
    ? parseResult.data
    : localRuleBasedExtract(rawJdText);

  try {
    await prisma.extractionLog.create({
      data: {
        raw_jd_snippet: rawJdText.substring(0, 500),
        extracted_json: validated as any,
        model_used: modelUsed,
        tokens_used: tokensUsed,
        extraction_status: "success",
      },
    });
  } catch (logErr) {
    console.error("[Extraction Log Error]", logErr);
  }

  const { computeRawJdHash, computeNormalizedKey } = await import("../sync/dedup");
  const rawJdHash = computeRawJdHash(rawJdText);
  const normalizedKey = computeNormalizedKey(validated.company, validated.title, validated.location);

  // Store rich structured JSON in raw_jd_text so client components can render distinct sections
  const structuredJdPayload = {
    summary: validated.summary || null,
    responsibilities: validated.responsibilities || [],
    qualifications: validated.qualifications || [],
    benefits: validated.benefits || [],
    clean_description: validated.clean_description || null,
  };

  const rawJdToStore = (validated.summary || (validated.responsibilities && validated.responsibilities.length > 0))
    ? JSON.stringify(structuredJdPayload)
    : (validated.clean_description || cleanInputText(rawJdText));

  const normalizedListing: NormalizedListing = {
    title: validated.title,
    company: validated.company,
    location: validated.location,
    employment_type: validated.employment_type || null,
    eligibility: validated.eligibility || null,
    stipend_or_salary: validated.stipend_or_salary || null,
    deadline: validated.deadline || null,
    skills_required: validated.skills_required || [],
    experience_level: validated.experience_level || null,
    apply_url: validated.apply_url || "https://siftrole.com/jobs",
    source: "manual",
    raw_jd_hash: rawJdHash,
    raw_jd_text: rawJdToStore,
    normalized_key: normalizedKey,
    summary: validated.summary || null,
    responsibilities: validated.responsibilities || [],
    qualifications: validated.qualifications || [],
    benefits: validated.benefits || [],
    clean_description: validated.clean_description || null,
  };

  return {
    listing: normalizedListing,
    modelUsed,
    tokensUsed,
    rawExtractedJson: validated,
  };
}

/**
 * Parses every scraped job listing with AI before listing it.
 */
export async function parseScrapedListingWithAi(scraped: NormalizedListing): Promise<NormalizedListing> {
  const contextHeader = [
    `Job Title: ${scraped.title}`,
    `Company: ${scraped.company}`,
    `Location: ${scraped.location}`,
    `Apply URL: ${scraped.apply_url}`,
    scraped.employment_type ? `Employment Type: ${scraped.employment_type}` : null,
    scraped.stipend_or_salary ? `Compensation: ${scraped.stipend_or_salary}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const fullPromptText = `${contextHeader}\n\nJob Description Content:\n${scraped.raw_jd_text || scraped.title}`;

  try {
    const aiResult = await extractJobListingWithAI(fullPromptText);
    const aiExtracted = aiResult.listing;

    return {
      ...scraped,
      title: aiExtracted.title || scraped.title,
      company: scraped.company || aiExtracted.company,
      location: aiExtracted.location || scraped.location,
      employment_type: aiExtracted.employment_type || scraped.employment_type,
      eligibility: aiExtracted.eligibility || scraped.eligibility,
      stipend_or_salary: aiExtracted.stipend_or_salary || scraped.stipend_or_salary,
      deadline: aiExtracted.deadline || scraped.deadline,
      skills_required:
        aiExtracted.skills_required && aiExtracted.skills_required.length > 0
          ? aiExtracted.skills_required
          : scraped.skills_required,
      experience_level: aiExtracted.experience_level || scraped.experience_level,
      apply_url: scraped.apply_url || aiExtracted.apply_url,
      source: "scraped",
      raw_jd_hash: scraped.raw_jd_hash || aiExtracted.raw_jd_hash,
      raw_jd_text: aiExtracted.raw_jd_text || scraped.raw_jd_text || fullPromptText,
      normalized_key: scraped.normalized_key || aiExtracted.normalized_key,
      summary: aiExtracted.summary || scraped.summary,
      responsibilities: aiExtracted.responsibilities || scraped.responsibilities,
      qualifications: aiExtracted.qualifications || scraped.qualifications,
      benefits: aiExtracted.benefits || scraped.benefits,
      clean_description: aiExtracted.clean_description || scraped.clean_description,
    };
  } catch (err) {
    console.warn(`[AI Parser Warning] Admin scraper AI fallback for ${scraped.title}:`, err);
    return scraped;
  }
}
