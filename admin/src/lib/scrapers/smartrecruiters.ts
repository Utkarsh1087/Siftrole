import { AtsAdapter, NormalizedListing } from "./types";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../sync/dedup";

export class SmartRecruitersAdapter implements AtsAdapter {
  atsType = "SMARTRECRUITERS";

  async fetchListings(atsIdentifier: string, companyName: string): Promise<NormalizedListing[]> {
    const url = `https://api.smartrecruiters.com/v1/companies/${atsIdentifier}/postings`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Siftrole/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`SmartRecruiters API responded with HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const postings = data.content || [];

    return postings.map((job: any): NormalizedListing => {
      const title = job.name?.trim() || "Untitled Role";
      const locParts = [
        job.location?.city,
        job.location?.region,
        job.location?.country,
      ].filter(Boolean);
      const location = locParts.length > 0 ? locParts.join(", ") : (job.location?.remote ? "Remote" : "Unspecified");
      const typeOfEmployment = job.typeOfEmployment?.label || null;
      const experienceLevel = job.experienceLevel?.label || null;
      const rawText = `${title}\n${companyName}\n${location}\n${job.department?.label || ""}`;
      const rawJdHash = computeRawJdHash(rawText);
      const normalizedKey = computeNormalizedKey(companyName, title, location);
      const skills = extractSkillsFromText(rawText);

      return {
        title,
        company: companyName,
        location,
        employment_type: typeOfEmployment,
        eligibility: null,
        stipend_or_salary: null,
        deadline: null,
        skills_required: skills,
        experience_level: experienceLevel,
        apply_url: `https://jobs.smartrecruiters.com/${atsIdentifier}/${job.id}`,
        source: "scraped",
        raw_jd_hash: rawJdHash,
        raw_jd_text: rawText.substring(0, 10000),
        normalized_key: normalizedKey,
      };
    });
  }
}
