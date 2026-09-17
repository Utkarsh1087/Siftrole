import { describe, it } from "node:test";
import assert from "node:assert";
import { ListingSchema } from "../src/lib/scrapers/types";

describe("Listing Schema Validator", () => {
  it("validates a compliant scraped listing object", () => {
    const validListing = {
      title: "Frontend Engineer Intern",
      company: "Figma",
      location: "San Francisco, CA (Hybrid)",
      employment_type: "Internship",
      eligibility: "Graduating 2025 or 2026",
      stipend_or_salary: "$55/hr",
      deadline: "2026-11-30T00:00:00.000Z",
      skills_required: ["TypeScript", "React"],
      experience_level: "Entry Level",
      apply_url: "https://boards.greenhouse.io/figma/jobs/12345",
      source: "scraped",
      status: "active",
      raw_jd_hash: "a".repeat(64),
      raw_jd_text: "Full raw JD snippet here",
      normalized_key: "figma__frontend engineer intern__san francisco ca hybrid",
    };

    const parsed = ListingSchema.safeParse(validListing);
    assert.strictEqual(parsed.success, true);
  });

  it("permits null for unstated fields without inference", () => {
    const partialListing = {
      title: "Backend Engineer",
      company: "Spotify",
      location: "Stockholm, Sweden",
      employment_type: null,
      eligibility: null,
      stipend_or_salary: null,
      deadline: null,
      skills_required: ["Java", "Docker"],
      experience_level: null,
      apply_url: "https://jobs.lever.co/spotify/67890",
      source: "scraped",
      status: "active",
      raw_jd_hash: "b".repeat(64),
      raw_jd_text: null,
      normalized_key: "spotify__backend engineer__stockholm sweden",
    };

    const parsed = ListingSchema.safeParse(partialListing);
    assert.strictEqual(parsed.success, true);
  });

  it("rejects invalid apply_url or missing title", () => {
    const invalidListing = {
      title: "",
      company: "Linear",
      location: "Remote",
      apply_url: "not-a-valid-url",
      source: "manual",
      status: "active",
      raw_jd_hash: "c".repeat(64),
      normalized_key: "linear____remote",
    };

    const parsed = ListingSchema.safeParse(invalidListing);
    assert.strictEqual(parsed.success, false);
  });
});
