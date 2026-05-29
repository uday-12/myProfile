# Portfolio Monorepo

Personal portfolio web app — React frontend + Node/Express backend with Prisma and Neon Postgres.

```
portfolio/
├── frontend/   React + Vite + Tailwind CSS + React Router v6 + dnd-kit
└── backend/    Node.js + Express + Prisma v5 + Neon Postgres + Cloudinary
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS v3, React Router v6, axios, @dnd-kit |
| Backend | Node.js (ESM), Express 5, Prisma v5 |
| Database | Neon (serverless Postgres) |
| File storage | Cloudinary |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## Local development

### Prerequisites

- Node.js 18 or 20 (recommend 20 LTS)
- A [Neon](https://neon.tech) account (free tier is enough)
- A [Cloudinary](https://cloudinary.com) account (free tier is enough)

No local Postgres installation is needed. Neon provides a cloud database
with a standard connection string, so you use it the same way locally and
in production.

---

### 1 — Clone

```bash
git clone <your-repo-url>
cd myProfile/portfolio
```

---

### 2 — Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection Details → **Pooled** connection string |
| `JWT_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `ADMIN_EMAIL` | Any email you want to use for the admin login |
| `ADMIN_PASSWORD` | Any password you want (plain text — hashed by seed script) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard → Settings → Account |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard → Settings → API Keys |
| `ALLOWED_ORIGINS` | `http://localhost:5173` (dev) |
| `PORT` | `4000` (or any free port) |

```bash
npm install

# Create and apply the database schema
npm run db:migrate        # runs `prisma migrate dev` — creates tables in Neon

# Seed the admin user and a blank profile row
npm run db:seed

# Start the dev server with file watching
npm run dev               # → http://localhost:4000
```

> **Tip:** Prisma creates a `prisma/migrations/` folder on first `db:migrate`.
> Commit those files — they're the source of truth for your schema history.

---

### 3 — Frontend setup

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:4000
```

```bash
npm install
npm run dev               # → http://localhost:5173
```

---

### Available scripts

#### Backend

| Script | Command | Purpose |
|---|---|---|
| `dev` | `node --watch src/index.js` | Dev server with hot reload |
| `start` | `node src/index.js` | Production start |
| `build` | `prisma generate && prisma migrate deploy` | Production build (Render runs this) |
| `db:migrate` | `prisma migrate dev` | Create + apply a new migration locally |
| `db:seed` | `prisma db seed` | Upsert admin + blank profile |
| `db:studio` | `prisma studio` | Open Prisma Studio at http://localhost:5555 |

#### Frontend

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## First-time setup (seeding the admin)

The seed script creates:
- One **Admin** row using `ADMIN_EMAIL` + `ADMIN_PASSWORD` (bcrypt-hashed at seed time).
- One blank **Profile** row with placeholder values.

```bash
# Run once after migrate (or again to update the admin password)
cd backend
npm run db:seed
```

Then log in at `/admin/login` with `ADMIN_EMAIL` + `ADMIN_PASSWORD`.

If you ever need to change the admin password, update `ADMIN_PASSWORD` in `.env`
and re-run `npm run db:seed` — the script upserts, so it's safe to run multiple times.

---

## Deployment

### Backend → Render

The `render.yaml` at the repo root pre-configures the service.
Render will detect it automatically on the first deploy.

**Step-by-step:**

1. Push the repository to GitHub.
2. Go to [render.com](https://render.com) → New → **Web Service**.
3. Connect your GitHub repo. Render will find `render.yaml` and pre-fill settings:
   - Root directory: `portfolio/backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
4. Under **Environment**, add every variable from `backend/.env.example`:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled connection string |
   | `JWT_SECRET` | Your 64-char secret |
   | `ADMIN_EMAIL` | Admin login email |
   | `ADMIN_PASSWORD` | Admin login password (plain text) |
   | `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
   | `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
   | `ALLOWED_ORIGINS` | Your Vercel URL (set this after Vercel deploy) |
   | `NODE_VERSION` | `20.11.0` (already in render.yaml) |

5. Click **Create Web Service**. Render will:
   - Install dependencies
   - Run `prisma generate` (creates the Prisma Client)
   - Run `prisma migrate deploy` (applies migrations to Neon)
   - Start the server

6. Note the service URL (e.g. `https://portfolio-backend.onrender.com`).
   You'll need it for the frontend env var and the `ALLOWED_ORIGINS` setting.

> **After deploy:** go back to the Render environment settings and set
> `ALLOWED_ORIGINS` to your Vercel URL, then trigger a redeploy.

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
2. Configure the project:
   - **Root directory:** `portfolio/frontend`
   - **Framework preset:** Vite (auto-detected)
   - **Build command:** `npm run build` (default)
   - **Output directory:** `dist` (default)
3. Under **Environment Variables**, add:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL (e.g. `https://portfolio-backend.onrender.com`) |

4. Click **Deploy**. Vercel will build and publish the site.

The `vercel.json` at `frontend/vercel.json` handles SPA deep-link routing so
that navigating directly to `/admin/dashboard/profile` or `/projects/:id` works
without a 404.

---

### Post-deployment checklist

- [ ] `GET https://your-backend.onrender.com/api/health` returns `{ "status": "ok" }`
- [ ] `ALLOWED_ORIGINS` on Render is set to your exact Vercel URL (no trailing slash)
- [ ] `VITE_API_URL` on Vercel is set to your exact Render URL (no trailing slash)
- [ ] Log in at `https://your-site.vercel.app/admin/login` and confirm the dashboard loads
- [ ] Upload a test image via the Profile editor to verify Cloudinary works

---

## Render free tier — cold starts

The Render free tier **spins down the server after 15 minutes of inactivity**.
The first request after a spin-down takes 30–60 seconds to respond.

**Options:**

1. **Upgrade to Render Starter ($7/month)** — keeps the service always-on.
   Recommended once the portfolio is live and being shared.

2. **Use an external ping service** (free workaround):
   - [cron-job.org](https://cron-job.org) — set a cron job to `GET /api/health`
     every 10 minutes for free. This prevents the server from sleeping.

3. **Accept the cold start** — for a personal portfolio, the homepage's public
   data (profile + companies) is the first thing visitors see. You can show a
   loading spinner while the API wakes up; it's a one-time cost per visit session.

---

## Environment variable reference

### `backend/.env.example`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon pooled Postgres connection string |
| `JWT_SECRET` | Yes | 64-byte hex secret for signing JWTs |
| `ADMIN_EMAIL` | Yes | Admin account email (used by seed + login) |
| `ADMIN_PASSWORD` | Yes | Admin password in plain text (hashed at seed time) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of allowed frontend URLs |
| `PORT` | No | HTTP port (default `4000`; Render overrides automatically) |

### `frontend/.env.example`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Full URL of the backend API (no trailing slash) |
