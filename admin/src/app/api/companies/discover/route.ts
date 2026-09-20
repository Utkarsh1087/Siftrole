import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { detectAtsFromInput, discoverActiveCompanies, testAtsEndpoint } from "@/lib/scrapers/discovery";
import { AtsType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/companies/discover
 * Discovers active tech companies with verified live jobs via real-time API handshake.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const activeFeeds = await discoverActiveCompanies(limit);

    // Cross-reference with database to flag already added companies
    const existing = await prisma.company.findMany({
      select: { name: true, ats_identifier: true },
    });
    const existingSet = new Set(existing.map((c) => c.ats_identifier.toLowerCase()));

    const results = activeFeeds.map((feed) => ({
      ...feed,
      isAlreadyAdded: existingSet.has(feed.ats_identifier.toLowerCase()),
    }));

    return NextResponse.json({ success: true, count: results.length, companies: results });
  } catch (error: any) {
    console.error("Discovery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/companies/discover
 * Auto-detects ATS provider, company slug, and tests live jobs for any input URL or company name.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input } = body;

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Input string is required." }, { status: 400 });
    }

    const result = await detectAtsFromInput(input);
    return NextResponse.json({ success: result.detected, ...result });
  } catch (error: any) {
    console.error("Auto-detect error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/companies/discover
 * Bulk imports selected verified companies into the database.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { companies } = body;

    if (!Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ error: "Array of companies is required." }, { status: 400 });
    }

    let addedCount = 0;
    const addedCompanies = [];

    for (const comp of companies) {
      const exists = await prisma.company.findFirst({
        where: {
          OR: [
            { name: { equals: comp.name, mode: "insensitive" } },
            { ats_identifier: { equals: comp.ats_identifier, mode: "insensitive" } },
          ],
        },
      });

      if (!exists) {
        const created = await prisma.company.create({
          data: {
            name: comp.name.trim(),
            career_page_url: comp.career_page_url.trim(),
            ats_type: comp.ats_type as AtsType,
            ats_identifier: comp.ats_identifier.trim(),
            verified: true,
          },
        });
        addedCount++;
        addedCompanies.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      addedCount,
      message: `Successfully imported ${addedCount} verified companies into your scraping pool.`,
      companies: addedCompanies,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
