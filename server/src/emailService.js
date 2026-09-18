const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Initialize Resend client if API key is provided
let resendClient = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

// Fallback nodemailer transporter
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal_password',
      },
    });
  }

  return transporter;
}

const FROM_SENDER = process.env.FROM_EMAIL || 'Siftrole <onboarding@resend.dev>';
const APP_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const EMAIL_FONT_STACK = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const GOOGLE_FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">`;

/**
 * Sends a 1-click magic confirmation link email
 */
async function sendOtpVerificationEmail({ email, verificationLink }) {
  const subject = `Confirm your Siftrole Job Alerts subscription`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm your subscription</title>
      ${GOOGLE_FONT_LINK}
      <style>
        body, table, td, p, a, h1, h2, h3 {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
      </style>
    </head>
    <body style="background-color: #f8fafc; margin: 0; padding: 40px 15px; font-family: ${EMAIL_FONT_STACK}; color: #334155; -webkit-font-smoothing: antialiased;">
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 1px 3px rgba(15,23,42,0.04);">
        <tbody>
          <tr>
            <td>
              <!-- Header Logo -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: #0f172a;">
                  Sift<span style="color: #16a34a;">role</span>
                </span>
              </div>

              <h1 style="font-size: 19px; font-weight: 600; color: #0f172a; margin: 0 0 12px; line-height: 1.35;">
                Confirm your job alert subscription
              </h1>
              
              <p style="font-size: 13.5px; line-height: 22px; color: #64748b; margin: 0 0 24px; font-weight: 400;">
                Please click the button below to confirm your email and activate daily alerts for verified tech openings, internships, and startup opportunities.
              </p>

              <!-- 1-Click Magic Button -->
              <div style="margin: 28px 0; text-align: center;">
                <a href="${verificationLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 11px 26px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); letter-spacing: 0.01em;">
                  Confirm Subscription &rarr;
                </a>
              </div>

              <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 20px 0 0; font-weight: 400;">
                Button not working? You can also copy and open this link in your browser:<br />
                <a href="${verificationLink}" style="color: #2563eb; word-break: break-all; text-decoration: underline;">${verificationLink}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;" />

              <p style="font-size: 11.5px; line-height: 18px; color: #94a3b8; margin: 0; font-weight: 400;">
                If you did not request this email, no further action is required. You can safely ignore this message.
              </p>
              
              <p style="font-size: 11px; line-height: 16px; color: #cbd5e1; margin: 12px 0 0; font-weight: 400;">
                &copy; 2026 Siftrole. All rights reserved.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `.trim();

  // 1. Try sending via Resend API
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: FROM_SENDER,
        to: [email],
        subject,
        html,
      });

      if (response.data?.id) {
        console.log(`[Email Service] OTP email delivered via Resend to ${email} (ID: ${response.data.id})`);
        return { success: true, method: 'resend', id: response.data.id };
      }
      if (response.error) {
        console.warn(`[Email Service] Resend API response error for ${email}:`, response.error);
        if (response.error.message?.includes('testing emails to your own email address')) {
          console.log(`[Resend Sandbox Notice] To send to ${email}, please verify your domain in Resend or test with utkarsh.rajput.2005@gmail.com`);
        }
      }
    } catch (resendErr) {
      console.warn(`[Email Service] Resend error:`, resendErr);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  try {
    const mailClient = getTransporter();
    await mailClient.sendMail({
      from: FROM_SENDER,
      to: email,
      subject,
      html,
    });
    console.log(`[Email Service] OTP email delivered via SMTP to ${email}`);
    return { success: true, method: 'smtp' };
  } catch (smtpErr) {
    console.warn(`[Email Service] SMTP error:`, smtpErr);
  }

  return { success: true, simulated: true };
}

/**
 * Sends a welcome confirmation digest with top verified openings
 */
async function sendWelcomeNewsletterEmail({ email, recentListings = [] }) {
  const subject = 'Welcome to Siftrole! Your daily job alerts are active';
  const listingsHtml = (recentListings || []).slice(0, 4).map((job) => `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;">
      <div style="font-size: 11px; font-weight: 600; color: #16a34a; letter-spacing: 0.02em;">${job.company}</div>
      <div style="font-size: 14px; font-weight: 500; color: #1e293b; margin: 3px 0;">${job.title}</div>
      <div style="font-size: 12px; color: #64748b; font-weight: 400;">${job.location} • <strong style="color:#0f172a; font-weight: 500;">${job.stipend_or_salary || 'Competitive'}</strong></div>
      <div style="margin-top: 10px;">
        <a href="${job.apply_url || `${APP_URL}/jobs/${job.id}`}" style="display:inline-block; background:#0f172a; color:#ffffff; font-size:12px; font-weight:500; padding:6px 14px; border-radius:6px; text-decoration:none;" target="_blank">
          View Role & Apply &rarr;
        </a>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Siftrole</title>
      ${GOOGLE_FONT_LINK}
      <style>
        body, table, td, p, a, h1, h2, h3 {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
      </style>
    </head>
    <body style="background-color: #f8fafc; margin: 0; padding: 40px 15px; font-family: ${EMAIL_FONT_STACK}; color: #334155; -webkit-font-smoothing: antialiased;">
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 1px 3px rgba(15,23,42,0.04);">
        <tbody>
          <tr>
            <td>
              <div style="margin-bottom: 24px;">
                <span style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: #0f172a;">
                  Sift<span style="color: #16a34a;">role</span>
                </span>
              </div>

              <h1 style="font-size: 19px; font-weight: 600; color: #0f172a; margin: 0 0 12px; line-height: 1.35;">
                You are now subscribed to Siftrole Radar
              </h1>
              <p style="font-size: 13.5px; line-height: 22px; color: #64748b; margin: 0 0 20px; font-weight: 400;">
                Your email is confirmed. You will receive verified tech openings, early career internships, and founder outreach alerts.
              </p>

              <h3 style="font-size: 13.5px; font-weight: 600; color: #0f172a; margin: 24px 0 12px;">
                Featured Open Roles:
              </h3>
              ${listingsHtml}

              <div style="text-align: center; margin: 24px 0;">
                <a href="${APP_URL}/jobs" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 11px 24px; border-radius: 8px;" target="_blank">
                  Browse All Opportunities &rarr;
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;" />

              <p style="font-size: 11.5px; line-height: 16px; color: #94a3b8; margin: 0; font-weight: 400;">
                You received this email because you subscribed on Siftrole.<br />
                <a href="${APP_URL}/unsubscribe-newsletter?email=${encodeURIComponent(email)}" style="color: #2563eb; text-decoration: underline;">Unsubscribe from alerts</a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `.trim();

  if (resendClient) {
    try {
      await resendClient.emails.send({
        from: FROM_SENDER,
        to: [email],
        subject,
        html,
      });
      return { success: true };
    } catch (err) {
      console.warn('Resend welcome email error:', err);
    }
  }

  return { success: true };
}

/**
 * Broadcasts a job alert digest to multiple active subscribers
 */
async function sendJobAlertDigestEmail({ to, listings = [], subject, headline, customNote }) {
  if (!listings || listings.length === 0) return { success: false, error: "No listings provided" };

  const emailSubject = subject || `We found new verified openings: do not miss these opportunities`;
  const emailHeadline = headline || "We found new verified openings: do not miss these opportunities";

  const listingsHtml = listings.map((job) => `
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(15,23,42,0.02);">
      <div style="font-size: 11.5px; font-weight: 600; color: #16a34a; letter-spacing: 0.02em; margin-bottom: 4px;">
        ${job.company || "Verified Company"}
      </div>
      <div style="font-size: 15px; font-weight: 500; color: #0f172a; margin: 0 0 6px; line-height: 1.35;">
        ${job.title || "Software Engineering Role"}
      </div>
      <div style="font-size: 12.5px; color: #64748b; margin-bottom: 14px; font-weight: 400;">
        <span>${job.location || "Remote / Hybrid"}</span>
        <span style="margin: 0 8px; color: #cbd5e1;">•</span>
        <strong style="color: #1e293b; font-weight: 500;">${job.stipend_or_salary || "Competitive Compensation"}</strong>
        ${job.employment_type ? `<span style="margin: 0 8px; color: #cbd5e1;">•</span><span>${job.employment_type}</span>` : ""}
      </div>
      <div>
        <a href="${job.apply_url || `${APP_URL}/jobs/${job.id}`}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 12.5px; font-weight: 500; padding: 8px 18px; border-radius: 7px; text-decoration: none;" target="_blank">
          View Role & Apply &rarr;
        </a>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailSubject}</title>
      ${GOOGLE_FONT_LINK}
      <style>
        body, table, td, p, a, h1, h2, h3 {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
      </style>
    </head>
    <body style="background-color: #f8fafc; margin: 0; padding: 40px 15px; font-family: ${EMAIL_FONT_STACK}; color: #334155; -webkit-font-smoothing: antialiased;">
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 1px 3px rgba(15,23,42,0.04);">
        <tbody>
          <tr>
            <td>
              <!-- Header Logo -->
              <div style="margin-bottom: 22px;">
                <span style="font-size: 21px; font-weight: 600; letter-spacing: -0.02em; color: #0f172a;">
                  Sift<span style="color: #16a34a;">role</span>
                </span>
                <span style="display: inline-block; font-size: 11px; font-weight: 500; color: #64748b; letter-spacing: 0.04em; border-left: 1px solid #e2e8f0; padding-left: 10px; margin-left: 10px;">
                  Job Radar Alert
                </span>
              </div>

              <h1 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 12px; line-height: 1.4;">
                ${emailHeadline}
              </h1>

              ${customNote ? `
                <div style="background-color: #f8fafc; border-left: 3px solid #16a34a; padding: 12px 16px; border-radius: 6px; font-size: 13px; line-height: 20px; color: #475569; margin: 0 0 20px; font-weight: 400;">
                  ${customNote}
                </div>
              ` : `
                <p style="font-size: 13.5px; line-height: 22px; color: #64748b; margin: 0 0 20px; font-weight: 400;">
                  New high-priority roles matching our verified criteria were just published. Review the details below and apply directly:
                </p>
              `}

              ${listingsHtml}

              <div style="text-align: center; margin: 28px 0 18px;">
                <a href="${APP_URL}/jobs" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 13.5px; font-weight: 500; padding: 12px 28px; border-radius: 8px;" target="_blank">
                  View All Open Opportunities on Siftrole &rarr;
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px;" />
              <p style="font-size: 11.5px; line-height: 18px; color: #94a3b8; margin: 0; text-align: center; font-weight: 400;">
                You received this digest because you are subscribed to Siftrole Job Alerts.<br />
                <a href="${APP_URL}/unsubscribe-newsletter?email=${encodeURIComponent(to)}" style="color: #2563eb; text-decoration: underline;">Unsubscribe from alerts</a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `.trim();

  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: FROM_SENDER,
        to: [to],
        subject: emailSubject,
        html,
      });
      return { success: true, id: response.data?.id };
    } catch (err) {
      console.warn('Resend digest error:', err);
    }
  }

  return { success: true, simulated: true };
}

module.exports = {
  sendOtpVerificationEmail,
  sendWelcomeNewsletterEmail,
  sendJobAlertDigestEmail,
};
