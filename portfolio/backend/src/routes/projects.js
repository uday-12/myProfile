import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import {
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js'
import {
  createSection,
  reorderSections,
} from '../controllers/sectionController.js'

const router = Router()

const orderedIdsValidation = [
  body('orderedIds')
    .isArray({ min: 1 })
    .withMessage('orderedIds must be a non-empty array'),
  body('orderedIds.*').isString().withMessage('each id must be a string'),
]

const projectValidation = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('videoUrl').optional({ nullable: true }).isURL().withMessage('videoUrl must be a valid URL'),
]

const sectionValidation = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('imageUrl').optional({ nullable: true }).isURL().withMessage('imageUrl must be a valid URL'),
]

router.get('/:id', getProject)
router.post('/', requireAuth, [
  ...projectValidation,
  body('companyId').trim().notEmpty().withMessage('companyId is required'),
], createProject)
router.put('/:id', requireAuth, projectValidation, updateProject)
router.delete('/:id', requireAuth, deleteProject)

// nested section routes under a project
router.post('/:projectId/sections', requireAuth, sectionValidation, createSection)
router.put('/:projectId/sections/reorder', requireAuth, orderedIdsValidation, reorderSections)

export default router
