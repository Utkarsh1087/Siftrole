import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role && role !== "ALL") where.role = role as UserRole;
    if (status && status !== "ALL") where.status = status as UserStatus;

    const users = await prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const totalCount = await prisma.user.count();
    const activeCount = await prisma.user.count({ where: { status: "ACTIVE" } });
    const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });

    return NextResponse.json({
      users,
      stats: {
        total: totalCount,
        active: activeCount,
        students: studentCount,
      },
    });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, role, status, graduation_year, skills, resume_url } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and full name are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    const created = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: (role as UserRole) || UserRole.STUDENT,
        status: (status as UserStatus) || UserStatus.ACTIVE,
        graduation_year: graduation_year ? Number(graduation_year) : null,
        skills: Array.isArray(skills) ? skills : [],
        resume_url: resume_url ? resume_url.trim() : null,
      },
    });

    return NextResponse.json({ success: true, user: created });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, role, status, graduation_year, skills, resume_url } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        email: email ? email.trim().toLowerCase() : undefined,
        name: name ? name.trim() : undefined,
        role: role ? (role as UserRole) : undefined,
        status: status ? (status as UserStatus) : undefined,
        graduation_year: graduation_year !== undefined ? (graduation_year ? Number(graduation_year) : null) : undefined,
        skills: Array.isArray(skills) ? skills : undefined,
        resume_url: resume_url !== undefined ? (resume_url ? resume_url.trim() : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
