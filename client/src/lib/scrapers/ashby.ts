import { AtsAdapter, NormalizedListing } from "./types";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../sync/dedup";

interface AshbyJob {
  id: string;
  title: string;
  location?: string;
  department?: string;
  employmentType?: string;
  isRemote?: boolean;
  jobUrl?: string;
  applyUrl?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  publishedAt?: string;
  compensationTierSummary?: string;
}

export class AshbyAdapter implements AtsAdapter {
  name = "Ashby";
  type = "ASHBY" as const;

  async fetchListings(identifier: string, companyName: string): Promise<NormalizedListing[]> {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(identifier)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Siftrole/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Ashby API responded with status ${response.status} for board ${identifier}`);
    }

    const data = await response.json();
    const jobs: AshbyJob[] = data.jobs || [];

    return jobs.map((job) => {
      const rawText = job.descriptionPlain || stripHtml(job.descriptionHtml || "") || `${job.title} at ${companyName}`;
      const location = job.location || (job.isRemote ? "Remote" : "Unspecified");
      const title = job.title || "Untitled Role";
      const skills = extractSkillsFromText(`${title} ${rawText}`);

      return {
        title,
        company: companyName,
        location,
        employment_type: job.employmentType || null,
        eligibility: null,
        stipend_or_salary: job.compensationTierSummary || null,
        deadline: null,
        skills_required: skills,
        experience_level: /senior|lead|principal|staff/i.test(title) ? "Senior" : (/junior|entry|intern/i.test(title) ? "Entry Level" : "Mid Level"),
        apply_url: job.applyUrl || job.jobUrl || `https://jobs.ashbyhq.com/${identifier}/${job.id}`,
        source: "scraped",
        status: "active",
        raw_jd_hash: computeRawJdHash(rawText),
        raw_jd_text: rawText.slice(0, 10000),
        normalized_key: computeNormalizedKey(companyName, title, location),
      };
    });
  }
}

export const ashbyAdapter = new AshbyAdapter();
