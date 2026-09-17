import { AtsAdapter, NormalizedListing } from "./types";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../sync/dedup";

export class AshbyAdapter implements AtsAdapter {
  atsType = "ASHBY";

  async fetchListings(atsIdentifier: string, companyName: string): Promise<NormalizedListing[]> {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${atsIdentifier}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Siftrole/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Ashby API responded with HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const jobs = data.jobs || [];

    return jobs.map((job: any): NormalizedListing => {
      const title = job.title?.trim() || "Untitled Role";
      const location = job.location || job.secondaryLocations?.join(", ") || (job.isRemote ? "Remote" : "Unspecified");
      const description = job.descriptionPlain || (job.descriptionHtml ? stripHtml(job.descriptionHtml) : "");
      const rawText = `${title}\n${companyName}\n${location}\n${description}`;
      const rawJdHash = computeRawJdHash(rawText);
      const normalizedKey = computeNormalizedKey(companyName, title, location);
      const skills = extractSkillsFromText(rawText);

      return {
        title,
        company: companyName,
        location,
        employment_type: job.employmentType || null,
        eligibility: null,
        stipend_or_salary: job.compensation ? JSON.stringify(job.compensation) : null,
        deadline: null,
        skills_required: skills,
        experience_level: null,
        apply_url: job.jobUrl || `https://jobs.ashbyhq.com/${atsIdentifier}/${job.id}`,
        source: "scraped",
        raw_jd_hash: rawJdHash,
        raw_jd_text: rawText.substring(0, 10000),
        normalized_key: normalizedKey,
      };
    });
  }
}
