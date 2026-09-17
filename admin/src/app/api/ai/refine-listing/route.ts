import { NextRequest, NextResponse } from "next/server";
import { parseScrapedListingWithAi } from "@/lib/ai/extractor";
import { NormalizedListing } from "@/lib/scrapers/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      company,
      location,
      employment_type,
      stipend_or_salary,
      skills_required,
      experience_level,
      raw_jd_text,
      apply_url,
    } = body;

    const rawListing: NormalizedListing = {
      title: title || "Software Engineer",
      company: company || "Tech Company",
      location: location || "Remote",
      employment_type: employment_type || null,
      eligibility: null,
      stipend_or_salary: stipend_or_salary || null,
      deadline: null,
      skills_required: Array.isArray(skills_required) ? skills_required : [],
      experience_level: experience_level || null,
      apply_url: apply_url || "https://siftrole.com",
      source: "scraped",
      raw_jd_text: raw_jd_text || `${title || ""} ${company || ""} ${location || ""}`,
      raw_jd_hash: "temp",
      normalized_key: "temp",
    };

    const refined = await parseScrapedListingWithAi(rawListing);

    return NextResponse.json({
      success: true,
      refined: {
        title: refined.title,
        company: refined.company,
        location: refined.location,
        employment_type: refined.employment_type,
        eligibility: refined.eligibility,
        stipend_or_salary: refined.stipend_or_salary,
        skills_required: refined.skills_required,
        experience_level: refined.experience_level,
        deadline: refined.deadline,
        apply_url: refined.apply_url || apply_url,
      },
    });
  } catch (error: any) {
    console.error("AI Refinement Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refine listing with AI" },
      { status: 500 }
    );
  }
}
