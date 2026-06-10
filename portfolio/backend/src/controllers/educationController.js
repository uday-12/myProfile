import { validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'

export async function listEducation(_req, res) {
  try {
    const items = await prisma.education.findMany({ orderBy: { order: 'asc' } })
    return res.json(items)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch education' })
  }
}

export async function createEducation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { school, degree, fieldOfStudy, startDate, endDate, grade, activities, description, skills, logoUrl } = req.body
    const agg = await prisma.education.aggregate({ _max: { order: true } })
    const order = (agg._max.order ?? 0) + 1
    const item = await prisma.education.create({
      data: {
        school,
        degree: degree || null,
        fieldOfStudy: fieldOfStudy || null,
        startDate: startDate || null,
        endDate: endDate || null,
        grade: grade || null,
        activities: activities || null,
        description: description || null,
        skills: skills ?? [],
        logoUrl: logoUrl || null,
        order,
      },
    })
    return res.status(201).json(item)
  } catch {
    return res.status(500).json({ error: 'Failed to create education' })
  }
}

export async function updateEducation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { school, degree, fieldOfStudy, startDate, endDate, grade, activities, description, skills, logoUrl } = req.body
    const item = await prisma.education.update({
      where: { id: req.params.id },
      data: {
        school,
        degree: degree || null,
        fieldOfStudy: fieldOfStudy || null,
        startDate: startDate || null,
        endDate: endDate || null,
        grade: grade || null,
        activities: activities || null,
        description: description || null,
        skills: skills ?? [],
        logoUrl: logoUrl || null,
      },
    })
    return res.json(item)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Education not found' })
    return res.status(500).json({ error: 'Failed to update education' })
  }
}

export async function deleteEducation(req, res) {
  try {
    await prisma.education.delete({ where: { id: req.params.id } })
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Education not found' })
    return res.status(500).json({ error: 'Failed to delete education' })
  }
}

export async function reorderEducation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { orderedIds } = req.body
    await prisma.$transaction(
      orderedIds.map((id, i) =>
        prisma.education.update({ where: { id }, data: { order: i + 1 } })
      )
    )
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to reorder education' })
  }
}
