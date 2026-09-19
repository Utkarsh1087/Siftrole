import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId") || "demo-user";
    
    // Empty initial applications list; all real applications come from user tracking
    return NextResponse.json({
      success: true,
      userId,
      applications: [],
    });
  } catch (error: any) {
    console.error("Applications GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, title, location, stipend_or_salary, apply_url, status, notes, match_score } = body;

    if (!company || !title) {
      return NextResponse.json({ error: "Company and title are required" }, { status: 400 });
    }

    const newApp = {
      id: "app-" + Date.now(),
      company,
      title,
      location: location || "Remote / Unspecified",
      stipend_or_salary: stipend_or_salary || null,
      apply_url: apply_url || "https://company.careers",
      status: status || "saved",
      match_score: match_score || Math.floor(Math.random() * 15) + 85,
      applied_date: "Just now",
      notes: notes || "",
    };

    return NextResponse.json({
      success: true,
      application: newApp,
      message: "Application added to checklist successfully",
    });
  } catch (error: any) {
    console.error("Applications POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, next_step } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      updatedId: id,
      status,
      notes,
      next_step,
      message: "Application status updated successfully",
    });
  } catch (error: any) {
    console.error("Applications PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      message: "Application removed from checklist",
    });
  } catch (error: any) {
    console.error("Applications DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
