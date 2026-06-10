import { validationResult } from 'express-validator'
import nodemailer from 'nodemailer'
import prisma from '../lib/prisma.js'

// singleton upsert helper
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

    const smtpPort = Number(process.env.SMTP_PORT) || 465
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    console.log('[contact/send] SMTP config →', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpPort,
      secure: smtpPort === 465,
      user: smtpUser ? `${smtpUser.slice(0, 4)}…` : 'MISSING',
      pass: smtpPass ? `set (${smtpPass.length} chars)` : 'MISSING',
      recipient,
    })

    if (!smtpUser || !smtpPass) {
      console.error('[contact/send] SMTP credentials missing in env')
      return res.status(500).json({ error: 'SMTP credentials not configured on server.' })
    }

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.gmail.com',
      port:   smtpPort,
      secure: smtpPort === 465,
      auth:   { user: smtpUser, pass: smtpPass },
      tls:    { rejectUnauthorized: false },
    })

    // verify connection before attempting send
    await transporter.verify()

    await transporter.sendMail({
      from:    `"Portfolio Contact" <${smtpUser}>`,
      to:      recipient,
      replyTo: email,
      subject: `New message from ${name}`,
      text:    `Name: ${name}\nEmail: ${email}\n\n${message}`,
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

    console.log('[contact/send] Email delivered to', recipient)
    return res.json({ success: true })
  } catch (err) {
    const detail = {
      code:    err.code,
      command: err.command,
      message: err.message,
      response: err.response,
    }
    console.error('[contact/send] FAILED', JSON.stringify(detail))
    const friendly =
      err.code === 'EAUTH'        ? 'SMTP authentication failed — check SMTP_USER / SMTP_PASS.' :
      err.code === 'ECONNECTION'  ? 'Could not connect to SMTP server — check SMTP_HOST / SMTP_PORT.' :
      err.code === 'ECONNREFUSED' ? 'SMTP connection refused — port may be blocked on this host.' :
      err.code === 'ETIMEDOUT'    ? 'SMTP connection timed out — port 587 is likely blocked; try port 465.' :
      err.code === 'ESOCKET'      ? 'TLS/socket error — if using port 465 ensure secure=true.' :
                                    `Unexpected error (${err.code ?? 'unknown'}): ${err.message}`
    return res.status(500).json({ error: friendly })
  }
}
