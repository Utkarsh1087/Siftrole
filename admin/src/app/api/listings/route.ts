import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { computeRawJdHash, computeNormalizedKey } from "@/lib/sync/dedup";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "listings";

    if (view === "logs") {
      const logs = await prisma.extractionLog.findMany({
        take: 30,
        orderBy: { created_at: "desc" },
      });
      return NextResponse.json({ logs });
    }

    if (view === "stats") {
      const total = await prisma.listing.count();
      const active = await prisma.listing.count({ where: { status: "active" } });
      const manual = await prisma.listing.count({ where: { source: "manual" } });
      const flagged = await prisma.listing.count({ where: { status: "flagged" } });
      const companies = await prisma.company.count();

      return NextResponse.json({
        total,
        active,
        manual,
        flagged,
        companies,
      });
    }

    const listings = await prisma.listing.findMany({
      orderBy: { created_at: "desc" },
      include: {
        company_rel: {
          select: { name: true, ats_type: true },
        },
      },
      take: 100,
    });

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error("Admin listings fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      company,
      location,
      employment_type,
      eligibility,
      stipend_or_salary,
      deadline,
      skills_required,
      experience_level,
      apply_url,
      raw_jd_text,
    } = body;

    if (!title || !company || !location || !apply_url) {
      return NextResponse.json(
        { error: "Title, company, location, and apply URL are required fields." },
        { status: 400 }
      );
    }

    const rawJdHash = computeRawJdHash(raw_jd_text || `${title} ${company} ${location}`);
    const normalizedKey = computeNormalizedKey(company, title, location);

    let companyRecord = await prisma.company.findFirst({
      where: { name: { equals: company, mode: "insensitive" } },
    });

    if (!companyRecord) {
      companyRecord = await prisma.company.create({
        data: {
          name: company,
          career_page_url: apply_url,
          ats_type: "MANUAL",
          ats_identifier: company.toLowerCase().replace(/\s+/g, "-"),
          verified: true,
        },
      });
    }

    const existing = await prisma.listing.findFirst({
      where: { raw_jd_hash: rawJdHash },
    });

    if (existing) {
      const updated = await prisma.listing.update({
        where: { id: existing.id },
        data: {
          title,
          location,
          employment_type: employment_type || null,
          eligibility: eligibility || null,
          stipend_or_salary: stipend_or_salary || null,
          deadline: deadline ? new Date(deadline) : null,
          skills_required: Array.isArray(skills_required) ? skills_required : [],
          experience_level: experience_level || null,
          apply_url,
          status: "active",
          updated_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        listing: updated,
        isUpdate: true,
      });
    }

    const nearMatch = await prisma.listing.findFirst({
      where: {
        normalized_key: normalizedKey,
        status: "active",
      },
    });

    const status = nearMatch ? "flagged" : "active";

    const newListing = await prisma.listing.create({
      data: {
        company_id: companyRecord.id,
        title,
        company,
        location,
        employment_type: employment_type || null,
        eligibility: eligibility || null,
        stipend_or_salary: stipend_or_salary || null,
        deadline: deadline ? new Date(deadline) : null,
        skills_required: Array.isArray(skills_required) ? skills_required : [],
        experience_level: experience_level || null,
        apply_url,
        source: "manual",
        status,
        raw_jd_hash: rawJdHash,
        raw_jd_text: raw_jd_text || null,
        normalized_key: normalizedKey,
      },
    });

    return NextResponse.json({
      success: true,
      listing: newListing,
      isUpdate: false,
    });
  } catch (error: any) {
    console.error("Save manual listing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
