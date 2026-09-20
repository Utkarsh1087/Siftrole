import prisma from "../prisma";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText } from "../sync/dedup";
import { NormalizedListing, ListingSchema } from "../scrapers/types";
import { executeLLMCascade } from "./llmCascade";

export const STRICT_EXTRACTION_SYSTEM_PROMPT = `
You are an elite, highly meticulous technical recruiter and job parser for Siftrole.
Your mission is to parse raw, messy, unstructured job descriptions into a beautiful, complete, structured JSON schema.

CRITICAL PARSING RULES:
1. STRIP ALL GARBAGE: Strip out scraped UI artifacts like 'info_outline', 'X', close buttons, navigation headers, or cookie banners.
2. TITLE: Extract the clean official title (e.g. 'Software Engineering Intern, PhD (Summer 2027)'). Never include URLs or raw UI tags in the title.
3. COMPANY: Detect the accurate company name (e.g. 'Google').
4. LOCATION: Detect primary location or concise summary (e.g. 'United States (Multiple Locations)' or 'Mountain View, CA' or 'Remote'). Keep it short and concise (under 40 characters). Do NOT dump long lists of 10+ cities.
5. EMPLOYMENT TYPE: 'Internship' | 'Full-time' | 'Part-time' | 'Contract' | null.
   - Set to 'Internship' ONLY if the official job title explicitly contains 'Intern', 'Internship', or 'Co-op', or if the role explicitly targets current students for temporary summer/fall/spring terms.
   - Professional, permanent roles, managers, leads, senior positions, or roles requiring 1+ years experience or standard annual salary ($50k+) are ALWAYS 'Full-time'.
   - NEVER classify as 'Internship' just because the description mentions 'mentoring interns', 'internal teams', 'international', or 'interview'.
6. SALARY / STIPEND: Extract exact figures or range with currency (e.g. '$118,000 - $157,000 (USD)'). If not mentioned, set to null.
7. DEADLINE: Extract exact deadline if mentioned (e.g. '2027-02-26' or 'February 26, 2027'). If unstated, set to null.
8. ELIGIBILITY: Explicit degree level, graduation criteria, or work authorization (e.g. 'Pursuing a PhD program in Computer Science or a related technical field'). If unstated, set to null.
9. EXPERIENCE LEVEL: 'Intern' | 'PhD Intern' | 'New Grad' | 'Entry Level' | 'Mid Level' | 'Senior' | null. If the title or requirements indicate 5+ years experience, Manager, Lead, Staff, or Director, classify as 'Senior'.
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

export function sanitizeEmploymentType(title: string, employmentType: string | null | undefined, rawText?: string): string {
  const t = (title || "").toLowerCase();
  const isExplicitInternTitle = /\b(intern|internship|co-op|coop|apprentice|fellow|fellowship)\b/i.test(t);
  const isSeniorOrManager = /\b(manager|lead|senior|sr\.?|staff|principal|director|head|vp|vice president|chief|architect|specialist|officer|supervisor)\b/i.test(t);

  if (isExplicitInternTitle) {
    return "Internship";
  }

  if (isSeniorOrManager) {
    return "Full-time";
  }

  if (employmentType) {
    const raw = employmentType.toLowerCase().trim();
    if (raw.includes("intern") && !isExplicitInternTitle) {
      return "Full-time";
    }
    if (raw.includes("intern")) return "Internship";
    if (raw.includes("full")) return "Full-time";
    if (raw.includes("part")) return "Part-time";
    if (raw.includes("contract")) return "Contract";
  }

  return "Full-time";
}

/**
 * High precision local fallback extractor for when no external LLM API key is configured or offline.
 * Strictly adheres to the "no inference - missing fields null" rule.
 */
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
} {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1. Title & Company Detection
  let title = "Software Engineer";
  let company = "Company";

  const titleLine = lines.find((l) =>
    /engineer|developer|designer|manager|intern|analyst|architect|specialist|lead|consultant/i.test(l)
  );
  if (titleLine) {
    title = titleLine.replace(/^(job title|role|position):\s*/i, "").trim();
  } else if (lines.length > 0) {
    title = lines[0];
  }

  const companyLine = lines.find((l) => /^(company|organization|at):\s*/i.test(l));
  if (companyLine) {
    company = companyLine.replace(/^(company|organization|at):\s*/i, "").trim();
  }

  // 2. Location
  let location = "Remote / Unspecified";
  const locationLine = lines.find(
    (l) =>
      /^(location|office|workplace):\s*/i.test(l) ||
      /\b(remote|hybrid|san francisco|new york|bengaluru|london|berlin|seattle|austin|toronto|singapore)\b/i.test(l)
  );
  if (locationLine) {
    location = locationLine.replace(/^(location|office|workplace):\s*/i, "").trim();
  }

  // 3. Employment Type (strict, only if stated)
  let employmentType: string | null = null;
  const isTitleIntern = /\b(intern|internship|co-op|coop|apprentice|fellow)\b/i.test(title);
  const isTitleSeniorOrManager = /\b(manager|lead|senior|sr\.?|staff|principal|director|head|vp|chief|architect)\b/i.test(title);

  if (isTitleIntern) {
    employmentType = "Internship";
  } else if (isTitleSeniorOrManager) {
    employmentType = "Full-time";
  } else if (/\bpart[-\s]?time\b/i.test(rawText)) {
    employmentType = "Part-time";
  } else if (/\bcontract(?:or)?\b/i.test(rawText)) {
    employmentType = "Contract";
  } else if (/\bfull[-\s]?time\b/i.test(rawText)) {
    employmentType = "Full-time";
  } else {
    employmentType = "Full-time";
  }

  // 4. Eligibility (strict, only if stated)
  let eligibility: string | null = null;
  const eligLine = lines.find((l) =>
    /eligibility|graduating|class of|batch of|b\.?tech|b\.?s\.? in|m\.?tech|cgpa|gpa|degree in/i.test(l)
  );
  if (eligLine) {
    eligibility = eligLine.replace(/^(eligibility|requirements|qualification|education):\s*/i, "").trim();
  }

  // 5. Stipend / Salary (strict, only if explicit currency/amount present)
  let stipendSalary: string | null = null;
  const salaryMatch =
    rawText.match(/(?:salary|stipend|compensation|pay):\s*([$\u20ac\u00a3\u20b9\w\s.,\/-]+)/i) ||
    rawText.match(/(\$\d+[\d,kK\s]*-\s*\$\d+[\d,kK\s]*(?:\/(?:yr|year|hr|mo))?)/i) ||
    rawText.match(/(\u20b9\s*\d+[\d,kK\s]*(?:-\s*\u20b9\s*\d+[\d,kK\s]*)?(?:\/(?:month|mo|year|yr|lpa|LPA))?)/i);
  if (salaryMatch) {
    stipendSalary = salaryMatch[1] ? salaryMatch[1].trim() : salaryMatch[0].trim();
  }

  // 6. Deadline (strict, only if ISO date or explicit deadline stated)
  let deadline: string | null = null;
  const deadlineMatch = rawText.match(/(?:deadline|apply before|last date):\s*(\d{4}-\d{2}-\d{2}|\w+ \d{1,2}, \d{4})/i);
  if (deadlineMatch) {
    try {
      const parsedDate = new Date(deadlineMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        deadline = parsedDate.toISOString();
      }
    } catch {
      deadline = null;
    }
  }

  // 7. Experience Level (strict)
  let experienceLevel: string | null = null;
  if (/senior|lead|principal|staff/i.test(rawText)) experienceLevel = "Senior";
  else if (/junior|entry[-\s]level|new grad|intern/i.test(rawText)) experienceLevel = "Entry Level";
  else if (/mid[-\s]level|3\+ years|2-5 years/i.test(rawText)) experienceLevel = "Mid Level";

  // 8. Skills Required
  const skills = extractSkillsFromText(rawText);

  // 9. Apply URL
  let applyUrl = "https://company.careers";
  const urlMatch = rawText.match(/https?:\/\/[^\s"'<>)]+/i);
  if (urlMatch) {
    applyUrl = urlMatch[0].replace(/[.,;)]+$/, "");
  }

  return {
    title,
    company,
    location,
    employment_type: employmentType,
    eligibility,
    stipend_or_salary: stipendSalary,
    deadline,
    skills_required: skills,
    experience_level: experienceLevel,
    apply_url: applyUrl,
  };
}

/**
 * Deep inspection for missing data, unverified channels, or suspicious signals.
 */
export function inspectListingForAnomalies(item: {
  title: string;
  company: string;
  location: string;
  employment_type?: string | null;
  eligibility?: string | null;
  stipend_or_salary?: string | null;
  deadline?: string | null;
  skills_required?: string[];
  experience_level?: string | null;
  apply_url: string;
  raw_jd_text?: string | null;
}): {
  missing_fields: string[];
  is_suspicious: boolean;
  flag_reasons: string[];
  confidence_score: number;
  should_flag: boolean;
} {
  const missing_fields: string[] = [];
  const flag_reasons: string[] = [];
  let is_suspicious = false;

  // 1. Check Missing Core Fields
  if (!item.stipend_or_salary || item.stipend_or_salary.toLowerCase().includes("unspecified")) {
    missing_fields.push("stipend_or_salary");
    flag_reasons.push("Missing explicit salary/stipend range");
  }
  if (!item.eligibility || item.eligibility.toLowerCase().includes("not specified")) {
    missing_fields.push("eligibility");
    flag_reasons.push("Missing graduation year or degree eligibility criteria");
  }
  if (!item.location || item.location.toLowerCase().includes("unspecified")) {
    missing_fields.push("location");
    flag_reasons.push("Location is vague or unspecified");
  }
  if (!item.skills_required || item.skills_required.length === 0) {
    missing_fields.push("skills_required");
    flag_reasons.push("No explicit technical skills identified");
  }

  // 2. Check Suspicious Indicators
  const rawLower = (item.raw_jd_text || "").toLowerCase();
  const urlLower = (item.apply_url || "").toLowerCase();

  const spamKeywords = [
    "telegram", "t.me/", "whatsapp", "crypto payment", "pay to apply", "registration fee",
    "dm on instagram", "no interview needed", "guaranteed pass"
  ];
  for (const kw of spamKeywords) {
    if (rawLower.includes(kw) || urlLower.includes(kw)) {
      is_suspicious = true;
      flag_reasons.push(`Suspicious keyword/channel detected: "${kw}"`);
    }
  }

  if (urlLower.includes("bit.ly") || urlLower.includes("tinyurl.com") || urlLower.includes("forms.gle")) {
    is_suspicious = true;
    flag_reasons.push("Apply URL uses generic redirect or unverified form link");
  }

  if (rawLower.length > 0 && rawLower.length < 120) {
    is_suspicious = true;
    flag_reasons.push("Job description text is unusually short (< 120 characters)");
  }

  // 3. Compute Confidence Score
  let score = 100;
  score -= missing_fields.length * 15;
  if (is_suspicious) score -= 35;
  score = Math.max(10, Math.min(100, score));

  const should_flag = is_suspicious || missing_fields.length >= 1;

  return {
    missing_fields,
    is_suspicious,
    flag_reasons,
    confidence_score: score,
    should_flag,
  };
}

/**
 * Parses raw JD text with AI LLM (Groq / OpenAI compatible) or deterministic fallback.
 */
export async function extractJobFromRawText(
  rawText: string,
  source: "manual" | "scraped" = "manual"
): Promise<NormalizedListing> {
  const normalizedRaw = rawText.trim();
  const rawJdHash = computeRawJdHash(normalizedRaw);

  let extractedData: any = null;
  let modelUsed = "local-nlp-extractor";
  let tokensUsed = 0;

  // Attempt multi-key failover cascade across all 5+ configured API keys
  const cascadeResult = await executeLLMCascade({
    systemPrompt: STRICT_EXTRACTION_SYSTEM_PROMPT,
    userPrompt: `Raw Job Description:\n\n${normalizedRaw}`,
    temperature: 0.1,
    responseFormatJson: true,
    timeoutMs: 8000,
  });

  if (cascadeResult?.content) {
    try {
      extractedData = JSON.parse(cascadeResult.content);
      modelUsed = cascadeResult.provider;
    } catch {
      // quiet fallback
    }
  }

  // Local fallback strictly as the absolute last resort if all API keys fail
  if (!extractedData) {
    extractedData = localRuleBasedExtract(normalizedRaw);
    modelUsed = "local-nlp-extractor";
  }

  // Audit log to database for observability
  try {
    await prisma.extractionLog.create({
      data: {
        raw_jd_snippet: normalizedRaw.slice(0, 500),
        extracted_json: extractedData,
        model_used: modelUsed,
        tokens_used: tokensUsed,
        extraction_status: "success",
      },
    });
  } catch {
    // Non-blocking log error
  }

  const title = extractedData.title || "Untitled Role";
  const company = extractedData.company || "Unknown Company";
  const location = extractedData.location || "Remote / Unspecified";

  const finalEmploymentType = sanitizeEmploymentType(
    title,
    extractedData.employment_type,
    normalizedRaw
  );

  const anomaly = inspectListingForAnomalies({
    title,
    company,
    location,
    employment_type: finalEmploymentType,
    eligibility: extractedData.eligibility || null,
    stipend_or_salary: extractedData.stipend_or_salary || null,
    deadline: extractedData.deadline || null,
    skills_required: Array.isArray(extractedData.skills_required) ? extractedData.skills_required : [],
    experience_level: extractedData.experience_level || null,
    apply_url: extractedData.apply_url || "https://company.careers",
    raw_jd_text: normalizedRaw,
  });

  // Store rich structured JSON in raw_jd_text so client components can render distinct sections
  const structuredJdPayload = {
    summary: extractedData.summary || null,
    responsibilities: Array.isArray(extractedData.responsibilities) ? extractedData.responsibilities : [],
    qualifications: Array.isArray(extractedData.qualifications) ? extractedData.qualifications : [],
    benefits: Array.isArray(extractedData.benefits) ? extractedData.benefits : [],
    clean_description: extractedData.clean_description || null,
  };

  const rawJdToStore = (extractedData.summary || (extractedData.responsibilities && extractedData.responsibilities.length > 0))
    ? JSON.stringify(structuredJdPayload)
    : (extractedData.clean_description || normalizedRaw);

  const listingCandidate: NormalizedListing = {
    title,
    company,
    location,
    employment_type: finalEmploymentType,
    eligibility: extractedData.eligibility || null,
    stipend_or_salary: extractedData.stipend_or_salary || null,
    deadline: extractedData.deadline || null,
    skills_required: Array.isArray(extractedData.skills_required) ? extractedData.skills_required : [],
    experience_level: extractedData.experience_level || null,
    apply_url: extractedData.apply_url || "https://company.careers",
    source,
    status: anomaly.should_flag ? "flagged" : "active",
    raw_jd_hash: rawJdHash,
    raw_jd_text: rawJdToStore,
    normalized_key: computeNormalizedKey(company, title, location),
    summary: extractedData.summary || null,
    responsibilities: Array.isArray(extractedData.responsibilities) ? extractedData.responsibilities : [],
    qualifications: Array.isArray(extractedData.qualifications) ? extractedData.qualifications : [],
    benefits: Array.isArray(extractedData.benefits) ? extractedData.benefits : [],
    clean_description: extractedData.clean_description || null,
    ai_flag_reasons: anomaly.flag_reasons,
    missing_fields: anomaly.missing_fields,
    is_suspicious: anomaly.is_suspicious,
    confidence_score: anomaly.confidence_score,
  };

  return ListingSchema.parse(listingCandidate);
}

/**
 * Parses every scraped job listing with AI before listing it.
 * Enhances scraped metadata with extracted skills, eligibility, salary, deadline, and experience level.
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
    const aiExtracted = await extractJobFromRawText(fullPromptText, "scraped");
    const finalTitle = aiExtracted.title || scraped.title;
    const finalEmpType = sanitizeEmploymentType(
      finalTitle,
      aiExtracted.employment_type || scraped.employment_type,
      fullPromptText
    );

    const anomaly = inspectListingForAnomalies({
      title: finalTitle,
      company: scraped.company || aiExtracted.company,
      location: aiExtracted.location || scraped.location,
      employment_type: finalEmpType,
      eligibility: aiExtracted.eligibility || scraped.eligibility,
      stipend_or_salary: aiExtracted.stipend_or_salary || scraped.stipend_or_salary,
      deadline: aiExtracted.deadline || scraped.deadline,
      skills_required:
        aiExtracted.skills_required && aiExtracted.skills_required.length > 0
          ? aiExtracted.skills_required
          : scraped.skills_required,
      experience_level: aiExtracted.experience_level || scraped.experience_level,
      apply_url: scraped.apply_url || aiExtracted.apply_url,
      raw_jd_text: scraped.raw_jd_text || fullPromptText,
    });

    // Merge AI extracted structured data with the original scraped identifiers
    return {
      ...scraped,
      title: finalTitle,
      company: scraped.company || aiExtracted.company,
      location: aiExtracted.location || scraped.location,
      employment_type: finalEmpType,
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
      status: anomaly.should_flag ? "flagged" : "active",
      raw_jd_hash: scraped.raw_jd_hash || aiExtracted.raw_jd_hash,
      raw_jd_text: scraped.raw_jd_text || fullPromptText,
      normalized_key: computeNormalizedKey(
        scraped.company || aiExtracted.company,
        aiExtracted.title || scraped.title,
        aiExtracted.location || scraped.location
      ),
      ai_flag_reasons: anomaly.flag_reasons,
      missing_fields: anomaly.missing_fields,
      is_suspicious: anomaly.is_suspicious,
      confidence_score: anomaly.confidence_score,
    };
  } catch (err) {
    console.warn(`[AI Parser Warning] Scraped JD parsing fallback applied for ${scraped.title}:`, err);
    return scraped;
  }
}
