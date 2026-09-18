const express = require('express');
const crypto = require('crypto');
const {
  upsertNewsletterSubscriber,
  getNewsletterSubscriberByEmail,
  getNewsletterSubscriberByToken,
  verifyNewsletterSubscriber,
  listActiveNewsletterSubscribers,
  unsubscribeNewsletter,
  getAllListings,
} = require('../store');
const {
  sendOtpVerificationEmail,
  sendWelcomeNewsletterEmail,
  sendJobAlertDigestEmail,
} = require('../emailService');

const router = express.Router();
const APP_URL = process.env.CLIENT_URL || 'http://localhost:3000';

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * POST /api/newsletter/subscribe
 * User submits email -> generates 6-digit OTP and 1-click token -> sends verification email
 */
router.post('/subscribe', async (req, res) => {
  const { email } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = getNewsletterSubscriberByEmail(cleanEmail);

  const id = existing?.id || `sub_${crypto.randomUUID()}`;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  try {
    upsertNewsletterSubscriber({
      id,
      email: cleanEmail,
      otp_code: otpCode,
      verification_token: verificationToken,
      otp_expires_at: otpExpiresAt,
    });

    const verificationLink = `${APP_URL}/verify-newsletter?token=${verificationToken}&email=${encodeURIComponent(cleanEmail)}`;

    await sendOtpVerificationEmail({
      email: cleanEmail,
      otpCode,
      verificationLink,
    });

    return res.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: 'Verification code sent to your email address.',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ error: 'Failed to process newsletter subscription. Please try again.' });
  }
});

/**
 * POST /api/newsletter/verify-otp
 * User inputs 6-digit OTP code to confirm subscription
 */
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const subscriber = getNewsletterSubscriberByEmail(cleanEmail);

  if (!subscriber) {
    return res.status(404).json({ error: 'Subscription record not found. Please subscribe again.' });
  }

  if (subscriber.is_verified) {
    return res.json({
      success: true,
      message: 'Your email is already verified. You are all set!',
    });
  }

  if (subscriber.otp_expires_at && new Date(subscriber.otp_expires_at) < new Date()) {
    return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
  }

  if (!subscriber.otp_code || subscriber.otp_code.trim() !== otp.toString().trim()) {
    return res.status(400).json({ error: 'Invalid verification code. Please check your email and try again.' });
  }

  try {
    verifyNewsletterSubscriber(cleanEmail);

    // Send welcome digest with top verified listings
    const recentListings = getAllListings().slice(0, 4);
    sendWelcomeNewsletterEmail({
      email: cleanEmail,
      recentListings,
    }).catch((err) => console.error('Error sending welcome email:', err));

    return res.json({
      success: true,
      message: 'Email verified successfully! You will now receive daily tech job updates.',
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'Failed to verify code. Please try again.' });
  }
});

/**
 * GET /api/newsletter/verify-link
 * 1-click confirmation magic link handler
 */
router.get('/verify-link', async (req, res) => {
  const { token, email } = req.query || {};

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' });
  }

  let subscriber = getNewsletterSubscriberByToken(token.toString());

  if (!subscriber) {
    if (email && isValidEmail(email.toString())) {
      const existingUser = getNewsletterSubscriberByEmail(email.toString().trim().toLowerCase());
      if (existingUser && existingUser.is_verified) {
        return res.json({
          success: true,
          email: existingUser.email,
          message: 'Your email is already verified and actively subscribed to job radar alerts!',
        });
      }
    }
    return res.status(404).json({ error: 'Invalid or expired verification link.' });
  }

  if (subscriber.otp_expires_at && new Date(subscriber.otp_expires_at) < new Date()) {
    return res.status(400).json({ error: 'Verification link has expired. Please subscribe again.' });
  }

  try {
    verifyNewsletterSubscriber(subscriber.email);

    const recentListings = getAllListings().slice(0, 4);
    sendWelcomeNewsletterEmail({
      email: subscriber.email,
      recentListings,
    }).catch((err) => console.error('Error sending welcome email:', err));

    return res.json({
      success: true,
      email: subscriber.email,
      message: 'Email successfully verified via magic link!',
    });
  } catch (error) {
    console.error('Link verification error:', error);
    return res.status(500).json({ error: 'Failed to verify link.' });
  }
});

