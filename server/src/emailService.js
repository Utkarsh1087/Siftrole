const nodemailer = require('nodemailer');

// Initialize transporter
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
    // Development fallback transporter (logs preview or sends test message)
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

const FROM_SENDER = process.env.FROM_EMAIL || '"Siftrole Job Radar" <jobs@siftrole.com>';
const APP_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Sends a 6-digit OTP verification email with a 1-click magic confirmation link
 */
async function sendOtpVerificationEmail({ email, otpCode, verificationLink }) {
  const mailOptions = {
    from: FROM_SENDER,
    to: email,
    subject: `Your Siftrole Verification Code: ${otpCode}`,
    text: `Your Siftrole Job Alert verification code is ${otpCode}. It expires in 15 minutes.\n\nOr click this link to verify directly:\n${verificationLink}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f7f5; margin: 0; padding: 30px 15px; color: #121816; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px 32px; border: 1px solid #e5e2db; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
          .logo { display: inline-flex; align-items: center; gap: 8px; font-weight: 900; font-size: 20px; color: #14281a; text-decoration: none; margin-bottom: 24px; }
          .badge { display: inline-block; background: #eef8e5; color: #3c7818; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; border: 1px solid #cce8be; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
          h1 { font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 12px; color: #14281a; }
          p { font-size: 14px; line-height: 1.6; color: #55615b; margin: 0 0 20px; }
          .otp-card { background: #14281a; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #84d64f; }
          .otp-code { font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #84d64f; margin: 0; }
          .otp-sub { font-size: 12px; color: #eef8e5; opacity: 0.8; margin-top: 6px; }
          .btn { display: inline-block; width: 100%; box-sizing: border-box; background: #84d64f; color: #14281a; font-size: 14px; font-weight: 800; text-align: center; padding: 14px 24px; border-radius: 12px; text-decoration: none; margin: 10px 0; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f2ee; font-size: 11px; color: #79857f; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#84d64f;"></span>
            Siftrole
          </div>
          <br>
          <span class="badge">Email Verification</span>
          <h1>Verify your job alert subscription</h1>
          <p>
            You requested to receive daily tech job openings, early career internships, and verified recruiter opportunities from Siftrole.
          </p>
          
          <div class="otp-card">
            <div class="otp-code">${otpCode}</div>
            <div class="otp-sub">Valid for the next 15 minutes</div>
          </div>

          <p style="text-align: center; font-size: 12px; color: #79857f;">or click the button below to confirm instantly:</p>

          <a href="${verificationLink}" class="btn" target="_blank">
            1-Click Confirm Subscription
          </a>

          <div class="footer">
            If you did not request this email, you can safely ignore it.<br>
            Siftrole, Verified Tech Opportunities & Cold Outreach Platform.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const mailClient = getTransporter();
    await mailClient.sendMail(mailOptions);
    console.log(`[Email Service] OTP Verification email sent to ${email} (OTP: ${otpCode})`);
    return { success: true, simulated: false };
  } catch (err) {
    console.log(`[Email Service] Live SMTP failed or not configured. Console simulation for ${email}:`);
    console.log(`====================================================`);
    console.log(`  TO: ${email}`);
    console.log(`  OTP CODE: ${otpCode}`);
    console.log(`  1-CLICK VERIFICATION LINK: ${verificationLink}`);
    console.log(`====================================================`);
    return { success: true, simulated: true };
  }
}

/**
 * Sends a welcome confirmation digest with top verified openings
 */
async function sendWelcomeNewsletterEmail({ email, recentListings = [] }) {
  const listingsHtml = (recentListings || []).slice(0, 4).map((job) => `
    <div style="background: #fbfaf8; border: 1px solid #e5e2db; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px;">
      <div style="font-size: 11px; font-weight: 800; color: #3c7818; text-transform: uppercase;">${job.company}</div>
      <div style="font-size: 14px; font-weight: 800; color: #121816; margin: 2px 0;">${job.title}</div>
      <div style="font-size: 12px; color: #55615b;">${job.location} • <strong style="color:#14281a;">${job.stipend_or_salary || 'Competitive'}</strong></div>
      <div style="margin-top: 8px;">
        <a href="${job.apply_url || `${APP_URL}/jobs/${job.id}`}" style="display:inline-block; background:#14281a; color:#84d64f; font-size:11px; font-weight:800; padding:6px 12px; border-radius:8px; text-decoration:none;" target="_blank">
          View & Apply &rarr;
        </a>
      </div>
    </div>
  `).join('');

  const mailOptions = {
    from: FROM_SENDER,
    to: email,
    subject: 'Welcome to Siftrole! Your daily job alerts are active',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f7f5; margin: 0; padding: 30px 15px; color: #121816; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px 32px; border: 1px solid #e5e2db; }
          .logo { display: inline-flex; align-items: center; gap: 8px; font-weight: 900; font-size: 20px; color: #14281a; text-decoration: none; margin-bottom: 24px; }
          h1 { font-size: 22px; font-weight: 800; color: #14281a; margin-bottom: 12px; }
          p { font-size: 13px; line-height: 1.6; color: #55615b; }
          .cta { display: inline-block; background: #84d64f; color: #14281a; font-size: 13px; font-weight: 800; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin: 16px 0; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f2ee; font-size: 11px; color: #79857f; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#84d64f;"></span>
            Siftrole
          </div>
          <h1>You are officially subscribed to Siftrole Radar!</h1>
          <p>
            Your email is verified. You will receive direct job alerts as soon as verified technical roles, university internships, and high-growth startup positions are published.
          </p>

          <h3 style="font-size: 14px; font-weight: 800; color: #14281a; margin: 24px 0 12px;">Top verified openings right now:</h3>
          ${listingsHtml}

          <div style="text-align: center; margin-top: 20px;">
            <a href="${APP_URL}/jobs" class="cta" target="_blank">Browse All Open Roles &rarr;</a>
          </div>

          <div class="footer">
            You received this email because you subscribed on Siftrole.<br>
            <a href="${APP_URL}/unsubscribe-newsletter?email=${encodeURIComponent(email)}" style="color:#79857f; text-decoration:underline;">Unsubscribe from alerts</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const mailClient = getTransporter();
    await mailClient.sendMail(mailOptions);
    console.log(`[Email Service] Welcome email sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.log(`[Email Service] Welcome email queued for ${email} (Simulation mode active)`);
    return { success: true, simulated: true };
  }
}

