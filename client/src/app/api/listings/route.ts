import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const company = searchParams.get("company") || "";
    const roleType = searchParams.get("roleType") || "";
    const source = searchParams.get("source") || "";
    const status = searchParams.get("status") || "active";

    const where: any = {};

    if (status !== "all") {
      where.status = status;
    }

    if (company && company !== "all") {
      where.company = { equals: company, mode: "insensitive" };
    }

    if (roleType && roleType !== "all") {
      where.employment_type = { contains: roleType, mode: "insensitive" };
    }

    if (source && source !== "all") {
      where.source = source;
    }

    if (search.trim()) {
      const trimmed = search.trim();
      const stopWords = new Set([
        "a", "an", "the", "in", "at", "for", "with", "on", "and", "or", "to", "of", "be", "me", "any", "some", "all", "job", "jobs", "role", "roles", "opening", "openings", "position", "positions"
      ]);

      const tokens = trimmed
        .toLowerCase()
        .replace(/[?,.!:;()\[\]]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 1 && !stopWords.has(t));

      const orConditions: any[] = [
        { title: { contains: trimmed, mode: "insensitive" } },
        { company: { contains: trimmed, mode: "insensitive" } },
        { location: { contains: trimmed, mode: "insensitive" } },
      ];

      for (const token of tokens) {
        orConditions.push({ title: { contains: token, mode: "insensitive" } });
        orConditions.push({ company: { contains: token, mode: "insensitive" } });
        orConditions.push({ location: { contains: token, mode: "insensitive" } });
        orConditions.push({ normalized_title: { contains: token, mode: "insensitive" } });
      }

      where.OR = orConditions;
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        company_rel: {
          select: { name: true, ats_type: true },
        },
      },
      take: 100,
    });

    // Get unique companies list for filter dropdowns
    const companies = await prisma.company.findMany({
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      listings,
      companies: companies.map(c => c.name),
      total: listings.length,
    });
  } catch (error: any) {
    console.error("Public listings fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
