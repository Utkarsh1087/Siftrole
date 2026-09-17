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

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
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
