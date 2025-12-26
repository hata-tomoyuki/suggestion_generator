"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth, requireEditorOrAdmin } from "@/lib/auth"

export async function createComment(projectId: string, blockId: string, body: string) {
  const user = await requireAuth()

  const comment = await prisma.reviewComment.create({
    data: {
      projectId,
      blockId,
      authorUserId: user.id,
      body,
      status: "open",
    },
    include: {
      author: true,
    },
  })

  return comment
}

export async function resolveComment(commentId: string) {
  const user = await requireEditorOrAdmin()

  const comment = await prisma.reviewComment.update({
    where: { id: commentId },
    data: {
      status: "resolved",
      resolvedByUserId: user.id,
      resolvedAt: new Date(),
    },
  })

  return comment
}

export async function getComments(blockId: string) {
  await requireAuth()

  const comments = await prisma.reviewComment.findMany({
    where: { blockId },
    include: {
      author: true,
      resolvedBy: true,
    },
    orderBy: { createdAt: "asc" },
  })

  return comments
}

