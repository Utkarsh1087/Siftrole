# Siftrole Production Deployment & Zero-Downtime Guide

This guide details the complete production deployment architecture, step-by-step setup, and zero-downtime redundancy practices for **Siftrole**.

---

## 🏗️ Architecture Overview

| Component | Technology | Recommended Host | Free Tier | Health Check Endpoint |
| :--- | :--- | :--- | :---: | :--- |
| **Client Web App** | Next.js 16 (Turbopack) | **Vercel** | ✅ Yes | `/api/health` |
| **Admin Dashboard** | Next.js 16 (Protected) | **Vercel** | ✅ Yes | `/api/health` |
| **Backend API Server** | Node.js + Express | **Render** or **Railway** | ✅ Yes | `/health` & `/api/health` |
| **Database** | Serverless PostgreSQL | **Neon Cloud** | ✅ Yes | `DATABASE_URL_POOLED` |

---

## 🛡️ Zero-Downtime Architecture: How Siftrole Never Goes Down

### 1. Dual Automated Keep-Alive Mechanisms
Free-tier containers on Render or Railway spin down after 15 minutes of inactivity. Siftrole prevents cold starts and outages via:
1. **GitHub Actions Watchdog (`.github/workflows/keep-alive.yml`)**:
   - Executes automatically every **14 minutes**.
   - Sends HTTP requests with a custom User-Agent to the health check endpoints of all 3 services.
   - Retries up to 3 times with exponential backoff on cold starts.
   - Posts a real-time status matrix directly into the GitHub Actions run summary.
2. **External Uptime Monitor (UptimeRobot / Cron-job.org)**:
   - Free 5-minute HTTP(S) monitors pinging `/health` ensure the services stay continuously awake 24/7 even if GitHub Actions experiences delays.

### 2. Process Crash Shielding
In `server/src/index.js`:
- Intercepts `uncaughtException` and `unhandledRejection` at the Node process level, preventing fatal process termination from third-party API spikes or transient network drops.
- Health check endpoints (`/health` and `/api/health`) are situated **before** rate limiters so monitoring bots never trigger `429 Too Many Requests`.
- Graceful shutdown handles `SIGTERM` and `SIGINT` with connection draining for zero-dropped requests during redeployments.

### 3. Multi-Key LLM Failover Engine
- AI services cascade through multiple Groq API keys (`GROQ_API_KEY_1`, `2`, `3`) and Google Gemini keys with 4-second timeouts.
- If one provider or key experiences rate limits or temporary downtime, requests automatically fall over to the next healthy key without surfacing errors to candidates.

### 4. Database Connection Pooler
- Uses Neon's connection pooler (`ep-hidden-math-azt7hzpx-pooler...`) to handle bursts of concurrent connections without exhausting PostgreSQL connection limits.

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Deploy Backend API Server (`server`) on Render

