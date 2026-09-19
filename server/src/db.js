const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'siftrole.db'));
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    grad_year INTEGER,
    degree TEXT,
    resume_url TEXT,
    profile_status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    employment_type TEXT,
    stipend_or_salary TEXT,
    skills_required TEXT,
    apply_url TEXT,
    source TEXT,
    status TEXT,
    deadline TEXT,
    raw_jd_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    otp_code TEXT,
    verification_token TEXT UNIQUE,
    is_verified INTEGER DEFAULT 0,
    otp_expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    verified_at TEXT,
    status TEXT DEFAULT 'active'
  );
`);

// Safe column migrations for users table
try {
  const userCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  const profileColsToAdd = [
    { name: 'skills', type: 'TEXT' },
    { name: 'target_role', type: 'TEXT' },
    { name: 'bio', type: 'TEXT' },
    { name: 'github_url', type: 'TEXT' },
    { name: 'linkedin_url', type: 'TEXT' },
    { name: 'phone', type: 'TEXT' },
    { name: 'portfolio_url', type: 'TEXT' },
    { name: 'resume_name', type: 'TEXT' },
    { name: 'work_mode', type: 'TEXT' },
    { name: 'salary_expectation', type: 'TEXT' },
  ];

  for (const col of profileColsToAdd) {
    if (!userCols.includes(col.name)) {
      db.prepare(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`).run();
    }
  }
} catch (migErr) {
  console.warn('User profile column migration notice:', migErr.message);
}

