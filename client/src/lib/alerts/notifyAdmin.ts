import prisma from "@/lib/prisma";

let lastAlertTime = 0;
const ALERT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes cooldown between alert emails

export async function notifyAdminApiLimitReached(details: {
  provider: string;
  model: string;
  statusCode?: number;
  errorMessage?: string;
}) {
  const now = Date.now();
  const timeSinceLast = now - lastAlertTime;

  console.error(`[ADMIN ALERT] AI API Key limit reached: Provider ${details.provider}, Model: ${details.model}`);

  // 1. Always record in DB Analytics / Alerts table
  try {
    await prisma.analyticsEvent.create({
      data: {
        event_type: "ADMIN_ALERT_API_LIMIT",
        section_name: "ai_llm_cascade",
        target_element: details.provider,
        metadata: {
          provider: details.provider,
          model: details.model,
          status_code: details.statusCode || 429,
          error: details.errorMessage || "Rate limit exceeded / Quota reached",
          timestamp: new Date().toISOString(),
        },
      },
    }).catch(() => null);
  } catch (err) {
    console.warn("Could not record API limit event to DB:", err);
  }

  // 2. Throttle email dispatch to avoid spamming the admin
  if (timeSinceLast < ALERT_COOLDOWN_MS) {
    console.log(`[ADMIN ALERT] Email notification throttled (${Math.round((ALERT_COOLDOWN_MS - timeSinceLast) / 1000)}s remaining in cooldown).`);
    return;
  }

  lastAlertTime = now;

  // 3. Dispatch Email Alert via Resend to Admin
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromAddress = process.env.FROM_EMAIL || "Siftrole Urgent Alerts <onboarding@resend.dev>";
      const toAddress =
        process.env.CONTACT_NOTIFICATION_EMAIL ||
        process.env.RESEND_TO_EMAIL ||
        "utkarsh.rajput.2005@gmail.com";

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9f8; margin: 0; padding: 24px; }
          .card { background-color: #ffffff; border-radius: 18px; border: 2px solid #ef4444; padding: 32px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.1); }
          .badge { display: inline-block; background-color: #fee2e2; color: #b91c1c; font-weight: 800; font-size: 11px; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px; border: 1px solid #fecaca; }
          h2 { color: #111827; margin: 0 0 10px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
          p { color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
          .detail-box { background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 18px; margin: 20px 0; }
          .detail-item { font-size: 13px; color: #374151; margin-bottom: 8px; }
          .detail-item:last-child { margin-bottom: 0; }
          .detail-item strong { color: #111827; }
          .action-box { background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 12px; padding: 16px; margin-top: 20px; }
          .action-title { font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px; }
          .action-text { font-size: 12px; color: #1a422f; margin: 0; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">🚨 URGENT INFRASTRUCTURE ALERT</span>
          <h2>AI API Key Rate Limit Reached</h2>
          <p>Your primary AI provider has reached its API request quota or rate limit. Sift AI is masking this to candidates as temporary server traffic, but you should take action immediately.</p>
          
          <div class="detail-box">
            <div class="detail-item"><strong>Provider:</strong> ${details.provider}</div>
            <div class="detail-item"><strong>Model:</strong> ${details.model}</div>
            <div class="detail-item"><strong>Status Code:</strong> <span style="color:#b91c1c; font-weight:700;">${details.statusCode || 429} (Rate Limit Exceeded)</span></div>
            <div class="detail-item"><strong>Server Time:</strong> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} IST</div>
            ${details.errorMessage ? `<div class="detail-item"><strong>Raw Response:</strong> <code>${details.errorMessage.slice(0, 150)}</code></div>` : ""}
          </div>

          <div class="action-box">
            <div class="action-title">Recommended Quick Fix:</div>
            <p class="action-text">Add additional API keys to <code>client/.env.local</code> (e.g., <code>GEMINI_API_KEY</code>, <code>GROQ_API_KEY_2</code>, or <code>OPENAI_API_KEY</code>) to restore instant capacity.</p>
          </div>
        </div>
        <div class="footer">Siftrole Production Monitoring &bull; Automated Alert System</div>
      </body>
      </html>
      `;

      await resend.emails.send({
        from: fromAddress,
        to: toAddress,
        subject: `🚨 [URGENT] Siftrole Alert: AI API Key Limit Reached (${details.provider})`,
        html: htmlContent,
      });

      console.log(`[ADMIN ALERT] Urgent email dispatched successfully to ${toAddress}`);
    } catch (emailErr) {
      console.warn("[ADMIN ALERT] Failed to send urgent alert email via Resend:", emailErr);
    }
  }
}
