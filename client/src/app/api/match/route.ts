import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { extractSkillsFromText } from "@/lib/sync/dedup";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, candidateSkills, listingId, listingSkills } = body;

    let targetSkills: string[] = listingSkills || [];
    let roleTitle = "Target Role";
    let companyName = "Company";

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { title: true, company: true, skills_required: true, raw_jd_text: true },
      }).catch(() => null);

      if (listing) {
        roleTitle = listing.title;
        companyName = listing.company;
        targetSkills = listing.skills_required && listing.skills_required.length > 0
          ? listing.skills_required
          : extractSkillsFromText(listing.raw_jd_text || listing.title);
      }
    }

    if (targetSkills.length === 0) {
      targetSkills = ["Python", "JavaScript", "React", "Data Structures", "Git"];
    }

    // Extract skills from resume text or user skills
    const parsedResumeSkills: string[] = Array.isArray(candidateSkills) && candidateSkills.length > 0
      ? candidateSkills
      : resumeText
      ? extractSkillsFromText(resumeText)
      : ["React", "TypeScript", "Node.js", "SQL"];

    const normalizedResume = parsedResumeSkills.map((s) => s.toLowerCase());
    const matchedSkills = targetSkills.filter((s) =>
      normalizedResume.some((rs) => rs === s.toLowerCase() || rs.includes(s.toLowerCase()) || s.toLowerCase().includes(rs))
    );

    const missingSkills = targetSkills.filter(
      (s) => !matchedSkills.includes(s)
    );

    const matchRatio = targetSkills.length > 0 ? matchedSkills.length / targetSkills.length : 0.6;
    const matchScore = Math.round(55 + matchRatio * 42);

    const recommendations: string[] = [];
    if (missingSkills.length > 0) {
      recommendations.push(`Highlight any experience with ${missingSkills.slice(0, 3).join(", ")} in your project bullet points.`);
    }
    recommendations.push("Quantify your project outcomes (e.g. 'reduced query latency by 35%') to score higher with hiring managers.");

    return NextResponse.json({
      success: true,
      roleTitle,
      companyName,
      matchScore: Math.min(99, Math.max(50, matchScore)),
      matchedSkills,
      missingSkills,
      totalRequiredSkills: targetSkills.length,
      recommendations,
    });
  } catch (error: any) {
    console.error("Match calculation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
