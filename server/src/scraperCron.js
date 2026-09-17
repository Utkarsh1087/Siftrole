const crypto = require('crypto');
const { db, getAllListings } = require('./store');

// Scrapes job feeds from public ATS endpoints in background
async function fetchGreenhouseJobs(token, companyName) {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || []).slice(0, 10).map((j) => ({
      title: j.title,
      company: companyName,
      location: j.location?.name || 'Remote',
      employment_type: 'Full time',
      apply_url: j.absolute_url,
      raw_jd_text: j.content || '',
      source: 'greenhouse_scraper',
    }));
  } catch (e) {
    return [];
  }
}

async function fetchLeverJobs(token, companyName) {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${token}?mode=json`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).slice(0, 10).map((j) => ({
      title: j.text,
      company: companyName,
      location: j.categories?.location || 'Remote',
      employment_type: j.categories?.commitment || 'Full time',
      apply_url: j.applyUrl || j.hostedUrl,
      raw_jd_text: j.descriptionPlain || j.description || '',
      source: 'lever_scraper',
    }));
  } catch (e) {
    return [];
  }
}

// Extract tech skills from text
function extractSkills(text) {
  const common = ['React', 'Node.js', 'TypeScript', 'Python', 'Go', 'AWS', 'Docker', 'Kubernetes', 'Next.js', 'PostgreSQL', 'GraphQL', 'Java', 'C++', 'Rust', 'Tailwind CSS'];
  const found = [];
  const lower = (text || '').toLowerCase();
  for (const s of common) {
    if (lower.includes(s.toLowerCase())) {
      found.push(s);
    }
  }
  return found.slice(0, 5);
}

async function runBackgroundScraper() {
  console.log('[Background Scraper] Scanning verified ATS job feeds...');

  const feeds = [
    { type: 'greenhouse', token: 'stripe', company: 'Stripe' },
    { type: 'greenhouse', token: 'figma', company: 'Figma' },
    { type: 'lever', token: 'spotify', company: 'Spotify' },
    { type: 'lever', token: 'netflix', company: 'Netflix' },
  ];

  let stagedCount = 0;

  for (const feed of feeds) {
    let jobs = [];
    if (feed.type === 'greenhouse') {
      jobs = await fetchGreenhouseJobs(feed.token, feed.company);
    } else if (feed.type === 'lever') {
      jobs = await fetchLeverJobs(feed.token, feed.company);
    }

    for (const j of jobs) {
      if (!j.title || !j.apply_url) continue;

      const hash = crypto.createHash('sha256').update(`${j.title} ${j.company} ${j.location}`).digest('hex');
      const existing = db.prepare('SELECT id FROM listings WHERE raw_jd_hash = ?').get(hash);

      if (!existing) {
        const id = `scraped_${crypto.randomUUID().slice(0, 8)}`;
        const skills = extractSkills(j.raw_jd_text);

        db.prepare(`
          INSERT INTO listings (
            id, title, company, location, employment_type,
            stipend_or_salary, skills_required, apply_url,
            source, status, raw_jd_hash, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(
          id,
          j.title,
          j.company,
          j.location,
          j.employment_type || 'Full time',
          'Competitive / Unstated',
          JSON.stringify(skills),
          j.apply_url,
          j.source,
          hash
        );

        stagedCount++;
      }
    }
  }

  if (stagedCount > 0) {
    console.log(`[Background Scraper] Found and staged ${stagedCount} new job listings for admin review.`);
  } else {
    console.log('[Background Scraper] Job feeds are up to date.');
  }
}

// Export for scheduled intervals and manual triggers
function initScraperScheduler(intervalMs = 30 * 60 * 1000) {
  // Run initial scan after 5 seconds
  setTimeout(() => {
    runBackgroundScraper().catch((err) => console.error('[Background Scraper Error]:', err));
  }, 5000);

  // Run on recurring interval
  setInterval(() => {
    runBackgroundScraper().catch((err) => console.error('[Background Scraper Error]:', err));
  }, intervalMs);
}

module.exports = {
  runBackgroundScraper,
  initScraperScheduler,
};
