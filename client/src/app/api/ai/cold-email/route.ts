import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recruiterName,
      recruiterEmail,
      company,
      roleAppliedFor,
      userCandidateName = "Candidate",
      userBackground = "Computer Science student with full-stack experience",
      keyHighlight = "built production React & Node apps",
      tone = "concise-human",
    } = body;

    const groqApiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;

    let subject = "";
    let emailBody = "";

    const systemPrompt = `You are a cold email expert who writes high-converting, extremely short, authentic, and human cold emails for early-career developers reaching out to tech recruiters.

HARD RULES:
1. Keep the body between 60 to 110 words.
2. NEVER use robotic clichés like "I hope this email finds you well", "I am writing to express my enthusiastic interest", or "Allow me to introduce myself".
3. Write like a humble, sharp, and thoughtful human engineer reaching out casually and directly.
4. Highlight 1 core project/achievement briefly.
5. End with a zero-pressure, polite 1-line ask (e.g., "Would you be open to a quick 5-minute chat or passing my resume to the hiring team?").
6. Output MUST be valid JSON with keys: "subject" and "body".`;

    const userPrompt = `Candidate Name: ${userCandidateName}
Recruiter Name: ${recruiterName}
Company: ${company}
Target Role: ${roleAppliedFor}
Candidate Background: ${userBackground}
Key Project / Highlight: ${keyHighlight}
Desired Tone: ${tone}

Draft a 3 to 5 sentence human-like cold email.`;

    if (groqApiKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.65,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            subject = parsed.subject || `Quick question re: ${roleAppliedFor} at ${company}`;
            emailBody = parsed.body || "";
          }
        }
      } catch (e) {
        console.warn("[Cold Mail AI API] LLM request failed, falling back to dynamic template:", e);
      }
    }

    // Fallback template if LLM is unavailable or offline
    if (!emailBody) {
      const firstName = recruiterName.split(" ")[0];
      subject = `${roleAppliedFor} applicant — ${userCandidateName}`;
      emailBody = `Hi ${firstName},

I noticed you're leading talent at ${company} and wanted to reach out directly regarding the ${roleAppliedFor} opening.

I'm a ${userBackground}, and recently ${keyHighlight}. I've been following ${company}'s work and really admire what the engineering team is shipping.

I know your inbox is full, but if you have 2 minutes, I'd love to share my portfolio and see if my background might be a fit for the team.

Best,
${userCandidateName}`;
    }

    const mailtoUrl = `mailto:${recruiterEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    return NextResponse.json({
      success: true,
      subject,
      body: emailBody,
      mailtoUrl,
    });
  } catch (error) {
    console.error("Cold email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email draft." },
      { status: 500 }
    );
  }
}
