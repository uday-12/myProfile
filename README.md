# myProfile — Personal Portfolio

A full-stack personal portfolio web app built to showcase experience, projects, skills, education, and certifications — with a private admin dashboard for full content management.

**Live site:** https://my-profile-five-khaki.vercel.app/
**Admin panel:** https://my-profile-five-khaki.vercel.app/admin/login

---

## What's inside

```
myProfile/
├── render.yaml                  ← Render deployment config (backend)
└── portfolio/
    ├── README.md                ← Full setup + deployment guide
    ├── backend/                 ← Node.js + Express + Prisma + Neon Postgres
    │   ├── prisma/
    │   │   ├── schema.prisma    ← DB models (see Data model below)
    │   │   └── seed.js          ← Seeds admin user + blank profile
    │   └── src/
    │       ├── index.js         ← Express entry point, CORS, routes
    │       ├── lib/             ← prisma.js (singleton), cloudinary.js
    │       ├── middleware/      ← auth.js (JWT requireAuth)
    │       ├── controllers/     ← auth, profile, company, project, section,
    │       │                       education, skill, certification, contact, upload
    │       └── routes/          ← auth, profile, companies, projects, sections,
    │                               education, skills, certifications, contact, upload
    └── frontend/                ← React + Vite + Tailwind CSS
        ├── vercel.json          ← SPA fallback rewrites for Vercel
        └── src/
            ├── lib/             ← api.js (axios + JWT interceptor), formatDate.js,
            │                       markdown.jsx (inline rich text renderer)
            ├── context/         ← AuthContext, ToastContext, ThemeContext
            ├── components/      ← Public UI components
            │   └── admin/       ← CompanyRow, ProjectRow, SectionRow,
            │                       EducationRow, CertificationRow,
            │                       FileUpload, ConfirmDialog
            └── pages/
                ├── Home.jsx             ← Full public portfolio page
                ├── ProjectDetail.jsx    ← Project page (video + sections)
                └── admin/
                    ├── Login.jsx
                    ├── Dashboard.jsx          ← Sidebar layout + mobile nav
                    ├── ProfileEditor.jsx      ← Edit profile + avatar upload
                    ├── ContentManager.jsx     ← Companies, projects, sections
                    ├── EducationManager.jsx   ← Education CRUD + reorder
                    ├── SkillsManager.jsx      ← Skill categories + skills
                    ├── CertificationsManager.jsx ← Certifications CRUD + reorder
                    └── ContactManager.jsx     ← Contact info + recipient config
```

---

## Features

### Public site

