import prisma from "../prisma";
import { NormalizedListing, ListingSchema } from "../scrapers/types";

export const STRICT_EXTRACTION_SYSTEM_PROMPT = `
You are a precise, strict Job Description extraction system for Siftrole.
Your job is to parse unstructured job descriptions into a structured JSON object adhering strictly to the schema provided.

CRITICAL INSTRUCTIONS & HARD RULES:
1. NEVER guess, infer, or hallucinate missing information.
2. If a field is not explicitly mentioned in the raw text, you MUST return null (or [] for skills_required).
3. If stipend/salary is not stated, return null (never guess a range).
4. If deadline is not stated, return null.
5. If eligibility/graduation year is not stated, return null.
6. Extract skills ONLY if explicitly named in requirements or description.
7. Return raw JSON strictly matching this schema:
{
  "title": "string",
  "company": "string",
  "location": "string",
  "employment_type": "Full time | Internship | Part time | Contract | null",
  "eligibility": "string | null",
  "stipend_or_salary": "string | null",
  "deadline": "ISO date string | null",
  "skills_required": ["string"],
  "experience_level": "string | null",
  "apply_url": "string"
}
`;

function localRuleBasedExtract(rawText: string): {
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
} {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  let title = lines[0] || "Software Engineer";
  let company = "Tech Company";
  let location = "Remote / Unspecified";

  for (const line of lines) {
    if (/company|organization|at\s+/i.test(line) && !line.includes("http")) {
      const match = line.replace(/^(company|organization):\s*/i, "").trim();
      if (match.length > 1 && match.length < 50) company = match;
    }
    if (/location|city|country|based in/i.test(line)) {
      const match = line.replace(/^(location|based in):\s*/i, "").trim();
      if (match.length > 1 && match.length < 60) location = match;
    }
  }

  let employment_type: string | null = null;
  if (/intern(ship)?/i.test(rawText)) employment_type = "Internship";
  else if (/full[-\s]?time/i.test(rawText)) employment_type = "Full time";
  else if (/part[-\s]?time/i.test(rawText)) employment_type = "Part time";
  else if (/contract/i.test(rawText)) employment_type = "Contract";

  let stipend_or_salary: string | null = null;
  const salaryMatch = rawText.match(/(\$|€|£|₹|INR|USD)\s*[\d,]+(\s*-\s*[\d,]+)?(\s*(k|K|LPA|per month|hr|year|annum|\/yr|\/mo))?/i);
  if (salaryMatch) stipend_or_salary = salaryMatch[0].trim();

  let apply_url = "https://siftrole.com/jobs";
  const urlMatch = rawText.match(/https?:\/\/[^\s"'<>]+/);
  if (urlMatch) apply_url = urlMatch[0];

  const COMMON_SKILLS = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "React", "Next.js",
    "Node.js", "Express", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Git",
    "Tailwind CSS", "GraphQL", "REST", "Machine Learning", "PyTorch"
  ];
  const skills_required: string[] = [];
  for (const s of COMMON_SKILLS) {
    if (new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(rawText)) {
      skills_required.push(s);
    }
  }

  return {
    title,
    company,
    location,
    employment_type,
    eligibility: null,
    stipend_or_salary,
    deadline: null,
    skills_required,
    experience_level: null,
    apply_url,
  };
}

export async function extractJobListingWithAI(rawJdText: string): Promise<{
  listing: NormalizedListing;
  modelUsed: string;
  tokensUsed?: number;
  rawExtractedJson: any;
}> {
  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
  let rawJson: any = null;
  let modelUsed = "local-rule-engine";
  let tokensUsed = 0;

  if (apiKey) {
    const candidateModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
    ];

    for (const model of candidateModels) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: STRICT_EXTRACTION_SYSTEM_PROMPT },
              { role: "user", content: `Raw Job Description:\n\n${rawJdText}` },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const completion = await response.json();
          const content = completion.choices?.[0]?.message?.content;
          if (content) {
            rawJson = JSON.parse(content);
            modelUsed = model;
            tokensUsed = completion.usage?.total_tokens || 0;
            break;
          }
        }
      } catch (err) {
        console.warn(`[AI Extractor] Groq model ${model} failed, trying fallback:`, err);
      }
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
    raw_jd_text: rawJdText,
    normalized_key: normalizedKey,
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
      raw_jd_text: scraped.raw_jd_text || fullPromptText,
      normalized_key: scraped.normalized_key || aiExtracted.normalized_key,
    };
  } catch (err) {
    console.warn(`[AI Parser Warning] Admin scraper AI fallback for ${scraped.title}:`, err);
    return scraped;
  }
}
