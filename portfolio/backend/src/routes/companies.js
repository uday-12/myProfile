import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  reorderCompanies,
  reorderProjectsInCompany,
} from '../controllers/companyController.js'

const router = Router()

const orderedIdsValidation = [
  body('orderedIds')
    .isArray({ min: 1 })
    .withMessage('orderedIds must be a non-empty array'),
  body('orderedIds.*').isString().withMessage('each id must be a string'),
]

const companyValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('logoUrl').optional({ nullable: true }).isURL().withMessage('logoUrl must be a valid URL'),
]

// reorder must be declared before /:id to avoid Express matching "reorder" as an id
router.put('/reorder', requireAuth, orderedIdsValidation, reorderCompanies)

router.get('/', listCompanies)
router.get('/:id', getCompany)
router.post('/', requireAuth, companyValidation, createCompany)
router.put('/:id', requireAuth, companyValidation, updateCompany)
router.delete('/:id', requireAuth, deleteCompany)

router.put('/:companyId/projects/reorder', requireAuth, orderedIdsValidation, reorderProjectsInCompany)

export default router
