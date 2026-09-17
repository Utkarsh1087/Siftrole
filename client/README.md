# TechJobs Aggregator (Phase 1 MVP)

A verified, spam-free tech job and internship aggregator for students. Ingests live listings directly from company ATS JSON APIs (Greenhouse, Lever, Ashby, SmartRecruiters) and provides an Admin AI extraction assistant with strict schema compliance and audit logging.

---

## 🚀 Features Built in Phase 1 MVP

1. **4 Isolated ATS Public API Scrapers**:
   - **Greenhouse**: `https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true`
   - **Lever**: `https://api.lever.co/v0/postings/{company}?mode=json`
   - **Ashby**: `https://api.ashbyhq.com/posting-api/job-board/{token}`
   - **SmartRecruiters**: `https://api.smartrecruiters.com/v1/companies/{token}/postings`
   - Isolated, modular adapters normalizing payloads into a single fixed schema.
   - Individual error handling (logs and skips failing company feeds without breaking the run).

2. **Deduplication Engine**:
   - **Exact Match (`raw_jd_hash`)**: SHA-256 of whitespace-normalized JD text. Re-running sync refreshes existing active listings without inserting duplicates.
   - **Near Match**: Normalizes `lower(company + title + location)` stripped of punctuation. Flags suspicious duplicate roles for human review (`status = 'flagged'`).
   - **Reconciliation**: Missing active listings not present in the latest source feed are marked as `expired`.

3. **Admin AI Extraction Chatbot (`/admin`)**:
   - Conversational assistant for unformatted JD text (e.g. from PDFs, emails, or custom career pages).
   - **Strict Rule Enforcement**: Stated requirements only; unstated fields remain `null` (zero hallucination of deadlines or salaries).
   - **Audit Trail**: Saves every extraction input, output JSON, and `raw_jd_hash` to `extraction_logs` for human spot-checking (first 30 entries).
   - Interactive review template with single-click save to the database with `source = 'manual'`.

4. **Public Listings View (`/`)**:
   - Real-time job feed filterable by company, role type, and search queries.
   - Detailed modal with skill tags, company metadata, and direct "Apply on Company Site" links.

---

## 📦 Fixed Listing Schema

```json
{
  "title": "string",
  "company": "string",
  "location": "string",
  "employment_type": "string | null",
  "eligibility": "string | null",
  "stipend_or_salary": "string | null",
  "deadline": "ISO date | null",
  "skills_required": ["string"],
  "experience_level": "string | null",
  "apply_url": "string",
  "source": "scraped | manual",
  "status": "active | expired | flagged",
  "raw_jd_hash": "string (SHA-256 of normalized JD text)",
  "normalized_key": "string (sanitized company__title__location)"
}
```

---

## 🛠️ How to Run & Test

### 1. Database Setup & Migrations
```bash
cd client
# Run Prisma migrations
npx prisma db push # or npx prisma migrate dev

# Seed initial verified companies (Figma, Stripe, Spotify, Linear, Notion, SmartRecruiters)
npm run db:seed
```

### 2. Running Unit Tests
```bash
npm test
```
Tests cover:
- ATS adapter normalization and registry resolution
- Deterministic SHA-256 deduplication hashing
- Normalized key string generation
- Schema validation with null-handling

### 3. Running Scrapers Manually
- **Via API Endpoint (POST /api/sync)**:
```bash
curl -X POST http://localhost:3000/api/sync
```
- **Via Admin UI**: Navigate to `http://localhost:3000/admin` and click the **"Run All Scrapers"** button.

---

## 🔌 Where Phase 2 Plugs In

- **Authentication & RBAC**: Student & Recruiter login via JWT/OAuth. Middleware attaches user context to API requests.
- **Resume Upload & AI Parsing**: Student uploads PDF resume $\to$ AI extracts skills and graduation year $\to$ stored in `student_profiles`.
- **Vector Embeddings (pgvector)**: Enable `pgvector` extension in PostgreSQL. Generate embeddings for `student_profiles.resume_embedding` and `listings.jd_embedding` (1536 dims).
- **Match Scoring Engine**: Calculates weighted overlap between student resume skills/grad year and `listings.skills_required` + semantic cosine similarity.
- **Continuous Daily Digest**: Scheduled batch worker queues High-match opportunities to student email notifications.
