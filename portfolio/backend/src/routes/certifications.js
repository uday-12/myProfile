import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import {
  listCertifications, createCertification, updateCertification,
  deleteCertification, reorderCertifications,
} from '../controllers/certificationController.js'

const router = Router()

const orderedIdsValidation = [
  body('orderedIds').isArray({ min: 1 }).withMessage('orderedIds must be a non-empty array'),
  body('orderedIds.*').isString(),
]

const certValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('issuer').trim().notEmpty().withMessage('issuer is required'),
  body('credentialUrl').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('credentialUrl must be a valid URL'),
]

router.put('/reorder', requireAuth, orderedIdsValidation, reorderCertifications)
router.get('/', listCertifications)
router.post('/', requireAuth, certValidation, createCertification)
router.put('/:id', requireAuth, certValidation, updateCertification)
router.delete('/:id', requireAuth, deleteCertification)

export default router
