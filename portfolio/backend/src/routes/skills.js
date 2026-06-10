import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import {
  listCategories, createCategory, updateCategory, deleteCategory, reorderCategories,
  createSkill, updateSkill, deleteSkill, reorderSkills,
} from '../controllers/skillController.js'

const router = Router()

const orderedIds = [
  body('orderedIds').isArray({ min: 1 }).withMessage('orderedIds must be a non-empty array'),
  body('orderedIds.*').isString(),
]
const categoryValidation = [body('name').trim().notEmpty().withMessage('name is required')]
const skillValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('proficiency').optional().isInt({ min: 0, max: 100 }).withMessage('proficiency must be 0–100'),
]

// Categories
router.put('/categories/reorder', requireAuth, orderedIds, reorderCategories)
router.get('/categories', listCategories)
router.post('/categories', requireAuth, categoryValidation, createCategory)
router.put('/categories/:id', requireAuth, categoryValidation, updateCategory)
router.delete('/categories/:id', requireAuth, deleteCategory)

// Skills
router.put('/reorder', requireAuth, orderedIds, reorderSkills)
router.post('/', requireAuth, skillValidation, createSkill)
router.put('/:id', requireAuth, skillValidation, updateSkill)
router.delete('/:id', requireAuth, deleteSkill)

export default router
