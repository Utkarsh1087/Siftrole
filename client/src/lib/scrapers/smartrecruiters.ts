import { AtsAdapter, NormalizedListing } from "./types";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../sync/dedup";

interface SmartRecruitersPosting {
  id: string;
  name: string;
  uuid?: string;
  refNumber?: string;
  company?: {
    name?: string;
    identifier?: string;
  };
  location?: {
    city?: string;
    region?: string;
    country?: string;
    remote?: boolean;
  };
  typeOfEmployment?: {
    id?: string;
    label?: string;
  };
  experienceLevel?: {
    id?: string;
    label?: string;
  };
  releasedDate?: string;
  creator?: {
    name?: string;
  };
  actions?: {
    details?: string;
  };
}

export class SmartRecruitersAdapter implements AtsAdapter {
  name = "SmartRecruiters";
  type = "SMARTRECRUITERS" as const;

  async fetchListings(identifier: string, companyName: string): Promise<NormalizedListing[]> {
    const url = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(identifier)}/postings?limit=100`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Siftrole/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`SmartRecruiters API responded with status ${response.status} for company ${identifier}`);
    }

    const data = await response.json();
    const postings: SmartRecruitersPosting[] = data.content || [];

    return postings.map((job) => {
      const locParts = [
        job.location?.city,
        job.location?.region,
        job.location?.country,
      ].filter(Boolean);
      
      let location = locParts.join(", ") || "Unspecified";
      if (job.location?.remote) {
        location = location ? `${location} (Remote)` : "Remote";
      }

      const title = job.name || "Untitled Role";
      const rawText = `${title} - ${companyName} (${location}). Ref: ${job.refNumber || ""}`;
      const skills = extractSkillsFromText(title);

      return {
        title,
        company: companyName,
        location,
        employment_type: job.typeOfEmployment?.label || null,
        eligibility: null,
        stipend_or_salary: null,
        deadline: null,
        skills_required: skills,
        experience_level: job.experienceLevel?.label || (/senior|lead|principal|staff/i.test(title) ? "Senior" : (/junior|entry|intern/i.test(title) ? "Entry Level" : "Mid Level")),
        apply_url: `https://jobs.smartrecruiters.com/${identifier}/${job.id}`,
        source: "scraped",
        status: "active",
        raw_jd_hash: computeRawJdHash(rawText),
        raw_jd_text: rawText,
        normalized_key: computeNormalizedKey(companyName, title, location),
      };
    });
  }
}

export const smartRecruitersAdapter = new SmartRecruitersAdapter();
