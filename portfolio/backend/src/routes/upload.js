import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import { uploadFile } from '../controllers/uploadController.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

function handleMulter(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds 50 MB limit' : err.message
      return res.status(400).json({ error: msg })
    }
    if (err) return res.status(500).json({ error: 'Upload error' })
    next()
  })
}

const router = Router()

router.post('/', requireAuth, handleMulter, uploadFile)

export default router