- **Home** (`/`) — Loads all sections in a single parallel fetch:
  - **Profile header** — name, title, bio (supports markdown-style line breaks), avatar with zoom-in lightbox on click, social links (GitHub, LinkedIn, Twitter/X, and generic URL)
  - **Companies & Projects** — company-grouped grid of project cards; each card links to the project detail page
  - **Education** — timeline of schools with degree, field, grade, dates, skills tags, and institution logo
  - **Skills** — categorised skill bars with proficiency percentages, drag-reorderable in admin
  - **Certifications** — card grid showing issuer, dates, credential ID, and a direct link to the credential URL
  - **Contact Me** — left column shows phone / email / location; right column is a live contact form that delivers messages via [Resend](https://resend.com) email
  - **Footer** — name + current year, auto-updated
- **Project detail** (`/projects/:id`) — embedded video player (YouTube / Vimeo / direct file URL), ordered content sections (title + image + description blocks), project metadata badges
- **Theme switcher** — floating button (bottom-right) cycles between **Dark**, **Light**, **Ocean**, and **Sunset** themes; selection persists in `localStorage`
- Fully responsive, CSS-variable–driven theming

### Admin dashboard (`/admin/dashboard`, JWT-protected)

**Login** — email + password, JWT stored in `localStorage`

Six management sections reachable from the sidebar:

| Section | What you can do |
|---|---|
| **Profile** | Edit name, title, bio, email; upload avatar via Cloudinary; manage social links |
| **Companies & Projects** | Full CRUD for Companies → Projects → Sections; drag-and-drop reordering at all three levels |
| **Education** | Add / edit / delete education entries; set school, degree, field, grade, dates, skills, logo, description; drag-reorder |
| **Overall Skills** | Manage skill categories and individual skills with 0–100 proficiency; drag-reorder both levels |
| **Certifications** | Add / edit / delete certifications with issuer, dates, credential ID + URL, logo; drag-reorder |
| **Contact Info** | Set public phone, email, location; configure recipient email that receives contact-form messages |

Cross-cutting admin capabilities:
- Drag-and-drop reordering at every level ([@dnd-kit](https://dndkit.com))
- Optimistic UI updates with automatic rollback on failure
- Confirm dialogs before any destructive delete
- Inline image / file uploads via Cloudinary (max 50 MB)
- Toast notifications for every async action
- Mobile-responsive sidebar with slide-in drawer + backdrop overlay

---

## Tech stack

| | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS v3, React Router v6, axios, @dnd-kit, lucide-react |
| **Backend** | Node.js 20 (ESM), Express 5 |
| **ORM** | Prisma v5 |
| **Database** | [Neon](https://neon.tech) — serverless Postgres |
| **File storage** | [Cloudinary](https://cloudinary.com) |
| **Email delivery** | [Resend](https://resend.com) |
| **Auth** | JWT (`jsonwebtoken` + `bcryptjs`) |
| **Deploy — backend** | [Render](https://render.com) |
| **Deploy — frontend** | [Vercel](https://vercel.com) |

---

## Data model

```
Admin
Profile                          ← single row, the public portfolio identity

Company ──< Project ──< ProjectSection

Education                        ← ordered list of education entries
SkillCategory ──< Skill          ← categorised skills with proficiency 0–100
Certification                    ← ordered list of certifications
ContactInfo                      ← single row, phone / email / location / toEmail
```

Cascade deletes: deleting a Company removes all its Projects; deleting a Project removes all its Sections; deleting a SkillCategory removes all its Skills.

---

## API surface

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Returns JWT |
| GET | `/api/auth/me` | JWT | Current admin info |

### Profile
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/profile` | — | Public profile |
| PUT | `/api/profile` | JWT | Update profile |

### Companies & Projects
| Method | Path | Auth | Description |
|---|---|---|---|
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

### Education
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/education` | — | All education entries (ordered) |
| POST | `/api/education` | JWT | Create entry |
| PUT | `/api/education/:id` | JWT | Update entry |
| DELETE | `/api/education/:id` | JWT | Delete entry |
| PUT | `/api/education/reorder` | JWT | Batch reorder |

### Skills
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/skills/categories` | — | All categories with skills |
| POST | `/api/skills/categories` | JWT | Create category |
| PUT | `/api/skills/categories/:id` | JWT | Update category |
| DELETE | `/api/skills/categories/:id` | JWT | Delete category (cascades) |
| PUT | `/api/skills/categories/reorder` | JWT | Reorder categories |
| POST | `/api/skills` | JWT | Create skill |
| PUT | `/api/skills/:id` | JWT | Update skill |
| DELETE | `/api/skills/:id` | JWT | Delete skill |
| PUT | `/api/skills/reorder` | JWT | Reorder skills |

### Certifications
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/certifications` | — | All certifications (ordered) |
| POST | `/api/certifications` | JWT | Create certification |
| PUT | `/api/certifications/:id` | JWT | Update certification |
| DELETE | `/api/certifications/:id` | JWT | Delete certification |
| PUT | `/api/certifications/reorder` | JWT | Batch reorder |

### Contact
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/contact` | — | Public contact info |
| PUT | `/api/contact` | JWT | Update contact info + recipient email |
| POST | `/api/contact/send` | — | Send contact-form message via Resend |

### Misc
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| POST | `/api/upload` | JWT | Upload file to Cloudinary (max 50 MB) |

---

## Quick start

```bash
# 1. Backend
cd portfolio/backend
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, ADMIN_*, CLOUDINARY_*, RESEND_API_KEY, ALLOWED_ORIGINS
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

**Render** — `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `ALLOWED_ORIGINS` (set to your Vercel URL)

**Vercel** — `VITE_API_URL` (set to your Render backend URL)

Full step-by-step in [portfolio/README.md → Deployment](portfolio/README.md).
