"use server"

import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@prisma/client"
import { requireAuth } from "@/lib/auth"

export async function approveByPM(projectId: string) {
  const user = await requireAuth()

  const project = await prisma.quoteProject.findUnique({
    where: { id: projectId },
    include: {
      reviewComments: {
        where: { status: "open" },
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  if (project.pmApproverUserId !== user.id) {
    throw new Error("Unauthorized: Only PM approver can approve")
  }

  if (project.status !== ProjectStatus.review) {
    throw new Error("Project must be in review status")
  }

  if (project.reviewComments.length > 0) {
    throw new Error("Cannot approve: unresolved comments exist")
  }

  await prisma.quoteProject.update({
    where: { id: projectId },
    data: {
      pmApprovedAt: new Date(),
    },
  })

  // 両方承認済みならApprovedに
  const updated = await prisma.quoteProject.findUnique({
    where: { id: projectId },
  })

  if (updated?.pmApprovedAt && updated?.salesApprovedAt) {
    await prisma.quoteProject.update({
      where: { id: projectId },
      data: { status: ProjectStatus.approved },
    })
  }
}

export async function approveBySales(projectId: string) {
  const user = await requireAuth()

  const project = await prisma.quoteProject.findUnique({
    where: { id: projectId },
    include: {
      reviewComments: {
        where: { status: "open" },
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  if (project.salesApproverUserId !== user.id) {
    throw new Error("Unauthorized: Only sales approver can approve")
  }

  if (project.status !== ProjectStatus.review) {
    throw new Error("Project must be in review status")
  }

  if (project.reviewComments.length > 0) {
    throw new Error("Cannot approve: unresolved comments exist")
  }

  await prisma.quoteProject.update({
    where: { id: projectId },
    data: {
      salesApprovedAt: new Date(),
    },
  })

  // 両方承認済みならApprovedに
  const updated = await prisma.quoteProject.findUnique({
    where: { id: projectId },
  })

  if (updated?.pmApprovedAt && updated?.salesApprovedAt) {
    await prisma.quoteProject.update({
      where: { id: projectId },
      data: { status: ProjectStatus.approved },
    })
  }
}

export async function submitForReview(projectId: string) {
  await requireAuth()

  await prisma.quoteProject.update({
    where: { id: projectId },
    data: {
      status: ProjectStatus.review,
      pmApprovedAt: null,
      salesApprovedAt: null,
    },
  })
}

