import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncCompany } from "@/lib/sync/runner";
import { AtsType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { ats_identifier: { contains: search, mode: "insensitive" } },
      ];
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            listings: {
              where: { status: "active" },
            },
          },
        },
      },
    });

    return NextResponse.json({ companies });
  } catch (error: any) {
    console.error("Fetch companies error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, career_page_url, ats_type, ats_identifier, verified } = body;

    if (!name || !career_page_url || !ats_type || !ats_identifier) {
      return NextResponse.json(
        { error: "Company name, career page URL, ATS type, and ATS identifier are required." },
        { status: 400 }
      );
    }

    const created = await prisma.company.create({
      data: {
        name: name.trim(),
        career_page_url: career_page_url.trim(),
        ats_type: ats_type as AtsType,
        ats_identifier: ats_identifier.trim(),
        verified: verified ?? true,
      },
    });

    return NextResponse.json({ success: true, company: created });
  } catch (error: any) {
    console.error("Create company error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, career_page_url, ats_type, ats_identifier, verified, triggerSync } = body;

    if (!id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    if (triggerSync) {
      const syncResult = await syncCompany(id);
      return NextResponse.json({ success: true, syncResult });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: name?.trim(),
        career_page_url: career_page_url?.trim(),
        ats_type: ats_type ? (ats_type as AtsType) : undefined,
        ats_identifier: ats_identifier?.trim(),
        verified: verified !== undefined ? verified : undefined,
      },
    });

    return NextResponse.json({ success: true, company: updated });
  } catch (error: any) {
    console.error("Update company error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Company deleted successfully" });
  } catch (error: any) {
    console.error("Delete company error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
