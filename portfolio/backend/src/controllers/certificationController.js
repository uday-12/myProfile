import { validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'

export async function listCertifications(_req, res) {
  try {
    const items = await prisma.certification.findMany({ orderBy: { order: 'asc' } })
    return res.json(items)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch certifications' })
  }
}

export async function createCertification(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, logoUrl } = req.body
    const agg = await prisma.certification.aggregate({ _max: { order: true } })
    const order = (agg._max.order ?? 0) + 1
    const item = await prisma.certification.create({
      data: {
        name,
        issuer,
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        credentialId: credentialId || null,
        credentialUrl: credentialUrl || null,
        logoUrl: logoUrl || null,
        order,
      },
    })
    return res.status(201).json(item)
  } catch {
    return res.status(500).json({ error: 'Failed to create certification' })
  }
}

export async function updateCertification(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, logoUrl } = req.body
    const item = await prisma.certification.update({
      where: { id: req.params.id },
      data: {
        name,
        issuer,
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        credentialId: credentialId || null,
        credentialUrl: credentialUrl || null,
        logoUrl: logoUrl || null,
      },
    })
    return res.json(item)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Certification not found' })
    return res.status(500).json({ error: 'Failed to update certification' })
  }
}

export async function deleteCertification(req, res) {
  try {
    await prisma.certification.delete({ where: { id: req.params.id } })
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Certification not found' })
    return res.status(500).json({ error: 'Failed to delete certification' })
  }
}

export async function reorderCertifications(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { orderedIds } = req.body
    await prisma.$transaction(
      orderedIds.map((id, i) =>
        prisma.certification.update({ where: { id }, data: { order: i + 1 } })
      )
    )
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to reorder certifications' })
  }
}
