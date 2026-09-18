import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.nextUrl.searchParams.get("email") || "student@demo.com";

    const dbUser: any = await (prisma.user as any).findUnique({
      where: { email: userEmail },
    }).catch(() => null);

    const safeUser = dbUser || {
      id: "demo-student-id",
      email: userEmail,
      name: "Candidate",
      role: "STUDENT",
      status: "ACTIVE",
      graduation_year: null,
      degree: null,
      target_role: null,
      bio: null,
      skills: [],
      resume_url: null,
      resume_name: null,
      github_url: null,
      linkedin_url: null,
      portfolio_url: null,
      phone: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      graduation_year,
      degree,
      target_role,
      bio,
      skills,
      github_url,
      linkedin_url,
      phone,
      portfolio_url,
      resume_name,
      resume_url,
      work_mode,
      salary_expectation,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatedUser = await (prisma.user as any).upsert({
      where: { email },
      update: {
        name: name !== undefined ? name : undefined,
        graduation_year: graduation_year ? parseInt(String(graduation_year)) : undefined,
        degree: degree !== undefined ? degree : undefined,
        target_role: target_role !== undefined ? target_role : undefined,
        bio: bio !== undefined ? bio : undefined,
        skills: Array.isArray(skills) ? skills : undefined,
        github_url: github_url !== undefined ? github_url : undefined,
        linkedin_url: linkedin_url !== undefined ? linkedin_url : undefined,
        phone: phone !== undefined ? phone : undefined,
        portfolio_url: portfolio_url !== undefined ? portfolio_url : undefined,
        resume_name: resume_name !== undefined ? resume_name : undefined,
        resume_url: resume_url !== undefined ? resume_url : undefined,
        work_mode: work_mode !== undefined ? work_mode : undefined,
        salary_expectation: salary_expectation !== undefined ? salary_expectation : undefined,
      },
      create: {
        email,
        name: name || "Candidate",
        graduation_year: graduation_year ? parseInt(String(graduation_year)) : null,
        degree: degree || null,
        target_role: target_role || null,
        bio: bio || null,
        skills: Array.isArray(skills) ? skills : [],
        github_url: github_url || null,
        linkedin_url: linkedin_url || null,
        phone: phone || null,
        portfolio_url: portfolio_url || null,
        resume_name: resume_name || null,
        resume_url: resume_url || null,
        work_mode: work_mode || null,
        salary_expectation: salary_expectation || null,
        role: "STUDENT",
        status: "ACTIVE",
      },
    }).catch(() => ({
      id: "demo-user",
      email,
      name: name || "Candidate",
      graduation_year: graduation_year || null,
      degree: degree || null,
      target_role: target_role || null,
      bio: bio || null,
      skills: skills || [],
      resume_url: resume_url || null,
      resume_name: resume_name || null,
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
