import { validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'

const fullInclude = {
  projects: {
    orderBy: { order: 'asc' },
    include: {
      sections: { orderBy: { order: 'asc' } },
    },
  },
}

export async function listCompanies(_req, res) {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { order: 'asc' },
      include: fullInclude,
    })
    return res.json(companies)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch companies' })
  }
}

export async function getCompany(req, res) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: fullInclude,
    })
    if (!company) return res.status(404).json({ error: 'Company not found' })
    return res.json(company)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch company' })
  }
}

export async function createCompany(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { name, description, logoUrl } = req.body
    const agg = await prisma.company.aggregate({ _max: { order: true } })
    const order = (agg._max.order ?? 0) + 1
    const company = await prisma.company.create({
      data: { name, description, logoUrl, order },
    })
    return res.status(201).json(company)
  } catch {
    return res.status(500).json({ error: 'Failed to create company' })
  }
}

export async function updateCompany(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { name, description } = req.body
    const data = { name, description }
    if ('logoUrl' in req.body) data.logoUrl = req.body.logoUrl

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data,
    })
    return res.json(company)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Company not found' })
    return res.status(500).json({ error: 'Failed to update company' })
  }
}

export async function deleteCompany(req, res) {
  try {
    await prisma.company.delete({ where: { id: req.params.id } })
    return res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Company not found' })
    return res.status(500).json({ error: 'Failed to delete company' })
  }
}

export async function reorderCompanies(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { orderedIds } = req.body
    await prisma.$transaction(
      orderedIds.map((id, i) =>
        prisma.company.update({ where: { id }, data: { order: i + 1 } })
      )
    )
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to reorder companies' })
  }
}

export async function reorderProjectsInCompany(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })

  try {
    const { orderedIds } = req.body
    await prisma.$transaction(
      orderedIds.map((id, i) =>
        prisma.project.update({ where: { id }, data: { order: i + 1 } })
      )
    )
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to reorder projects' })
  }
}
