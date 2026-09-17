import { AtsAdapter, NormalizedListing } from "./types";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../sync/dedup";

export class GreenhouseAdapter implements AtsAdapter {
  atsType = "GREENHOUSE";

  async fetchListings(atsIdentifier: string, companyName: string): Promise<NormalizedListing[]> {
    const url = `https://boards-api.greenhouse.io/v1/boards/${atsIdentifier}/jobs?content=true`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Siftrole/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Greenhouse API responded with HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const jobs = data.jobs || [];

    return jobs.map((job: any): NormalizedListing => {
      const title = job.title?.trim() || "Untitled Role";
      const location = job.location?.name?.trim() || "Remote / Unspecified";
      const cleanContent = job.content ? stripHtml(job.content) : "";
      const rawText = `${title}\n${companyName}\n${location}\n${cleanContent}`;
      const rawJdHash = computeRawJdHash(rawText);
      const normalizedKey = computeNormalizedKey(companyName, title, location);
      const skills = extractSkillsFromText(rawText);

      return {
        title,
        company: companyName,
        location,
        employment_type: null,
        eligibility: null,
        stipend_or_salary: null,
        deadline: null,
        skills_required: skills,
        experience_level: null,
        apply_url: job.absolute_url || `https://boards.greenhouse.io/${atsIdentifier}/jobs/${job.id}`,
        source: "scraped",
        raw_jd_hash: rawJdHash,
        raw_jd_text: rawText.substring(0, 10000),
        normalized_key: normalizedKey,
      };
    });
  }
}
