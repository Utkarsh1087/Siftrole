import crypto from "crypto";

/**
 * Normalizes JD text by collapsing whitespace, stripping unneeded control chars,
 * and computing a deterministic SHA-256 hash.
 */
export function computeRawJdHash(rawText: string): string {
  if (!rawText || typeof rawText !== "string") {
    return crypto.createHash("sha256").update("").digest("hex");
  }

  // Normalize: lowercased, collapse multiple spaces/newlines to single space, trim
  const normalized = rawText
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  return crypto.createHash("sha256").update(normalized, "utf8").digest("hex");
}

/**
 * Computes a normalized key from company + title + location:
 * lowercased, trimmed, and stripped of punctuation for near-match deduplication.
 */
export function computeNormalizedKey(
  company: string,
  title: string,
  location: string
): string {
  const sanitize = (str: string) =>
    (str || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // remove punctuation
      .replace(/\s+/g, " ")
      .trim();

  return `${sanitize(company)}__${sanitize(title)}__${sanitize(location)}`;
}

/**
 * Extracts candidate tech skills from job title or description snippet using basic keyword recognition.
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];

  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
    "Java", "C++", "C#", "Go", "Golang", "Rust", "Swift", "Kotlin",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Git", "Linux",
    "Tailwind CSS", "Figma", "Machine Learning", "AI", "PyTorch", "TensorFlow",
    "HTML", "CSS", "REST", "CI/CD", "DevOps"
  ];

  const lowerText = text.toLowerCase();
  const matched = new Set<string>();

  for (const skill of commonSkills) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(lowerText)) {
      matched.add(skill);
    }
  }

  return Array.from(matched);
}

/**
 * Strips HTML tags safely from rich description content.
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+([.,;:!?])/g, "$1") // clean space before punctuation
    .replace(/\s+/g, " ")
    .trim();
}
