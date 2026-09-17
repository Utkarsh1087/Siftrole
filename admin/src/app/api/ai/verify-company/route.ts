import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyWithAi } from "@/lib/ai/companyVerifier";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      careerPageUrl,
      applyUrl,
      jobTitle,
      jobLocation,
      rawJdSnippet,
      autoApproveCompany,
    } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required for verification." },
        { status: 400 }
      );
    }

    const report = await verifyCompanyWithAi({
      companyName,
      careerPageUrl,
      applyUrl,
      jobTitle,
      jobLocation,
      rawJdSnippet,
    });

    if (autoApproveCompany && report.verdict === "VERIFIED") {
      try {
        await prisma.company.updateMany({
          where: { name: { equals: companyName, mode: "insensitive" } },
          data: { verified: true },
        });
      } catch (dbErr) {
        console.warn("Could not update company verified status in database:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("Company verification endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete company verification" },
      { status: 500 }
    );
  }
}
