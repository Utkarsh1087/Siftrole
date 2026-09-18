import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { renderContactEmailHtml } from "@/lib/emails/contactEmailTemplate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, topic, message } = body;

    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter a message before sending." },
        { status: 400 }
      );
    }

    const cleanName = (name || "").trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanTopic = (topic || "Feedback").trim();
    const cleanMessage = message.trim();

    // 1. Save submission to AnalyticsEvent table
    try {
      await prisma.analyticsEvent.create({
        data: {
          event_type: "contact_submission",
          section_name: "faq_contact_form",
          target_element: "submit_button",
          user_agent: req.headers.get("user-agent") || undefined,
          metadata: {
            name: cleanName,
            email: cleanEmail,
            topic: cleanTopic,
            message: cleanMessage,
            received_at: new Date().toISOString(),
          },
        },
      });
    } catch (dbErr) {
      console.warn("Could not save to AnalyticsEvent table:", dbErr);
    }

    // 2. Forward email notification via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddress = process.env.FROM_EMAIL || "Siftrole Feedback <onboarding@resend.dev>";
        const toAddress = process.env.CONTACT_NOTIFICATION_EMAIL || process.env.RESEND_TO_EMAIL || "support@siftrole.in";

        const formattedDate = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const html = renderContactEmailHtml({
          name: cleanName,
          email: cleanEmail,
          topic: cleanTopic,
          message: cleanMessage,
          date: formattedDate,
        });

        await resend.emails.send({
          from: fromAddress,
          to: [toAddress],
          replyTo: cleanEmail,
          subject: `[Siftrole ${cleanTopic}] Message from ${cleanName || cleanEmail}`,
          html,
        });

        console.log(`[Contact API] Email notification delivered to ${toAddress}`);
      } catch (emailErr) {
        console.warn("[Contact API] Resend email delivery error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Our team has received your message.",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
