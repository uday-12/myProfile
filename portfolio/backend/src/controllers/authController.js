import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const match = await bcrypt.compare(password, admin.passwordHash)
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

  return res.json({ token })
}

export async function me(req, res) {
  const admin = await prisma.admin.findUnique({
    where: { id: req.adminId },
    select: { id: true, email: true, createdAt: true },
  })

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  return res.json(admin)
}
