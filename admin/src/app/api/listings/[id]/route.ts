import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        company_rel: {
          select: { name: true, ats_type: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Job listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error: any) {
    console.error("Admin single listing fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      status,
      raw_jd_text,
    } = body;

    const dataToUpdate: any = {
      updated_at: new Date(),
    };

    if (title !== undefined) dataToUpdate.title = title;
    if (company !== undefined) dataToUpdate.company = company;
    if (location !== undefined) dataToUpdate.location = location;
    if (employment_type !== undefined) dataToUpdate.employment_type = employment_type;
    if (eligibility !== undefined) dataToUpdate.eligibility = eligibility;
    if (stipend_or_salary !== undefined) dataToUpdate.stipend_or_salary = stipend_or_salary;
    if (deadline !== undefined) dataToUpdate.deadline = deadline ? new Date(deadline) : null;
    if (skills_required !== undefined) dataToUpdate.skills_required = skills_required;
    if (experience_level !== undefined) dataToUpdate.experience_level = experience_level;
    if (apply_url !== undefined) dataToUpdate.apply_url = apply_url;
    if (status !== undefined) dataToUpdate.status = status;
    if (raw_jd_text !== undefined) dataToUpdate.raw_jd_text = raw_jd_text;

    const updated = await prisma.listing.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      listing: updated,
      message: status === "active" ? "Role approved and published to Master Checklist!" : "Role updated successfully",
    });
  } catch (error: any) {
    console.error("Admin update listing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error: any) {
    console.error("Admin delete listing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
