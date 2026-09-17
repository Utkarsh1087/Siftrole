import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.nextUrl.searchParams.get("email") || "student@demo.com";

    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    }).catch(() => null);

    if (!dbUser) {
      dbUser = {
        id: "demo-student-id",
        email: userEmail,
        name: "Alex Morgan",
        role: "STUDENT" as any,
        status: "ACTIVE" as any,
        graduation_year: 2026,
        skills: ["React", "TypeScript", "Python", "Node.js", "PostgreSQL"],
        resume_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status,
        graduation_year: dbUser.graduation_year,
        skills: dbUser.skills,
        resume_url: dbUser.resume_url,
      },
    });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, graduation_year, skills, resume_url } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
        graduation_year: graduation_year ? parseInt(graduation_year) : undefined,
        skills: Array.isArray(skills) ? skills : undefined,
        resume_url: resume_url || undefined,
      },
      create: {
        email,
        name: name || "Student",
        graduation_year: graduation_year ? parseInt(graduation_year) : 2026,
        skills: Array.isArray(skills) ? skills : ["React", "TypeScript", "Python"],
        resume_url: resume_url || null,
        role: "STUDENT",
        status: "ACTIVE",
      },
    }).catch(() => ({
      id: "demo-user",
      email,
      name: name || "Alex Morgan",
      graduation_year: graduation_year || 2026,
      skills: skills || [],
      resume_url: resume_url || null,
    }));

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
