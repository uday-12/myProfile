import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import { getContact, updateContact, sendContactMessage } from '../controllers/contactController.js'

const router = Router()

router.get('/', getContact)

router.put('/', requireAuth, [
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('toEmail').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Invalid recipient email'),
], updateContact)

router.post('/send', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
], sendContactMessage)

export default router
