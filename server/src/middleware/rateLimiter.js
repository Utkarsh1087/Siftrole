// Sliding-window in-memory rate limiter and bot protection middleware

const requestBuckets = new Map();

// Known abusive bot user agent signatures
const BLOCKED_BOT_AGENTS = [
  'sqlmap',
  'nikto',
  'zgrab',
  'masscan',
  'gobuster',
  'dirbuster',
  'wprecon',
  'nmap',
  'curl/7.0',
  'python-requests/0.',
];

/**
 * Creates a rate limiting middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (e.g., 60000 for 1 min)
 * @param {number} options.maxRequests - Max requests allowed per IP in the window
 * @param {string} options.message - Custom error message
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000,
    maxRequests = 100,
    message = 'Too many requests from this IP. Please try again later.',
  } = options;

  return function rateLimiter(req, res, next) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    // 1. Bot check
    const isMaliciousBot = BLOCKED_BOT_AGENTS.some((bot) => userAgent.includes(bot));
    if (isMaliciousBot) {
      return res.status(403).json({
        error: 'Access denied: automated security scanner or unauthorized bot signature detected.',
      });
    }

    const now = Date.now();
    const bucketKey = `${ip}:${options.prefix || 'global'}`;

    if (!requestBuckets.has(bucketKey)) {
      requestBuckets.set(bucketKey, []);
    }

    const timestamps = requestBuckets.get(bucketKey);

    // Filter out timestamps outside the sliding window
    const validTimestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);

    if (validTimestamps.length >= maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000);

      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((oldestTimestamp + windowMs) / 1000));

      return res.status(429).json({
        error: message,
        retryAfterSeconds,
      });
    }

    validTimestamps.push(now);
    requestBuckets.set(bucketKey, validTimestamps);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - validTimestamps.length));

    next();
  };
}

// Clean up stale buckets every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requestBuckets.entries()) {
    const valid = timestamps.filter((t) => now - t < 10 * 60 * 1000);
    if (valid.length === 0) {
      requestBuckets.delete(key);
    } else {
      requestBuckets.set(key, valid);
    }
  }
}, 5 * 60 * 1000);

// Pre-configured rate limiters
const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  prefix: 'general',
  message: 'API rate limit exceeded. Please slow down your requests.',
});

const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  prefix: 'auth',
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.',
});

const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  prefix: 'ai',
  message: 'AI generation rate limit reached. Please wait a moment before generating more content.',
});

module.exports = {
  createRateLimiter,
  generalApiLimiter,
  authLimiter,
  aiLimiter,
};
