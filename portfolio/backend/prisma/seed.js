import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })

  console.log(`Admin seeded: ${admin.email}`)

  const existing = await prisma.profile.findFirst()
  if (!existing) {
    await prisma.profile.create({
      data: {
        name: 'Your Name',
        title: 'Software Engineer',
        bio: 'A short bio about yourself.',
        email,
        socialLinks: {},
      },
    })
    console.log('Profile seeded with placeholder values.')
  } else {
    console.log('Profile already exists, skipping.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
