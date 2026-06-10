import { validationResult } from 'express-validator'
import { Resend } from 'resend'
import prisma from '../lib/prisma.js'

async function upsertContact(data) {
  const existing = await prisma.contactInfo.findFirst()
  if (existing) {
    return prisma.contactInfo.update({ where: { id: existing.id }, data })
  }
  return prisma.contactInfo.create({ data })
}

export async function getContact(_req, res) {
  try {
    const info = await prisma.contactInfo.findFirst()
    return res.json(info ?? {})
  } catch {
    return res.status(500).json({ error: 'Failed to fetch contact info' })
  }
}

export async function updateContact(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { phone, email, location, toEmail } = req.body
    const info = await upsertContact({
      phone:    phone    || null,
      email:    email    || null,
      location: location || null,
      toEmail:  toEmail  || null,
    })
    return res.json(info)
  } catch {
    return res.status(500).json({ error: 'Failed to update contact info' })
  }
}

export async function sendContactMessage(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { name, email, message } = req.body

    const info = await prisma.contactInfo.findFirst()
    const recipient = info?.toEmail || process.env.ADMIN_EMAIL
    if (!recipient) {
      return res.status(500).json({ error: 'No recipient email configured.' })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[contact/send] RESEND_API_KEY missing in env')
      return res.status(500).json({ error: 'Email service not configured on server.' })
    }

    const resend = new Resend(apiKey)

    const { error: sendError } = await resend.emails.send({
      from:     'Portfolio Contact <onboarding@resend.dev>',
      to:       [recipient],
      reply_to: email,
      subject:  `New message from ${name}`,
      text:     `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#6366f1">New contact form message</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#666;width:80px">Name</td><td style="padding:6px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${email}">${email}</a></td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f4f4f5;border-radius:8px;white-space:pre-wrap">${message}</div>
        </div>
      `,
    })

    if (sendError) {
      console.error('[contact/send] Resend error:', sendError)
      return res.status(500).json({ error: `Email delivery failed: ${sendError.message}` })
    }

    console.log('[contact/send] Email delivered to', recipient)
    return res.json({ success: true })
  } catch (err) {
    console.error('[contact/send] Unexpected error:', err.message)
    return res.status(500).json({ error: `Unexpected error: ${err.message}` })
  }
}
