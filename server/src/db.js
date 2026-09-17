const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'siftrole.db'));
db.pragma('journal_mode = WAL');

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

  CREATE TABLE IF NOT EXISTS recruiter_submissions (
    id TEXT PRIMARY KEY,
    recruiter_id TEXT NOT NULL,
    company_id TEXT,
    company_name TEXT,
    raw_jd TEXT,
    status TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

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
        name: 'Aisha Singh',
        email: 'student@demo.com',
        password_hash: bcrypt.hashSync('password123', 10),
        role: 'student',
        grad_year: 2027,
        degree: 'B.Tech in CSE',
        resume_url: 'https://example.com/resume/aisha.pdf',
        profile_status: 'verified',
      },
      {
        id: 'user-admin',
        name: 'Priya Verma',
        email: 'admin@demo.com',
        password_hash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        grad_year: null,
        degree: null,
        resume_url: null,
        profile_status: 'admin',
      },
      {
        id: 'user-recruiter',
        name: 'Rahul Mehra',
        email: 'recruiter@demo.com',
        password_hash: bcrypt.hashSync('recruit123', 10),
        role: 'recruiter',
        grad_year: null,
        degree: null,
        resume_url: null,
        profile_status: 'verified',
      },
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, grad_year, degree, resume_url, profile_status)
      VALUES (@id, @name, @email, @password_hash, @role, @grad_year, @degree, @resume_url, @profile_status)
    `);

    for (const user of users) {
      insertUser.run(user);
    }
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

  const submissionCount = db.prepare('SELECT COUNT(*) AS count FROM recruiter_submissions').get().count;
  if (submissionCount === 0) {
    db.prepare(`
      INSERT INTO recruiter_submissions (id, recruiter_id, company_id, company_name, raw_jd, status)
      VALUES ('sub-1', 'user-recruiter', 'c-5', 'Nova Stack', 'We are hiring a backend engineer with Node.js, TypeScript, and SQL.', 'pending')
    `).run();
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
  getAllListings() {
    return db.prepare('SELECT * FROM listings ORDER BY created_at DESC').all().map((listing) => ({
      ...listing,
      skills_required: listing.skills_required ? JSON.parse(listing.skills_required) : [],
    }));
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
  listRecruiterSubmissions() {
    return db.prepare('SELECT * FROM recruiter_submissions ORDER BY created_at DESC').all();
  },
  updateListingStatus(id, status) {
    db.prepare('UPDATE listings SET status = ? WHERE id = ?').run(status, id);
    return this.getListingById(id);
  },
  hasApplication(studentId, listingId) {
    const result = db.prepare('SELECT 1 FROM applications WHERE student_id = ? AND listing_id = ? LIMIT 1').get(studentId, listingId);
    return Boolean(result);
  },
};
