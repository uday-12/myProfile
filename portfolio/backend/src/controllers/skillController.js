import { validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'

const fullInclude = { skills: { orderBy: { order: 'asc' } } }

// ── Categories ────────────────────────────────────────────────────────────────

export async function listCategories(_req, res) {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: fullInclude,
    })
    return res.json(categories)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch skill categories' })
  }
}

export async function createCategory(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { name } = req.body
    const agg = await prisma.skillCategory.aggregate({ _max: { order: true } })
    const order = (agg._max.order ?? 0) + 1
    const category = await prisma.skillCategory.create({
      data: { name, order },
      include: fullInclude,
    })
    return res.status(201).json(category)
  } catch {
    return res.status(500).json({ error: 'Failed to create category' })
  }
}

export async function updateCategory(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const category = await prisma.skillCategory.update({
      where: { id: req.params.id },
      data: { name: req.body.name },
    })
    return res.json(category)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Category not found' })
    return res.status(500).json({ error: 'Failed to update category' })
  }
}

export async function deleteCategory(req, res) {
  try {
    await prisma.skillCategory.delete({ where: { id: req.params.id } })
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Category not found' })
    return res.status(500).json({ error: 'Failed to delete category' })
  }
}

export async function reorderCategories(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { orderedIds } = req.body
    await prisma.$transaction(
      orderedIds.map((id, i) =>
        prisma.skillCategory.update({ where: { id }, data: { order: i + 1 } })
      )
    )
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to reorder categories' })
  }
}

// ── Skills ────────────────────────────────────────────────────────────────────

export async function createSkill(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { name, proficiency = 0, categoryId } = req.body
    const agg = await prisma.skill.aggregate({
      where: { categoryId },
      _max: { order: true },
    })
    const order = (agg._max.order ?? 0) + 1
    const skill = await prisma.skill.create({
      data: { name, proficiency: Number(proficiency), categoryId, order },
    })
    return res.status(201).json(skill)
  } catch {
    return res.status(500).json({ error: 'Failed to create skill' })
  }
}

export async function updateSkill(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { name, proficiency } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (proficiency !== undefined) data.proficiency = Number(proficiency)
    const skill = await prisma.skill.update({ where: { id: req.params.id }, data })
    return res.json(skill)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Skill not found' })
    return res.status(500).json({ error: 'Failed to update skill' })
  }
}

export async function deleteSkill(req, res) {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } })
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Skill not found' })
    return res.status(500).json({ error: 'Failed to delete skill' })
  }
}

export async function reorderSkills(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { orderedIds } = req.body
    await prisma.$transaction(
      orderedIds.map((id, i) =>
        prisma.skill.update({ where: { id }, data: { order: i + 1 } })
      )
    )
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to reorder skills' })
  }
}
