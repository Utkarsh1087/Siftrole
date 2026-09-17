import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { computeRawJdHash, computeNormalizedKey } from "@/lib/sync/dedup";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "listings";
    const status = searchParams.get("status");

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
      const pending = await prisma.listing.count({
        where: { status: { in: ["pending_approval", "flagged"] } },
      });
      const manual = await prisma.listing.count({ where: { source: "manual" } });
      const flagged = await prisma.listing.count({ where: { status: "flagged" } });
      const companies = await prisma.company.count();

      return NextResponse.json({
        total,
        active,
        pending,
        manual,
        flagged,
        companies,
      });
    }

    const whereClause: any = {};
    if (status) {
      if (status === "pending") {
        whereClause.status = { in: ["pending_approval", "flagged"] };
      } else {
        whereClause.status = status;
      }
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      include: {
        company_rel: {
          select: { name: true, ats_type: true },
        },
      },
      take: 150,
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
      status: requestedStatus,
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
          status: requestedStatus || "active",
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

    const status = requestedStatus || (nearMatch ? "flagged" : "active");

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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
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
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: title || undefined,
        company: company || undefined,
        location: location || undefined,
        employment_type: employment_type || null,
        eligibility: eligibility || null,
        stipend_or_salary: stipend_or_salary || null,
        deadline: deadline ? new Date(deadline) : null,
        skills_required: Array.isArray(skills_required) ? skills_required : undefined,
        experience_level: experience_level || null,
        apply_url: apply_url || undefined,
        status: status || "active",
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    console.error("Update listing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, action = "approve" } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Array of listing IDs is required." }, { status: 400 });
    }

    const newStatus = action === "reject" ? "rejected" : "active";

    const result = await prisma.listing.updateMany({
      where: { id: { in: ids } },
      data: {
        status: newStatus,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} listings marked as ${newStatus}.`,
      count: result.count,
    });
  } catch (error: any) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
    }

    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Listing deleted successfully." });
  } catch (error: any) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
