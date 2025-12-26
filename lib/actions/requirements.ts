"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function saveRequirements(projectId: string, payload: any) {
  await requireAuth()

  await prisma.quoteRequirement.upsert({
    where: { projectId },
    update: {
      payload,
    },
    create: {
      projectId,
      payload,
    },
  })

  await prisma.quoteProject.update({
    where: { id: projectId },
    data: { requirementsUpdatedAt: new Date() },
  })
}

