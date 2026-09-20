import { createHash } from "crypto";

export function computeRawJdHash(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normalized).digest("hex");
}

export function computeNormalizedKey(
  company: string,
  title: string,
  location: string
): string {
  const normCompany = company
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const normTitle = title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const normLocation = location
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `${normCompany}::${normTitle}::${normLocation}`;
}

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Scala",
  "React", "React Native", "Next.js", "Vue", "Angular", "Svelte", "Node.js", "Express", "Django", "FastAPI", "Flask",
  "Spring Boot", "Rails", "GraphQL", "REST", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Git",
  "Machine Learning", "Deep Learning", "NLP", "LLMs", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Tailwind CSS"
];

export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  for (const skill of COMMON_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      found.add(skill);
    }
  }
  return Array.from(found);
}

export function stripHtml(html: string): string {
  if (!html) return "";
  let text = html;

  // 1. Decode double-encoded HTML entities if present (e.g. &lt;div... -> <div...)
  if (text.includes("&lt;") || text.includes("&gt;")) {
    text = text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
  }

  // 2. Convert block elements & breaks to markdown/newlines
  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<h[1-6][^>]*>/gi, "\n\n### ");

  // 3. Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // 4. Strip any broken, truncated, or unclosed HTML tags (e.g. "<span style" at end)
  text = text
    .replace(/<[a-zA-Z\/][^>]*$/g, "")
    .replace(/<[a-zA-Z][^>\n]*\b(?:style|class|id|href|src|color|font)\b[^>\n]*/gi, "")
    .replace(/<[a-zA-Z0-9_\-:]+(\s+[^>]*)?$/g, "");

  // 5. Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&bull;/g, "•")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');

  // 5. Clean up whitespace & line breaks cleanly
  text = text
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return text;
}
