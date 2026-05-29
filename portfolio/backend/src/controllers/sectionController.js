import { validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'

export async function createSection(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const projectId = req.params.projectId
    const { title, description, imageUrl } = req.body
    const agg = await prisma.projectSection.aggregate({
      where: { projectId },
      _max: { order: true },
    })
    const order = (agg._max.order ?? 0) + 1
    const section = await prisma.projectSection.create({
      data: { title, description, imageUrl, projectId, order },
    })
    return res.status(201).json(section)
  } catch (err) {
    if (err.code === 'P2003') return res.status(404).json({ error: 'Project not found' })
    return res.status(500).json({ error: 'Failed to create section' })
  }
}

export async function updateSection(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { title, description } = req.body
    const data = { title, description }
    if ('imageUrl' in req.body) data.imageUrl = req.body.imageUrl

    const section = await prisma.projectSection.update({
      where: { id: req.params.id },
      data,
    })
    return res.json(section)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Section not found' })
    return res.status(500).json({ error: 'Failed to update section' })
  }
}

export async function deleteSection(req, res) {
  try {
    await prisma.projectSection.delete({ where: { id: req.params.id } })
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Section not found' })
    return res.status(500).json({ error: 'Failed to delete section' })
  }
}

export async function reorderSections(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { orderedIds } = req.body
    await prisma.$transaction(
      orderedIds.map((id, i) =>
        prisma.projectSection.update({ where: { id }, data: { order: i + 1 } })
      )
    )
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to reorder sections' })
  }
}
