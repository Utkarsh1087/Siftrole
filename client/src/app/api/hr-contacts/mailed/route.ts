import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.nextUrl.searchParams.get("email") || req.headers.get("x-user-email");
    
    if (!userEmail) {
      return NextResponse.json({ success: true, mailedContactIds: [] });
    }

    const user: any = await (prisma.user as any).findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, bio: true },
    }).catch(() => null);

    if (!user) {
      return NextResponse.json({ success: true, mailedContactIds: [] });
    }

    // Parse mailed_hr_ids stored in user bio/metadata json safely
    let mailedContactIds: string[] = [];
    try {
      if (user.bio && user.bio.startsWith("DATA:")) {
        const meta = JSON.parse(user.bio.replace("DATA:", ""));
        if (Array.isArray(meta.mailed_hr_ids)) {
          mailedContactIds = meta.mailed_hr_ids;
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      mailedContactIds,
    });
  } catch (error: any) {
    console.error("Error fetching mailed HR contacts:", error);
    return NextResponse.json({ success: true, mailedContactIds: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, contactId, action } = body;

    if (!email || !contactId) {
      return NextResponse.json({ error: "Email and contactId are required" }, { status: 400 });
    }

    const user: any = await (prisma.user as any).findUnique({
      where: { email },
    }).catch(() => null);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let meta: any = {};
    try {
      if (user.bio && user.bio.startsWith("DATA:")) {
        meta = JSON.parse(user.bio.replace("DATA:", ""));
      }
    } catch {}

    let currentMailed: string[] = Array.isArray(meta.mailed_hr_ids) ? meta.mailed_hr_ids : [];
    const set = new Set(currentMailed);

    if (action === "unmark") {
      set.delete(contactId);
    } else if (action === "toggle") {
      if (set.has(contactId)) {
        set.delete(contactId);
      } else {
        set.add(contactId);
      }
    } else {
      // Default: mark as mailed
      set.add(contactId);
    }

    const updatedList = Array.from(set);
    meta.mailed_hr_ids = updatedList;

    await (prisma.user as any).update({
      where: { email },
      data: {
        bio: `DATA:${JSON.stringify(meta)}`,
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      isMailed: set.has(contactId),
      mailedContactIds: updatedList,
    });
  } catch (error: any) {
    console.error("Error updating mailed HR contact:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
