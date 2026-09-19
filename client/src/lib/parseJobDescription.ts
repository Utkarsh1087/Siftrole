export interface StructuredJobDetails {
  summary: string | null;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  cleanDescription: string | null;
  hasStructuredData: boolean;
}

export function parseJobDescription(raw: string | null | undefined): StructuredJobDetails {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return {
      summary: null,
      responsibilities: [],
      qualifications: [],
      benefits: [],
      cleanDescription: null,
      hasStructuredData: false,
    };
  }

  const trimmed = raw.trim();

  // 1. Check if stored as structured JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const summary = parsed.summary || null;
      const responsibilities = Array.isArray(parsed.responsibilities) ? parsed.responsibilities.filter(Boolean) : [];
      const qualifications = Array.isArray(parsed.qualifications) ? parsed.qualifications.filter(Boolean) : [];
      const benefits = Array.isArray(parsed.benefits) ? parsed.benefits.filter(Boolean) : [];
      const cleanDescription = parsed.clean_description || null;

      if (summary || responsibilities.length > 0 || qualifications.length > 0 || benefits.length > 0) {
        return {
          summary,
          responsibilities,
          qualifications,
          benefits,
          cleanDescription,
          hasStructuredData: true,
        };
      }
    } catch (_) {
      // Not JSON, continue to raw text parser
    }
  }

  // 2. Intelligent Raw Text Parser & Garbage Stripper
  // Strip out scraped web artifacts like "info_outline", "X", leading URLs, etc.
  let cleaned = trimmed
    .replace(/^https?:\/\/[^\s\n]+/gm, "")
    .replace(/^info_outline\s*$/gim, "")
    .replace(/^X\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  let summary: string | null = null;
  const responsibilities: string[] = [];
  const qualifications: string[] = [];
  const benefits: string[] = [];

  // Look for About the job / role overview
  const aboutMatch = cleaned.match(
    /(?:about the (?:job|role)|summary|role overview|who we are)[\s:]*([\s\S]*?)(?=(?:responsibilities|duties|what you['’]ll do|minimum qualifications|preferred qualifications|qualifications|benefits|individual pay|$))/i
  );
  if (aboutMatch && aboutMatch[1].trim().length > 20) {
    summary = aboutMatch[1].trim();
  }

  // Look for Responsibilities
  const respMatch = cleaned.match(
    /(?:responsibilities|duties|what you['’]ll do|key responsibilities)[\s:]*([\s\S]*?)(?=(?:minimum qualifications|preferred qualifications|qualifications|requirements|benefits|about the job|$))/i
  );
  if (respMatch) {
    const lines = respMatch[1]
      .split("\n")
      .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
      .filter((s) => s.length > 5 && !/^[A-Z\s]{3,}$/.test(s));
    responsibilities.push(...lines);
  }

  // Look for Minimum / Preferred Qualifications
  const minMatch = cleaned.match(
    /minimum qualifications:?\s*([\s\S]*?)(?=(?:preferred qualifications|about the job|responsibilities|benefits|$))/i
  );
  const prefMatch = cleaned.match(
    /preferred qualifications:?\s*([\s\S]*?)(?=(?:minimum qualifications|about the job|responsibilities|benefits|$))/i
  );
  const generalQualMatch = cleaned.match(
    /(?:qualifications|requirements|what we['’]re looking for):?\s*([\s\S]*?)(?=(?:responsibilities|benefits|about the job|$))/i
  );

  if (minMatch) {
    const lines = minMatch[1]
      .split("\n")
      .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
      .filter((s) => s.length > 5);
    qualifications.push(...lines.map((s) => `Minimum: ${s}`));
  }
  if (prefMatch) {
    const lines = prefMatch[1]
      .split("\n")
      .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
      .filter((s) => s.length > 5);
    qualifications.push(...lines.map((s) => `Preferred: ${s}`));
  }
  if (!minMatch && !prefMatch && generalQualMatch) {
    const lines = generalQualMatch[1]
      .split("\n")
      .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
      .filter((s) => s.length > 5);
    qualifications.push(...lines);
  }

  // Look for Benefits
  const benMatch = cleaned.match(
    /(?:benefits|perks|what we offer|benefits for this role include:?)[\s:]*([\s\S]*?)(?=(?:note:|minimum qualifications|about the job|responsibilities|$))/i
  );
  if (benMatch) {
    const lines = benMatch[1]
      .split("\n")
      .map((s) => s.replace(/^[-*•\d.]\s*/, "").trim())
      .filter((s) => s.length > 5);
    benefits.push(...lines);
  }

  // If no summary was matched by regex, use the first clean paragraph
  if (!summary && cleaned.length > 0) {
    const paragraphs = cleaned.split("\n\n").map((p) => p.trim()).filter((p) => p.length > 20);
    if (paragraphs.length > 0) {
      summary = paragraphs[0];
    }
  }

  const hasStructuredData =
    responsibilities.length > 0 || qualifications.length > 0 || benefits.length > 0;

  return {
    summary: summary || null,
    responsibilities,
    qualifications,
    benefits,
    cleanDescription: cleaned,
    hasStructuredData,
  };
}
