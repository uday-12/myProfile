import { validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'

const fullInclude = {
  sections: { orderBy: { order: 'asc' } },
}

export async function getProject(req, res) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: fullInclude,
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    return res.json(project)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch project' })
  }
}

export async function createProject(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { title, description, videoUrl, companyId } = req.body
    const agg = await prisma.project.aggregate({
      where: { companyId },
      _max: { order: true },
    })
    const order = (agg._max.order ?? 0) + 1
    const project = await prisma.project.create({
      data: { title, description, videoUrl, companyId, order },
    })
    return res.status(201).json(project)
  } catch (err) {
    if (err.code === 'P2003') return res.status(404).json({ error: 'Company not found' })
    return res.status(500).json({ error: 'Failed to create project' })
  }
}

export async function updateProject(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { title, description } = req.body
    const data = { title, description }
    if ('videoUrl' in req.body) data.videoUrl = req.body.videoUrl

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
    })
    return res.json(project)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Project not found' })
    return res.status(500).json({ error: 'Failed to update project' })
  }
}

export async function deleteProject(req, res) {
  try {
    await prisma.project.delete({ where: { id: req.params.id } })
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Project not found' })
    return res.status(500).json({ error: 'Failed to delete project' })
  }
}