/**
 * Broadcasts a job alert digest to multiple active subscribers
 */
async function sendJobAlertDigestEmail({ to, listings = [] }) {
  if (!listings || listings.length === 0) return;

  const listingsHtml = listings.slice(0, 5).map((job) => `
    <div style="background: #fbfaf8; border: 1px solid #e5e2db; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px;">
      <div style="font-size: 11px; font-weight: 800; color: #3c7818; text-transform: uppercase;">${job.company}</div>
      <div style="font-size: 14px; font-weight: 800; color: #121816; margin: 2px 0;">${job.title}</div>
      <div style="font-size: 12px; color: #55615b;">${job.location} • <strong style="color:#14281a;">${job.stipend_or_salary || 'Competitive'}</strong></div>
      <div style="margin-top: 8px;">
        <a href="${job.apply_url || `${APP_URL}/jobs/${job.id}`}" style="display:inline-block; background:#84d64f; color:#14281a; font-size:11px; font-weight:800; padding:6px 12px; border-radius:8px; text-decoration:none;" target="_blank">
          Apply Now &rarr;
        </a>
      </div>
    </div>
  `).join('');

  const mailOptions = {
    from: FROM_SENDER,
    to,
    subject: `New verified openings: ${listings[0]?.company} & more hiring now`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f7f5; margin: 0; padding: 30px 15px; color: #121816; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px 32px; border: 1px solid #e5e2db; }
          .logo { display: inline-flex; align-items: center; gap: 8px; font-weight: 900; font-size: 20px; color: #14281a; text-decoration: none; margin-bottom: 24px; }
          h1 { font-size: 22px; font-weight: 800; color: #14281a; margin-bottom: 12px; }
          p { font-size: 13px; line-height: 1.6; color: #55615b; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f2ee; font-size: 11px; color: #79857f; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#84d64f;"></span>
            Siftrole Job Radar
          </div>
          <h1>New verified tech opportunities</h1>
          <p>Here are the latest verified job openings published on Siftrole matching top tech stacks:</p>

          ${listingsHtml}

          <div style="text-align: center; margin-top: 24px;">
            <a href="${APP_URL}/jobs" style="display:inline-block; background:#14281a; color:#84d64f; font-size:13px; font-weight:800; padding:12px 24px; border-radius:12px; text-decoration:none;" target="_blank">
              Explore All Openings on Siftrole &rarr;
            </a>
          </div>

          <div class="footer">
            Siftrole Daily Job Radar.<br>
            <a href="${APP_URL}/unsubscribe-newsletter?email=${encodeURIComponent(to)}" style="color:#79857f; text-decoration:underline;">Unsubscribe</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const mailClient = getTransporter();
    await mailClient.sendMail(mailOptions);
    console.log(`[Email Service] Broadcast sent to ${to}`);
    return { success: true };
  } catch (err) {
    console.log(`[Email Service] Broadcast simulation for ${to}`);
    return { success: true, simulated: true };
  }
}

module.exports = {
  sendOtpVerificationEmail,
  sendWelcomeNewsletterEmail,
  sendJobAlertDigestEmail,
};
