# Backend API

Node.js + Express + Prisma + Neon Postgres.

Base URL (dev): `http://localhost:4000`

Protected routes require `Authorization: Bearer <token>`.

---

## Auth

### POST /api/auth/login
Login as admin and receive a JWT.

**Body**
```json
{ "email": "admin@example.com", "password": "your_password" }
```
**Response `200`**
```json
{ "token": "<jwt>" }
```
**Errors:** `400` missing fields · `401` bad credentials

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'
```

---

### GET /api/auth/me  🔒
Returns the authenticated admin.

**Response `200`**
```json
{ "id": "...", "email": "admin@example.com", "createdAt": "..." }
```

---

## Profile

### GET /api/profile  (public)
Returns the single public profile row.

**Response `200`**
```json
{
  "id": "...", "name": "Your Name", "title": "Engineer",
  "bio": "...", "avatarUrl": null, "email": "...",
  "socialLinks": {}, "createdAt": "...", "updatedAt": "..."
}
```

```bash
curl http://localhost:4000/api/profile
```

---

### PUT /api/profile  🔒
Update (or create) the profile. All core fields required.

**Body**
```json
{
  "name": "Your Name",
  "title": "Software Engineer",
  "bio": "About me.",
  "email": "me@example.com",
  "avatarUrl": "https://...",
  "socialLinks": { "github": "https://github.com/you" }
}
```
**Response `200`** — updated profile object  
**Errors:** `422` validation · `401` unauthenticated

```bash
curl -X PUT http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","title":"Engineer","bio":"Hi","email":"me@example.com"}'
```

---

## Companies

### GET /api/companies  (public)
All companies ordered by `order` asc, including nested projects and sections.

```bash
curl http://localhost:4000/api/companies
```

---

### GET /api/companies/:id  (public)
Single company with nested projects and sections.

```bash
curl http://localhost:4000/api/companies/COMPANY_ID
```

---

### POST /api/companies  🔒
Create a company. `order` is auto-assigned (max + 1).

**Body**
```json
{ "name": "Acme Corp", "description": "We make things.", "logoUrl": "https://..." }
```
**Response `201`** — created company  
`logoUrl` is optional.

```bash
curl -X POST http://localhost:4000/api/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme","description":"We make things."}'
```

---

### PUT /api/companies/:id  🔒
Update a company.

**Body** — same shape as POST.  
Send `"logoUrl": null` to clear it.

```bash
curl -X PUT http://localhost:4000/api/companies/COMPANY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme v2","description":"Updated."}'
```

---

### DELETE /api/companies/:id  🔒
Delete a company and cascade-delete all its projects and sections.

**Response `200`** `{ "success": true }`

```bash
curl -X DELETE http://localhost:4000/api/companies/COMPANY_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### PUT /api/companies/reorder  🔒
Set display order for all companies.

**Body**
```json
{ "orderedIds": ["id_first", "id_second", "id_third"] }
```
Positions map to array index + 1. Wrapped in a Prisma transaction.

```bash
curl -X PUT http://localhost:4000/api/companies/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderedIds":["aaa","bbb","ccc"]}'
```

---

### PUT /api/companies/:companyId/projects/reorder  🔒
Set display order for projects within a company.

**Body** — same as `/reorder` above.

```bash
curl -X PUT http://localhost:4000/api/companies/COMPANY_ID/projects/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderedIds":["proj1","proj2"]}'
```

---

## Projects

### GET /api/projects/:id  (public)
Single project with its sections ordered by `order` asc.

```bash
curl http://localhost:4000/api/projects/PROJECT_ID
```

---

### POST /api/projects  🔒
Create a project. `order` is auto-assigned within the company.

**Body**
```json
{
  "title": "My Project",
  "description": "What it does.",
  "companyId": "COMPANY_ID",
  "videoUrl": "https://..."
}
```
**Response `201`** — created project  
`videoUrl` is optional.

```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Project","description":"Cool stuff","companyId":"COMPANY_ID"}'
```

---

### PUT /api/projects/:id  🔒
Update a project's title, description, or videoUrl.

**Body**
```json
{ "title": "Updated", "description": "New description.", "videoUrl": null }
```

```bash
curl -X PUT http://localhost:4000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","description":"Better."}'
```

---

### DELETE /api/projects/:id  🔒
Delete a project and cascade-delete its sections.

**Response `200`** `{ "success": true }`

```bash
curl -X DELETE http://localhost:4000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Project Sections

### POST /api/projects/:projectId/sections  🔒
Add a section to a project. `order` is auto-assigned.

**Body**
```json
{ "title": "Overview", "description": "Section text.", "imageUrl": "https://..." }
```
**Response `201`** — created section  
`imageUrl` is optional.

```bash
curl -X POST http://localhost:4000/api/projects/PROJECT_ID/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Overview","description":"Details here."}'
```

---

### PUT /api/sections/:id  🔒
Update a section's title, description, or imageUrl.

```bash
curl -X PUT http://localhost:4000/api/sections/SECTION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Title","description":"Updated text."}'
```

---

### DELETE /api/sections/:id  🔒
Delete a section.

**Response `200`** `{ "success": true }`

```bash
curl -X DELETE http://localhost:4000/api/sections/SECTION_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### PUT /api/projects/:projectId/sections/reorder  🔒
Set display order for sections within a project.

**Body**
```json
{ "orderedIds": ["sec1", "sec2", "sec3"] }
```

```bash
curl -X PUT http://localhost:4000/api/projects/PROJECT_ID/sections/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderedIds":["sec1","sec2"]}'
```

---

## Upload

### POST /api/upload  🔒
Upload an image or video to Cloudinary. Field name must be `file`.  
Max size: **50 MB**.

**Response `200`**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "sample_image",
  "resourceType": "image"
}
```
**Errors:** `400` no file / file too large · `500` Cloudinary error

```bash
curl -X POST http://localhost:4000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

## Error shape

All errors return `{ "error": "human readable message" }` with the appropriate HTTP status code.

| Code | Meaning |
|---|---|
| 400 | Bad request / missing required data |
| 401 | Missing or invalid JWT |
| 404 | Resource not found |
| 422 | Validation failed |
| 500 | Unexpected server error |