function seedDefaults() {
  const listingCount = db.prepare('SELECT COUNT(*) AS count FROM listings').get().count;
  if (listingCount > 0) return;

  const defaultListings = [
    {
      id: 'lg-1001',
      company_id: 'c-1',
      title: 'Software Engineer Intern',
      company: 'Nexa Labs',
      location: 'Bengaluru, India',
      employment_type: 'Internship',
      stipend_or_salary: '₹40,000 / month',
      skills_required: JSON.stringify(['JavaScript', 'React', 'Node.js', 'REST APIs']),
      apply_url: 'https://example.com/jobs/nexa-software-engineer-intern',
      source: 'scraped',
      status: 'active',
      deadline: '2026-10-10',
      raw_jd_hash: 'hash-nexa-1',
    },
    {
      id: 'lg-1002',
      company_id: 'c-2',
      title: 'Full Stack Developer',
      company: 'OrbitWorks',
      location: 'Remote',
      employment_type: 'Full-time',
      stipend_or_salary: '₹18 LPA',
      skills_required: JSON.stringify(['TypeScript', 'Next.js', 'PostgreSQL', 'AWS']),
      apply_url: 'https://example.com/jobs/orbitworks-fullstack',
      source: 'scraped',
      status: 'active',
      deadline: '2026-10-20',
      raw_jd_hash: 'hash-orbit-2',
    },
    {
      id: 'lg-1003',
      company_id: 'c-3',
      title: 'Data Analyst',
      company: 'SignalGrid',
      location: 'Hyderabad, India',
      employment_type: 'Full-time',
      stipend_or_salary: '₹12 LPA',
      skills_required: JSON.stringify(['SQL', 'Python', 'Power BI', 'Statistics']),
      apply_url: 'https://example.com/jobs/signalgrid-data-analyst',
      source: 'manual',
      status: 'flagged',
      deadline: '2026-11-05',
      raw_jd_hash: 'hash-signal-3',
    },
    {
      id: 'lg-1004',
      company_id: 'c-4',
      title: 'Frontend Engineer',
      company: 'Pioneer Cloud',
      location: 'Pune, India',
      employment_type: 'Full-time',
      stipend_or_salary: '₹16 LPA',
      skills_required: JSON.stringify(['React', 'TypeScript', 'UI Design', 'Accessibility']),
      apply_url: 'https://example.com/jobs/pioneer-cloud-frontend',
      source: 'scraped',
      status: 'active',
      deadline: '2026-10-15',
      raw_jd_hash: 'hash-pioneer-4',
    },
  ];

  const insertListing = db.prepare(`
    INSERT INTO listings (
      id, company_id, title, company, location, employment_type, stipend_or_salary,
      skills_required, apply_url, source, status, deadline, raw_jd_hash
    ) VALUES (
      @id, @company_id, @title, @company, @location, @employment_type, @stipend_or_salary,
      @skills_required, @apply_url, @source, @status, @deadline, @raw_jd_hash
    )
  `);

  for (const listing of defaultListings) {
    insertListing.run(listing);
  }

  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount === 0) {
    const bcrypt = require('bcryptjs');
    const users = [
      {
        id: 'user-student',
        name: 'Candidate',
        email: 'student@demo.com',
        password_hash: bcrypt.hashSync('password123', 10),
        role: 'student',
        grad_year: null,
        degree: null,
        resume_url: null,
        profile_status: 'verified',
      },
      {
        id: 'user-admin',
        name: 'Admin',
        email: 'admin@demo.com',
        password_hash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        grad_year: null,
        degree: null,
        resume_url: null,
        profile_status: 'admin',
      },
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, grad_year, degree, resume_url, profile_status)
      VALUES (@id, @name, @email, @password_hash, @role, @grad_year, @degree, @resume_url, @profile_status)
    `);

    for (const user of users) {
      insertUser.run(user);
    }
  } else {
    // Purge any legacy mock degrees/names from existing SQLite demo user
    try {
      db.prepare("UPDATE users SET degree = NULL, grad_year = NULL WHERE id = 'user-student' AND (degree = 'B.Tech in CSE' OR degree LIKE '%CSE%')").run();
      db.prepare("UPDATE users SET name = 'Candidate' WHERE id = 'user-student' AND name = 'Aisha Singh'").run();
    } catch {}
  }

  const applicationCount = db.prepare('SELECT COUNT(*) AS count FROM applications').get().count;
  if (applicationCount === 0) {
    db.prepare(`
      INSERT INTO applications (id, student_id, listing_id, status, updated_at)
      VALUES
        ('app-1', 'user-student', 'lg-1001', 'applied', ?),
        ('app-2', 'user-student', 'lg-1002', 'interview', ?)
    `).run(new Date().toISOString(), new Date().toISOString());
  }

  const notificationCount = db.prepare('SELECT COUNT(*) AS count FROM notifications').get().count;
  if (notificationCount === 0) {
    db.prepare(`
      INSERT INTO notifications (id, student_id, listing_id, channel, sent_at)
      VALUES ('n-1', 'user-student', 'lg-1001', 'email', ?)
    `).run(new Date().toISOString());
  }
}

seedDefaults();

module.exports = {
  db,
  getAllListings(onlyActive = true) {
    const query = onlyActive
      ? "SELECT * FROM listings WHERE status = 'active' ORDER BY created_at DESC"
      : "SELECT * FROM listings ORDER BY created_at DESC";
    return db.prepare(query).all().map((listing) => ({
      ...listing,
      skills_required: listing.skills_required ? JSON.parse(listing.skills_required) : [],
    }));
  },
  getPendingListings() {
    return db.prepare("SELECT * FROM listings WHERE status IN ('pending_approval', 'flagged') ORDER BY created_at DESC").all().map((listing) => ({
      ...listing,
      skills_required: listing.skills_required ? JSON.parse(listing.skills_required) : [],
    }));
  },
  approveListing(id, updates = null) {
    if (updates && typeof updates === 'object') {
      const {
        title,
        company,
        location,
        employment_type,
        stipend_or_salary,
        skills_required,
        apply_url,
        deadline,
      } = updates;

      const skillsJson = Array.isArray(skills_required) ? JSON.stringify(skills_required) : JSON.stringify([]);

      db.prepare(`
        UPDATE listings
        SET title = COALESCE(?, title),
            company = COALESCE(?, company),
            location = COALESCE(?, location),
            employment_type = COALESCE(?, employment_type),
            stipend_or_salary = COALESCE(?, stipend_or_salary),
            skills_required = ?,
            apply_url = COALESCE(?, apply_url),
            deadline = COALESCE(?, deadline),
            status = 'active',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        title || null,
        company || null,
        location || null,
        employment_type || null,
        stipend_or_salary || null,
        skillsJson,
        apply_url || null,
        deadline || null,
        id
      );
    } else {
      db.prepare("UPDATE listings SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    }
    return this.getListingById(id);
  },
  bulkApproveListings(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const placeholders = ids.map(() => '?').join(',');
    const info = db.prepare(`UPDATE listings SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
    return info.changes;
  },
  rejectListing(id) {
    db.prepare("UPDATE listings SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    return true;
  },
  getListingById(id) {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    if (!listing) return null;
    return { ...listing, skills_required: listing.skills_required ? JSON.parse(listing.skills_required) : [] };
  },
  getAllUsers() {
    return db.prepare('SELECT * FROM users ORDER BY created_at ASC').all();
  },
  getUserById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },
  getUserByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  },
  createUser({ id, name, email, passwordHash, role, grad_year = null, degree = null, resume_url = null, profile_status = 'new' }) {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, grad_year, degree, resume_url, profile_status)
      VALUES (@id, @name, @email, @passwordHash, @role, @grad_year, @degree, @resume_url, @profile_status)
    `);
    stmt.run({
      id,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      grad_year,
      degree,
      resume_url,
      profile_status,
    });
    return this.getUserById(id);
  },
  createApplication({ id, student_id, listing_id, status }) {
    const stmt = db.prepare(`
      INSERT INTO applications (id, student_id, listing_id, status, updated_at)
      VALUES (@id, @student_id, @listing_id, @status, @updated_at)
    `);
    const updatedAt = new Date().toISOString();
    stmt.run({ id, student_id, listing_id, status, updated_at: updatedAt });
    return { id, student_id, listing_id, status, updated_at: updatedAt };
  },
  listApplicationsByStudent(studentId) {
    return db.prepare('SELECT * FROM applications WHERE student_id = ? ORDER BY updated_at DESC').all(studentId);
  },
  listNotificationsByStudent(studentId) {
    return db.prepare('SELECT * FROM notifications WHERE student_id = ? ORDER BY sent_at DESC').all(studentId);
  },
  createNotification({ id, student_id, listing_id, channel }) {
    const sentAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO notifications (id, student_id, listing_id, channel, sent_at)
      VALUES (@id, @student_id, @listing_id, @channel, @sent_at)
    `).run({ id, student_id, listing_id, channel, sent_at: sentAt });
    return { id, student_id, listing_id, channel, sent_at: sentAt };
  },
  updateListingStatus(id, status) {
    db.prepare('UPDATE listings SET status = ? WHERE id = ?').run(status, id);
    return this.getListingById(id);
  },
  hasApplication(studentId, listingId) {
    const result = db.prepare('SELECT 1 FROM applications WHERE student_id = ? AND listing_id = ? LIMIT 1').get(studentId, listingId);
    return Boolean(result);
  },
  upsertNewsletterSubscriber({ id, email, otp_code, verification_token, otp_expires_at }) {
    const existing = db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email);
    if (existing) {
      db.prepare(`
        UPDATE newsletter_subscribers
        SET otp_code = ?, verification_token = ?, otp_expires_at = ?, status = 'active', is_verified = 0
        WHERE email = ?
      `).run(otp_code, verification_token, otp_expires_at, email);
      return db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email);
    } else {
      db.prepare(`
        INSERT INTO newsletter_subscribers (id, email, otp_code, verification_token, is_verified, otp_expires_at, status)
        VALUES (?, ?, ?, ?, 0, ?, 'active')
      `).run(id, email, otp_code, verification_token, otp_expires_at);
      return db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email);
    }
  },
  getNewsletterSubscriberByEmail(email) {
    return db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email);
  },
  getNewsletterSubscriberByToken(token) {
    return db.prepare('SELECT * FROM newsletter_subscribers WHERE verification_token = ?').get(token);
  },
  verifyNewsletterSubscriber(email) {
    const verifiedAt = new Date().toISOString();
    db.prepare(`
      UPDATE newsletter_subscribers
      SET is_verified = 1, verified_at = ?, otp_code = NULL, verification_token = NULL
      WHERE email = ?
    `).run(verifiedAt, email);
    return db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email);
  },
  listActiveNewsletterSubscribers() {
    return db.prepare("SELECT * FROM newsletter_subscribers WHERE is_verified = 1 AND status = 'active'").all();
  },
  unsubscribeNewsletter(email) {
    db.prepare("UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE email = ?").run(email);
    return true;
  },
  getUserProfile(id) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return null;
    let parsedSkills = [];
    try {
      if (user.skills) parsedSkills = JSON.parse(user.skills);
    } catch {
      parsedSkills = [];
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      grad_year: user.grad_year,
      degree: user.degree,
      target_role: user.target_role,
      bio: user.bio,
      skills: parsedSkills,
      github_url: user.github_url,
      linkedin_url: user.linkedin_url,
      phone: user.phone,
      portfolio_url: user.portfolio_url,
      resume_name: user.resume_name,
      resume_url: user.resume_url,
      work_mode: user.work_mode,
      salary_expectation: user.salary_expectation,
      profile_status: user.profile_status,
      created_at: user.created_at,
    };
  },
  updateUserProfile(id, {
    name,
    grad_year,
    degree,
    target_role,
    bio,
    skills,
    github_url,
    linkedin_url,
    phone,
    portfolio_url,
    resume_name,
    resume_url,
    work_mode,
    salary_expectation,
  }) {
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) return null;

    const skillsString = Array.isArray(skills) ? JSON.stringify(skills) : (skills || existing.skills || '[]');

    db.prepare(`
      UPDATE users
      SET name = COALESCE(@name, name),
          grad_year = COALESCE(@grad_year, grad_year),
          degree = COALESCE(@degree, degree),
          target_role = COALESCE(@target_role, target_role),
          bio = COALESCE(@bio, bio),
          skills = @skills,
          github_url = COALESCE(@github_url, github_url),
          linkedin_url = COALESCE(@linkedin_url, linkedin_url),
          phone = COALESCE(@phone, phone),
          portfolio_url = COALESCE(@portfolio_url, portfolio_url),
          resume_name = COALESCE(@resume_name, resume_name),
          resume_url = COALESCE(@resume_url, resume_url),
          work_mode = COALESCE(@work_mode, work_mode),
          salary_expectation = COALESCE(@salary_expectation, salary_expectation)
      WHERE id = @id
    `).run({
      id,
      name: name !== undefined ? name : null,
      grad_year: grad_year !== undefined ? grad_year : null,
      degree: degree !== undefined ? degree : null,
      target_role: target_role !== undefined ? target_role : null,
      bio: bio !== undefined ? bio : null,
      skills: skillsString,
      github_url: github_url !== undefined ? github_url : null,
      linkedin_url: linkedin_url !== undefined ? linkedin_url : null,
      phone: phone !== undefined ? phone : null,
      portfolio_url: portfolio_url !== undefined ? portfolio_url : null,
      resume_name: resume_name !== undefined ? resume_name : null,
      resume_url: resume_url !== undefined ? resume_url : null,
      work_mode: work_mode !== undefined ? work_mode : null,
      salary_expectation: salary_expectation !== undefined ? salary_expectation : null,
    });

    return this.getUserProfile(id);
  },
};
