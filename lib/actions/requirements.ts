"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { Prisma } from "@prisma/client"

interface RequirementPayload {
  templateScale?: string
  screenMin?: number
  screenMax?: number
  dataComplexity?: string
  features?: {
    auth?: boolean
    rbac?: boolean
    crud?: boolean
    search?: boolean
    externalApi?: boolean
  }
  nonFunctional?: {
    performance?: boolean
    security?: boolean
    operation?: boolean
  }
}

export async function saveRequirements(projectId: string, payload: RequirementPayload) {
  await requireAuth()

  await prisma.quoteRequirement.upsert({
    where: { projectId },
    update: {
      payload: payload as unknown as Prisma.InputJsonValue,
    },
    create: {
      projectId,
      payload: payload as unknown as Prisma.InputJsonValue,
    },
  })

  await prisma.quoteProject.update({
    where: { id: projectId },
    data: { requirementsUpdatedAt: new Date() },
  })
}

