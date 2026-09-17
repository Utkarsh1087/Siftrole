import { AtsAdapter, NormalizedListing } from "./types";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../sync/dedup";

export class LeverAdapter implements AtsAdapter {
  atsType = "LEVER";

  async fetchListings(atsIdentifier: string, companyName: string): Promise<NormalizedListing[]> {
    const url = `https://api.lever.co/v0/postings/${atsIdentifier}?mode=json`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Siftrole/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Lever API responded with HTTP ${response.status}: ${response.statusText}`);
    }

    const postings = await response.json();
    if (!Array.isArray(postings)) {
      return [];
    }

    return postings.map((job: any): NormalizedListing => {
      const title = job.text?.trim() || "Untitled Role";
      const location =
        job.categories?.location ||
        job.categories?.allLocations?.join(", ") ||
        "Remote / Unspecified";
      const description = job.descriptionPlain || (job.description ? stripHtml(job.description) : "");
      const commitment = job.categories?.commitment || null;
      const rawText = `${title}\n${companyName}\n${location}\n${description}`;
      const rawJdHash = computeRawJdHash(rawText);
      const normalizedKey = computeNormalizedKey(companyName, title, location);
      const skills = extractSkillsFromText(rawText);

      return {
        title,
        company: companyName,
        location,
        employment_type: commitment,
        eligibility: null,
        stipend_or_salary: job.salaryDescription || null,
        deadline: null,
        skills_required: skills,
        experience_level: job.categories?.level || null,
        apply_url: job.hostedUrl || job.applyUrl || `https://jobs.lever.co/${atsIdentifier}/${job.id}`,
        source: "scraped",
        raw_jd_hash: rawJdHash,
        raw_jd_text: rawText.substring(0, 10000),
        normalized_key: normalizedKey,
      };
    });
  }
}
