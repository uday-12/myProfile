import { Router } from 'express'
import { body } from 'express-validator'
import { getProfile, updateProfile } from '../controllers/profileController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const profileValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('title').trim().notEmpty().withMessage('title is required'),
  body('bio').trim().notEmpty().withMessage('bio is required'),
  body('email').trim().isEmail().withMessage('valid email is required'),
  body('socialLinks').optional().isObject().withMessage('socialLinks must be an object'),
]

router.get('/', getProfile)
router.put('/', requireAuth, profileValidation, updateProfile)

export default router
