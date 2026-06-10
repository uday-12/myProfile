import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import {
  listEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducation,
} from '../controllers/educationController.js'

const router = Router()

const orderedIdsValidation = [
  body('orderedIds').isArray({ min: 1 }).withMessage('orderedIds must be a non-empty array'),
  body('orderedIds.*').isString().withMessage('each id must be a string'),
]

const educationValidation = [
  body('school').trim().notEmpty().withMessage('school is required'),
]

router.put('/reorder', requireAuth, orderedIdsValidation, reorderEducation)

router.get('/', listEducation)
router.post('/', requireAuth, educationValidation, createEducation)
router.put('/:id', requireAuth, educationValidation, updateEducation)
router.delete('/:id', requireAuth, deleteEducation)

export default router
