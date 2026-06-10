import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import companiesRoutes from './routes/companies.js'
import projectsRoutes from './routes/projects.js'
import sectionsRoutes from './routes/sections.js'
import uploadRoutes from './routes/upload.js'
import educationRoutes from './routes/education.js'
import skillsRoutes from './routes/skills.js'
import certificationsRoutes from './routes/certifications.js'
import contactRoutes from './routes/contact.js'

const app = express()
const PORT = process.env.PORT || 4000

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / health check requests (no Origin header)
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
  })
)
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/companies', companiesRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/sections', sectionsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/education', educationRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/certifications', certificationsRoutes)
app.use('/api/contact', contactRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
