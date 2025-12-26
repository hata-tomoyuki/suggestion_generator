"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import * as bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

export async function createShareLink(
  projectId: string,
  password: string,
  expiresAt: Date
) {
  const user = await requireAuth()

  const token = randomBytes(32).toString("hex")
  const passwordHash = await bcrypt.hash(password, 10)

  const shareLink = await prisma.shareLink.create({
    data: {
      projectId,
      token,
      passwordHash,
      expiresAt,
      createdByUserId: user.id,
    },
  })

  return shareLink
}

export async function verifyShareLink(token: string, password: string) {
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: { project: true },
  })

  if (!shareLink) {
    throw new Error("Invalid token")
  }

  if (shareLink.revokedAt) {
    throw new Error("Share link has been revoked")
  }

  if (shareLink.expiresAt < new Date()) {
    throw new Error("Share link has expired")
  }

  const isValid = await bcrypt.compare(password, shareLink.passwordHash)
  if (!isValid) {
    throw new Error("Invalid password")
  }

  return shareLink
}

