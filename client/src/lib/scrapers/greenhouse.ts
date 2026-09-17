import { AtsAdapter, NormalizedListing } from "./types";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../sync/dedup";

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location?: {
    name?: string;
  };
  content?: string;
  updated_at?: string;
  departments?: Array<{ name: string }>;
  offices?: Array<{ name: string; location?: string }>;
  metadata?: Array<{ name: string; value: any }>;
}

export class GreenhouseAdapter implements AtsAdapter {
  name = "Greenhouse";
  type = "GREENHOUSE" as const;

  async fetchListings(identifier: string, companyName: string): Promise<NormalizedListing[]> {
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(identifier)}/jobs?content=true`;
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Siftrole/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Greenhouse API responded with status ${response.status} for board ${identifier}`);
    }

    const data = await response.json();
    const jobs: GreenhouseJob[] = data.jobs || [];

    return jobs.map((job) => {
      const rawText = stripHtml(job.content || "") || `${job.title} at ${companyName}`;
      const location = job.location?.name || "Remote / Unspecified";
      const title = job.title || "Untitled Role";
      const skills = extractSkillsFromText(`${title} ${rawText}`);

      // Inspect metadata for employment type if available
      let employmentType: string | null = null;
      if (job.metadata) {
        const empTypeMeta = job.metadata.find(m => /employment|type|commitment/i.test(m.name));
        if (empTypeMeta && typeof empTypeMeta.value === "string") {
          employmentType = empTypeMeta.value;
        }
      }

      if (!employmentType) {
        if (/intern|internship/i.test(title)) employmentType = "Internship";
        else if (/full[-\s]time/i.test(title)) employmentType = "Full time";
        else if (/part[-\s]time/i.test(title)) employmentType = "Part time";
        else if (/contract/i.test(title)) employmentType = "Contract";
      }

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
        apply_url: job.absolute_url,
        source: "scraped",
        status: "active",
        raw_jd_hash: computeRawJdHash(rawText),
        raw_jd_text: rawText.slice(0, 10000),
        normalized_key: computeNormalizedKey(companyName, title, location),
      };
    });
  }
}

export const greenhouseAdapter = new GreenhouseAdapter();
