# myProfile — Personal Portfolio

A full-stack personal portfolio web app built to showcase companies, projects, and project sections with a private admin dashboard for content management.

Live-editable via an admin panel. Public visitors see a clean, dark-themed portfolio. The admin manages everything through a protected dashboard with drag-and-drop reordering.

---

## What's inside

```
myProfile/
├── render.yaml                  ← Render deployment config (backend)
└── portfolio/
    ├── README.md                ← Full setup + deployment guide
    ├── backend/                 ← Node.js + Express + Prisma + Neon Postgres
    │   ├── prisma/
    │   │   ├── schema.prisma    ← DB models: Admin, Profile, Company, Project, ProjectSection
    │   │   └── seed.js          ← Seeds admin user + blank profile
    │   └── src/
    │       ├── index.js         ← Express entry point, CORS, routes
    │       ├── lib/             ← prisma.js (singleton), cloudinary.js
    │       ├── middleware/      ← auth.js (JWT requireAuth)
    │       ├── controllers/     ← auth, profile, company, project, section, upload
    │       └── routes/          ← auth, profile, companies, projects, sections, upload
    └── frontend/                ← React + Vite + Tailwind CSS
        ├── vercel.json          ← SPA fallback rewrites for Vercel
        └── src/
            ├── lib/api.js       ← axios instance with JWT interceptor
            ├── context/         ← AuthContext, ToastContext
            ├── components/      ← Public UI + admin components
            │   └── admin/       ← CompanyRow, ProjectRow, SectionRow,
            │                       FileUpload, ConfirmDialog
            └── pages/
                ├── Home.jsx         ← Public portfolio (profile + company grid)
                ├── ProjectDetail.jsx← Project page (video + sections)
                └── admin/
                    ├── Login.jsx
                    ├── Dashboard.jsx    ← Sidebar layout with nested routes
                    ├── ProfileEditor.jsx← Edit profile + avatar upload
                    └── ContentManager.jsx ← Companies, projects, sections CRUD + DnD
```

---

## Features

### Public site
- **Home** (`/`) — Profile header (name, title, bio, avatar, social links) followed by a company-grouped grid of project cards
- **Project detail** (`/projects/:id`) — Embedded video player (YouTube / Vimeo / direct file), ordered content sections (title + image + description blocks)
- Fully responsive, dark-themed (zinc + indigo)

### Admin dashboard (`/admin/dashboard`, protected)
- **Login** with email + password, JWT stored in localStorage
- **Profile editor** — edit all fields, upload avatar via Cloudinary
- **Content manager** — full CRUD for Companies → Projects → Sections:
  - Drag-and-drop reordering at all three levels ([@dnd-kit](https://dndkit.com))
  - Optimistic UI updates with automatic rollback on failure
  - Delete confirmations before any destructive action
  - Inline file/image uploads via Cloudinary
  - Toast notifications for every async action

---

## Tech stack

| | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS v3, React Router v6, axios, @dnd-kit, lucide-react |
| **Backend** | Node.js 20 (ESM), Express 5 |
| **ORM** | Prisma v5 |
| **Database** | [Neon](https://neon.tech) — serverless Postgres |
| **File storage** | [Cloudinary](https://cloudinary.com) |
| **Auth** | JWT (`jsonwebtoken` + `bcryptjs`) |
| **Deploy — backend** | [Render](https://render.com) |
| **Deploy — frontend** | [Vercel](https://vercel.com) |

---

## Data model

```
Admin
Profile                         ← single row, the public portfolio identity

Company ──< Project ──< ProjectSection
```

Cascade deletes: deleting a Company removes all its Projects; deleting a Project removes all its Sections.

---

## API surface

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/login` | — | Returns JWT |
| GET | `/api/auth/me` | JWT | Current admin info |
| GET | `/api/profile` | — | Public profile |
| PUT | `/api/profile` | JWT | Update profile |
| GET | `/api/companies` | — | All companies (nested projects + sections) |
| GET | `/api/companies/:id` | — | Single company |
| POST | `/api/companies` | JWT | Create company |
| PUT | `/api/companies/:id` | JWT | Update company |
| DELETE | `/api/companies/:id` | JWT | Delete (cascades) |
| PUT | `/api/companies/reorder` | JWT | Batch reorder |
| PUT | `/api/companies/:id/projects/reorder` | JWT | Reorder projects in company |
| GET | `/api/projects/:id` | — | Single project with sections |
| POST | `/api/projects` | JWT | Create project |
| PUT | `/api/projects/:id` | JWT | Update project |
| DELETE | `/api/projects/:id` | JWT | Delete (cascades) |
| POST | `/api/projects/:id/sections` | JWT | Add section |
| PUT | `/api/projects/:id/sections/reorder` | JWT | Reorder sections |
| PUT | `/api/sections/:id` | JWT | Update section |
| DELETE | `/api/sections/:id` | JWT | Delete section |
| POST | `/api/upload` | JWT | Upload file to Cloudinary (max 50 MB) |

---

## Quick start

```bash
# 1. Backend
cd portfolio/backend
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, ADMIN_*, CLOUDINARY_*, ALLOWED_ORIGINS
npm install
npm run db:migrate          # create tables in Neon
npm run db:seed             # insert admin + blank profile
npm run dev                 # → http://localhost:4000

# 2. Frontend
cd ../frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # → http://localhost:5173
```

See **[portfolio/README.md](portfolio/README.md)** for the full setup guide, deployment walkthrough (Render + Vercel), and environment variable reference.

---

## Deployment

| Service | Platform | Config |
|---|---|---|
| Backend | Render | `render.yaml` at repo root |
| Frontend | Vercel | `portfolio/frontend/vercel.json` + dashboard settings |

Key env vars to set in each platform's dashboard:

**Render** — `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_*`, `ALLOWED_ORIGINS` (set to your Vercel URL)

**Vercel** — `VITE_API_URL` (set to your Render backend URL)

Full step-by-step in [portfolio/README.md → Deployment](portfolio/README.md).
