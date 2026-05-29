import { validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'

export async function getProfile(req, res) {
  const profile = await prisma.profile.findFirst()
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' })
  }
  return res.json(profile)
}

export async function updateProfile(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg })
  }

  const { name, title, bio, avatarUrl, email, socialLinks } = req.body

  const existing = await prisma.profile.findFirst()

  const data = {
    name,
    title,
    bio,
    email,
    ...(avatarUrl !== undefined && { avatarUrl }),
    ...(socialLinks !== undefined && { socialLinks }),
  }

  let profile
  if (existing) {
    profile = await prisma.profile.update({ where: { id: existing.id }, data })
  } else {
    profile = await prisma.profile.create({ data })
  }

  return res.json(profile)
}
