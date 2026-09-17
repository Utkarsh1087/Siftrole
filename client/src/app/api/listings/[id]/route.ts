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

    // Also get similar roles
    const similarRoles = await prisma.listing.findMany({
      where: {
        id: { not: id },
        status: "active",
        OR: [
          { company: listing.company },
          { employment_type: listing.employment_type },
        ],
      },
      take: 4,
    });

    return NextResponse.json({ listing, similarRoles });
  } catch (error: any) {
    console.error("Single listing fetch error:", error);
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

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...body,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    console.error("Update listing error:", error);
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

    return NextResponse.json({ success: true, message: "Listing deleted" });
  } catch (error: any) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

