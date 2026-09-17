import { AtsAdapter, NormalizedListing } from "./types";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../sync/dedup";

interface LeverJob {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl?: string;
  description?: string;
  descriptionPlain?: string;
  additional?: string;
  additionalPlain?: string;
  categories?: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
  };
  createdAt?: number;
}

export class LeverAdapter implements AtsAdapter {
  name = "Lever";
  type = "LEVER" as const;

  async fetchListings(identifier: string, companyName: string): Promise<NormalizedListing[]> {
    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(identifier)}?mode=json`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Siftrole/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Lever API responded with status ${response.status} for company ${identifier}`);
    }

    const postings: LeverJob[] = await response.json();
    if (!Array.isArray(postings)) {
      return [];
    }

    return postings.map((job) => {
      const rawText = job.descriptionPlain || stripHtml(job.description || "") || `${job.text} at ${companyName}`;
      const location = job.categories?.location || "Remote / Unspecified";
      const title = job.text || "Untitled Role";
      const skills = extractSkillsFromText(`${title} ${rawText}`);
      const employmentType = job.categories?.commitment || null;

      return {
        title,
        company: companyName,
        location,
        employment_type: employmentType,
        eligibility: null,
        stipend_or_salary: null,
        deadline: null,
        skills_required: skills,
        experience_level: /senior|lead|principal|staff/i.test(title) ? "Senior" : (/junior|entry|intern/i.test(title) ? "Entry Level" : "Mid Level"),
        apply_url: job.applyUrl || job.hostedUrl,
        source: "scraped",
        status: "active",
        raw_jd_hash: computeRawJdHash(rawText),
        raw_jd_text: rawText.slice(0, 10000),
        normalized_key: computeNormalizedKey(companyName, title, location),
      };
    });
  }
}

export const leverAdapter = new LeverAdapter();
