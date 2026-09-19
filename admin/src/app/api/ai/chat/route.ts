import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Admin AI Chat Agent
 * Full-control assistant with live DB context. Admin-only.
 */

interface AdminChatPayload {
  message: string;
  history?: Array<{ sender: "bot" | "user"; text: string }>;
  sessionId?: string | null;
}

async function callAdminLLM(systemPrompt: string, userMessage: string): Promise<string | null> {
  const groqKeys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY,
    process.env.AI_API_KEY,
  ].filter(Boolean) as string[];

  const geminiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY,
  ].filter(Boolean) as string[];

  const uniqueGroq = Array.from(new Set(groqKeys));
  const uniqueGemini = Array.from(new Set(geminiKeys));

  for (const key of uniqueGroq) {
    for (const model of ["qwen/qwen3.8-27b", "openai/gpt-oss-120b"]) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 9000);
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model,
            temperature: 0.5,
            max_tokens: 700,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          }),
          signal: ctrl.signal,
        });
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content?.trim()) return content.trim();
        } else if (res.status === 429 || res.status === 503) {
          console.warn(`[Admin AI] Groq key rate-limited (${res.status}), trying next...`);
        }
      } catch (err: any) {
        console.warn(`[Admin AI] Groq failed (${err?.name === "AbortError" ? "timeout" : err?.message}), trying next...`);
      }
    }
  }

  for (const key of uniqueGemini) {
    for (const model of ["gemini-3.6-flash", "gemini-3.8-flash"]) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 9000);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 700 },
          }),
          signal: ctrl.signal,
        });
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content?.trim()) return content.trim();
        } else if (res.status === 429) {
          console.warn("[Admin AI] Gemini key rate-limited, trying next...");
        }
      } catch (err: any) {
        console.warn(`[Admin AI] Gemini failed (${err?.name === "AbortError" ? "timeout" : err?.message}), trying next...`);
      }
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body: AdminChatPayload = await req.json();
    const { message, history = [], sessionId = null } = body;

    const trimmedMsg = (message || "").trim();
    if (!trimmedMsg) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Fetch live platform stats for context grounding
    const [totalListings, activeListings, pendingListings, totalUsers, recentExtractions] = await Promise.all([
      prisma.listing.count().catch(() => 0),
      prisma.listing.count({ where: { status: { in: ["active", "ACTIVE"] } } }).catch(() => 0),
      prisma.listing.count({ where: { status: { in: ["pending", "PENDING"] } } }).catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.extractionLog.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        select: { model_used: true, extraction_status: true, created_at: true },
      }).catch(() => []),
    ]);

    const platformStats = { totalListings, activeListings, pendingListings, totalUsers };

    const systemPrompt = `You are the Siftrole Admin AI Agent - a powerful internal assistant for the Siftrole job board platform admin.

LIVE PLATFORM DATA (REAL-TIME FROM DATABASE):
- Total job listings: ${totalListings}
- Active (live) listings: ${activeListings}
- Pending admin review: ${pendingListings}
- Registered users: ${totalUsers}
- Recent AI extractions (last 5): ${JSON.stringify(recentExtractions)}

YOU CAN HELP THE ADMIN WITH:
1. Platform analytics and stats interpretation
2. Listing management decisions (approve, reject, refine guidance)
3. Company verification and fraud detection strategies
4. User management advice
5. AI extraction quality review and improvement tips
6. Newsletter broadcast strategy and copywriting
7. Technical debugging and troubleshooting
8. Scraper configuration recommendations
9. Any platform operational or business question

STYLE: Be direct, precise, and data-driven. Reference live numbers when relevant. Use markdown formatting freely. For DB mutations, explain what API endpoint or dashboard action to use.`;

    const recentHistory = history
      .slice(-8)
      .map((h) => `${h.sender === "user" ? "Admin" : "Siftrole AI"}: ${h.text}`)
      .join("\n");

    const userPrompt = `Conversation History:
${recentHistory || "No prior messages."}

Admin Message: "${trimmedMsg}"`;

    // Persist user message (fire-and-forget)
    if (sessionId) {
      (prisma as any).chatMessage?.create({
        data: { session_id: sessionId, sender: "user", text: trimmedMsg, metadata: { role: "admin" } },
      }).catch(() => null);
    }

    const reply = await callAdminLLM(systemPrompt, userPrompt);

    if (reply) {
      // Persist AI reply (fire-and-forget)
      if (sessionId) {
        (prisma as any).chatMessage?.create({
          data: { session_id: sessionId, sender: "ai", text: reply, metadata: { role: "admin" } },
        }).catch(() => null);
      }
      return NextResponse.json({ reply, platformStats });
    }

    return NextResponse.json({
      reply: "I am experiencing high load across all AI providers. Please try again in a moment.",
      fallback: true,
      platformStats,
    });
  } catch (error) {
    console.error("Admin AI Chat Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
