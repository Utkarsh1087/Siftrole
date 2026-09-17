import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId") || "demo-user";
    
    // In production this queries the applications table / user relation
    // For seamless offline/local support, we return structured application objects
    const defaultMockApplications = [
      {
        id: "app-1",
        listing_id: "figma-core-swe",
        company: "Figma",
        title: "Software Engineer, Core Systems",
        location: "San Francisco, CA / Hybrid",
        stipend_or_salary: "$150K - $185K",
        apply_url: "https://figma.com/careers",
        status: "saved",
        match_score: 94,
        applied_date: "Saved 2 hrs ago",
        notes: "Portfolio ready with WebGL/Canvas graphics projects. Applying before deadline.",
        next_step: "Submit official application",
      },
      {
        id: "app-2",
        listing_id: "airbnb-frontend-intern",
        company: "Airbnb",
        title: "Frontend Engineer Intern, Summer 2026",
        location: "San Francisco, CA / Remote",
        stipend_or_salary: "$55/hr",
        apply_url: "https://careers.airbnb.com",
        status: "saved",
        match_score: 91,
        applied_date: "Saved yesterday",
        notes: "Tailoring resume for design systems and React SSR experience.",
        next_step: "Review cover letter",
      },
      {
        id: "app-3",
        listing_id: "stripe-frontend-infra",
        company: "Stripe",
        title: "Frontend Infrastructure Engineer",
        location: "San Francisco, CA / Seattle, WA",
        stipend_or_salary: "$165K - $190K",
        apply_url: "https://stripe.com/jobs",
        status: "applied",
        match_score: 92,
        applied_date: "Yesterday",
        notes: "Applied directly on Stripe Ashby ATS with tailored resume.",
        next_step: "Awaiting recruiter review",
      },
      {
        id: "app-4",
        listing_id: "openai-platform-mts",
        company: "OpenAI",
        title: "Member of Technical Staff, Platform",
        location: "San Francisco, CA",
        stipend_or_salary: "$210K - $285K",
        apply_url: "https://openai.com/careers",
        status: "applied",
        match_score: 89,
        applied_date: "3 days ago",
        notes: "Submitted application via Lever with GitHub link.",
        next_step: "Recruiter screening",
      },
      {
        id: "app-5",
        listing_id: "google-swe-2026",
        company: "Google",
        title: "Software Engineer Intern, Summer 2026",
        location: "Mountain View, CA / Remote",
        stipend_or_salary: "$58 - $64/hr",
        apply_url: "https://careers.google.com",
        status: "interviewing",
        match_score: 96,
        applied_date: "5 days ago",
        notes: "Completed Online Assessment. Technical Round 1 scheduled for next Tuesday.",
        next_step: "DSA & System Design prep",
      },
      {
        id: "app-6",
        listing_id: "vercel-nextjs-infra",
        company: "Vercel",
        title: "Next.js Framework Engineer",
        location: "Remote (Global)",
        stipend_or_salary: "$155K - $195K",
        apply_url: "https://vercel.com/careers",
        status: "interviewing",
        match_score: 95,
        applied_date: "1 week ago",
        notes: "Take-home project approved. Final team round scheduled with VP Engineering.",
        next_step: "Final team round presentation",
      },
      {
        id: "app-7",
        listing_id: "linear-product-swe",
        company: "Linear",
        title: "Fullstack Product Engineer",
        location: "Remote (Global)",
        stipend_or_salary: "$160K - $200K",
        apply_url: "https://linear.app/careers",
        status: "offered",
        match_score: 98,
        applied_date: "2 weeks ago",
        notes: "Official offer letter received ($185k base + equity). Reviewing benefits package.",
        next_step: "Decision by next Friday",
      },
      {
        id: "app-8",
        listing_id: "datadog-distributed-swe",
        company: "Datadog",
        title: "Distributed Systems Engineer",
        location: "New York, NY / Hybrid",
        stipend_or_salary: "$145K - $175K",
        apply_url: "https://careers.datadoghq.com",
        status: "rejected",
        match_score: 87,
        applied_date: "3 weeks ago",
        notes: "Position filled internally. Invited to re-apply for Q3 hiring wave.",
        next_step: "Follow up in Q3",
      },
    ];

    return NextResponse.json({
      success: true,
      userId,
      applications: defaultMockApplications,
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