1. Sign up / log in to [Render.com](https://render.com).
2. Click **New +** → **Web Service** (or choose **Blueprint** to use the included `render.yaml`).
3. Connect your GitHub repository: `Utkarsh1087/Siftrole`.
4. Configure service settings:
   - **Name**: `siftrole-server`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
5. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://neondb_owner:npg_j7xipzATkE2V@ep-hidden-math-azt7hzpx.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   GROQ_API_KEY=your_groq_api_key
   AI_API_KEY=your_groq_api_key
   RESEND_API_KEY=your_resend_api_key
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_USER=resend
   SMTP_PASS=your_resend_api_key
   FROM_EMAIL=Siftrole <onboarding@resend.dev>
   CLIENT_URL=https://siftrole.vercel.app
   ```
6. Click **Create Web Service**. Note your server URL (e.g. `https://siftrole-server.onrender.com`).

---

### Step 2: Deploy Client Web App (`client`) on Vercel

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository: `Utkarsh1087/Siftrole`.
4. Configure project settings:
   - **Project Name**: `siftrole`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`client`**.
   - **Build Command**: Leave default (`next build`)
   - **Output Directory**: Leave default (`.next`)
5. Under **Environment Variables**, add:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_j7xipzATkE2V@ep-hidden-math-azt7hzpx.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   DATABASE_URL_POOLED=postgresql://neondb_owner:npg_j7xipzATkE2V@ep-hidden-math-azt7hzpx-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   GROQ_API_KEY_1=your_groq_key_1
   GROQ_API_KEY_2=your_groq_key_2
   GROQ_API_KEY_3=your_groq_key_3
   GROQ_API_KEY=your_groq_key_1
   GEMINI_API_KEY_1=your_gemini_key_1
   GEMINI_API_KEY_2=your_gemini_key_2
   GEMINI_API_KEY=your_gemini_key_1
   RESEND_API_KEY=your_resend_api_key
   FROM_EMAIL=Siftrole Feedback <onboarding@resend.dev>
   CONTACT_NOTIFICATION_EMAIL=your_email@gmail.com
   NEXT_PUBLIC_APP_URL=https://siftrole.vercel.app
   NEXT_PUBLIC_SERVER_URL=https://siftrole-server.onrender.com
   ```
6. Click **Deploy**. Vercel will install dependencies, generate Prisma Client automatically, and build the application.

---

### Step 3: Deploy Admin Dashboard (`admin`) on Vercel

1. In Vercel, click **Add New…** → **Project**.
2. Select the same repository: `Utkarsh1087/Siftrole`.
3. Configure project settings:
   - **Project Name**: `siftrole-admin`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`admin`**.
4. Under **Environment Variables**, add:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_j7xipzATkE2V@ep-hidden-math-azt7hzpx.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   DATABASE_URL_POOLED=postgresql://neondb_owner:npg_j7xipzATkE2V@ep-hidden-math-azt7hzpx-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ADMIN_SECRET=your_secure_admin_password
   GROQ_API_KEY_1=your_groq_key_1
   GROQ_API_KEY_2=your_groq_key_2
   GROQ_API_KEY=your_groq_key_1
   GEMINI_API_KEY_1=your_gemini_key_1
   GEMINI_API_KEY=your_gemini_key_1
   RESEND_API_KEY=your_resend_api_key
   FROM_EMAIL=Siftrole <onboarding@resend.dev>
   CONTACT_NOTIFICATION_EMAIL=your_email@gmail.com
   ```
5. Click **Deploy**.

---

### Step 4: Configure GitHub Secrets for Keep-Alive Automation

Once your deployed URLs are live, configure them in your GitHub repository so the scheduled keep-alive workflow pings them:

1. Open your repository on GitHub: `https://github.com/Utkarsh1087/Siftrole`.
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Under **Repository secrets** (or **Variables**), add:
   - `CLIENT_URL`: `https://siftrole.vercel.app`
   - `ADMIN_URL`: `https://siftrole-admin.vercel.app`
   - `SERVER_URL`: `https://siftrole-server.onrender.com`
4. Go to **Actions** tab → **Keep Alive & Health Check** → Click **Run workflow** to test ping all three services immediately.

---

### Step 5: External Free Uptime Monitor (Recommended Extra Safety)

To guarantee that your services are awake 24/7/365 with zero dependency on GitHub Action queue timings:

1. Go to [UptimeRobot.com](https://uptimerobot.com) (Free plan includes 50 monitors with 5-minute intervals).
2. Create 3 **HTTP(s)** monitors:
   - **Monitor 1**: `https://siftrole.vercel.app/api/health`
   - **Monitor 2**: `https://siftrole-admin.vercel.app/api/health`
   - **Monitor 3**: `https://siftrole-server.onrender.com/health`
3. Set notification emails. If any service ever slows down or drops, you will receive an alert within seconds.

---

## 📋 Pre-Deployment Checklist

- [x] Sensitive files (`.env`, `.env.local`) are in `.gitignore` and never committed.
- [x] All `.env.example` templates are up to date with clear placeholders.
- [x] Server process crash protection (`uncaughtException`, `unhandledRejection`) installed.
- [x] Health check endpoints (`/health` & `/api/health`) live on client, admin, and server.
- [x] Health checks exempted from rate-limiting middleware.
- [x] Prisma Client generation configured on `postinstall` for seamless cloud builds.
- [x] Monorepo dependencies cleaned (no broken `file:..` references in cloud).
- [x] CI workflow (`.github/workflows/ci.yml`) validates TypeScript and builds on every push.
- [x] Automated 14-minute keep-alive ping workflow (`.github/workflows/keep-alive.yml`) configured.
