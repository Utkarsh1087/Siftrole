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
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
