"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { ProjectStatus } from "@prisma/client"

export async function getQuotes(filters?: {
  status?: ProjectStatus
  ownerId?: string
  search?: string
}) {
  const user = await requireAuth()

  interface WhereClause {
    orgId: string
    status?: ProjectStatus
    ownerUserId?: string
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" }
      clientName?: { contains: string; mode: "insensitive" }
    }>
  }

  const where: WhereClause = {
    orgId: user.orgId,
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.ownerId) {
    where.ownerUserId = filters.ownerId
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { clientName: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  const quotes = await prisma.quoteProject.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      pmApprover: {
        select: {
          id: true,
          name: true,
        },
      },
      salesApprover: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return quotes
}

export async function createQuote(data: {
  title: string
  clientName: string
  clientContactName?: string
  clientEmail?: string
  pmApproverUserId: string
  salesApproverUserId: string
  templateScale: "small" | "medium" | "large"
}) {
  const user = await requireAuth()

  // アクティブなRateCardを取得
  const rateCard = await prisma.rateCard.findFirst({
    where: {
      orgId: user.orgId,
      isActive: true,
    },
    orderBy: { version: "desc" },
  })

  if (!rateCard) {
    throw new Error("Active rate card not found")
  }

  const project = await prisma.quoteProject.create({
    data: {
      orgId: user.orgId,
      title: data.title,
      clientName: data.clientName,
      clientContactName: data.clientContactName,
      clientEmail: data.clientEmail,
      ownerUserId: user.id,
      pmApproverUserId: data.pmApproverUserId,
      salesApproverUserId: data.salesApproverUserId,
      templateScale: data.templateScale,
      rateCardVersion: rateCard.version,
      status: ProjectStatus.draft,
    },
  })

  return project
}

export async function getQuote(id: string) {
  const user = await requireAuth()

  const quote = await prisma.quoteProject.findFirst({
    where: {
      id,
      orgId: user.orgId,
    },
    include: {
      owner: true,
      pmApprover: true,
      salesApprover: true,
      requirements: true,
      estimateItems: true,
      proposalSections: {
        include: {
          blocks: {
            include: {
              comments: {
                where: { status: "open" },
                include: {
                  author: true,
                },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
      proposalBlocks: true,
      reviewComments: {
        where: { status: "open" },
        include: {
          author: true,
        },
      },
    },
  })

  return quote
}

export async function getUsers() {
  const user = await requireAuth()

  const users = await prisma.user.findMany({
    where: {
      orgId: user.orgId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  return users
}