/**
 * POST /api/newsletter/resend-otp
 * Resend a new OTP verification code
 */
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const subscriber = getNewsletterSubscriberByEmail(cleanEmail);

  if (!subscriber) {
    return res.status(404).json({ error: 'Subscriber record not found. Please subscribe again.' });
  }

  if (subscriber.is_verified) {
    return res.json({ success: true, message: 'Email is already verified.' });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  try {
    upsertNewsletterSubscriber({
      id: subscriber.id,
      email: cleanEmail,
      otp_code: otpCode,
      verification_token: verificationToken,
      otp_expires_at: otpExpiresAt,
    });

    const verificationLink = `${APP_URL}/verify-newsletter?token=${verificationToken}&email=${encodeURIComponent(cleanEmail)}`;

    await sendOtpVerificationEmail({
      email: cleanEmail,
      otpCode,
      verificationLink,
    });

    return res.json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Failed to resend code. Please try again.' });
  }
});

/**
 * GET /api/newsletter/subscribers
 * Returns active verified subscribers with counts
 */
router.get('/subscribers', (req, res) => {
  try {
    const subscribers = listActiveNewsletterSubscribers();
    return res.json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    console.error('Fetch subscribers error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

/**
 * POST /api/newsletter/broadcast
 * Dispatches a job alert digest to all verified active subscribers or test recipient
 */
router.post('/broadcast', async (req, res) => {
  try {
    const { subject, headline, customNote, listingIds, targetEmail } = req.body || {};
    
    // Determine listings to include
    let selectedListings = [];
    const allListings = getAllListings();
    
    if (Array.isArray(listingIds) && listingIds.length > 0) {
      selectedListings = allListings.filter((l) => listingIds.includes(l.id));
    }
    
    if (selectedListings.length === 0) {
      selectedListings = allListings.slice(0, 5);
    }

    if (selectedListings.length === 0) {
      return res.status(400).json({ error: 'No active job openings available to broadcast.' });
    }

    // If sending test email to a specific address
    if (targetEmail && isValidEmail(targetEmail)) {
      const testResult = await sendJobAlertDigestEmail({
        to: targetEmail.trim().toLowerCase(),
        listings: selectedListings,
        subject: subject || `[Test Digest] Verified Openings on Siftrole`,
        headline,
        customNote,
      });

      return res.json({
        success: true,
        isTest: true,
        message: `Test newsletter digest sent to ${targetEmail}.`,
        count: 1,
        result: testResult,
      });
    }

    const subscribers = listActiveNewsletterSubscribers();

    if (subscribers.length === 0) {
      return res.json({ success: true, message: 'No active verified subscribers found.', count: 0 });
    }

    let sentCount = 0;
    for (const sub of subscribers) {
      try {
        await sendJobAlertDigestEmail({
          to: sub.email,
          listings: selectedListings,
          subject,
          headline,
          customNote,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send digest to ${sub.email}:`, err);
      }
    }

    return res.json({
      success: true,
      message: `Job alert digest successfully sent to ${sentCount} active subscriber(s).`,
      count: sentCount,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return res.status(500).json({ error: 'Failed to broadcast job alerts.' });
  }
});

/**
 * POST /api/newsletter/unsubscribe
 */
router.post('/unsubscribe', (req, res) => {
  const { email } = req.body || {};
  if (email) {
    unsubscribeNewsletter(email.trim().toLowerCase());
  }
  return res.json({ success: true, message: 'Successfully unsubscribed from job alerts.' });
});

module.exports = router;
