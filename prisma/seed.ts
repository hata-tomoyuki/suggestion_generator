import 'dotenv/config'
import { UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

async function main() {
  console.log('Seeding database...')

  // Organization作成
  const org = await prisma.organization.create({
    data: {
      name: 'サンプル組織',
    },
  })

  console.log('Created organization:', org.id)

  // Users作成
  const admin = await prisma.user.create({
    data: {
      orgId: org.id,
      name: '管理者',
      email: 'admin@example.com',
      role: UserRole.admin,
    },
  })

  const editor = await prisma.user.create({
    data: {
      orgId: org.id,
      name: '編集者',
      email: 'editor@example.com',
      role: UserRole.editor,
    },
  })

  const pm = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'PM承認者',
      email: 'pm@example.com',
      role: UserRole.editor,
    },
  })

  const sales = await prisma.user.create({
    data: {
      orgId: org.id,
      name: '営業承認者',
      email: 'sales@example.com',
      role: UserRole.editor,
    },
  })

  const viewer = await prisma.user.create({
    data: {
      orgId: org.id,
      name: '閲覧者',
      email: 'viewer@example.com',
      role: UserRole.viewer,
    },
  })

  console.log('Created users:', { admin: admin.id, editor: editor.id, pm: pm.id, sales: sales.id, viewer: viewer.id })

  // RateCard作成
  const rateCard = await prisma.rateCard.create({
    data: {
      orgId: org.id,
      version: 1,
      isActive: true,
      pmDayRate: 100000,
      devDayRate: 120000,
      designDayRate: 80000,
    },
  })

  console.log('Created rate card:', rateCard.id)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

