import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import { updateSection, deleteSection } from '../controllers/sectionController.js'

const router = Router()

const sectionValidation = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('imageUrl').optional({ nullable: true }).isURL().withMessage('imageUrl must be a valid URL'),
]

router.put('/:id', requireAuth, sectionValidation, updateSection)
router.delete('/:id', requireAuth, deleteSection)

export default router
