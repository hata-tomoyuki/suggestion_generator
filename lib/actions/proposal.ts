"use server"

import { prisma } from "@/lib/prisma"
import { ProposalBlockType } from "@prisma/client"

interface ProposalSection {
  sectionKey: string
  title: string
  blocks: Array<{
    blockKey: string
    blockType: ProposalBlockType
    content: string
  }>
}

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

// 提案書のテンプレート（簡易版）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateProposalTemplate(_requirements: RequirementPayload): ProposalSection[] {
  const sections: ProposalSection[] = [
    {
      sectionKey: "background",
      title: "背景・目的",
      blocks: [
        {
          blockKey: "background-1",
          blockType: "paragraph",
          content: "本案件は、お客様のビジネス要件を満たすWebアプリケーションの開発を目的としています。",
        },
      ],
    },
    {
      sectionKey: "scope",
      title: "開発範囲",
      blocks: [
        {
          blockKey: "scope-1",
          blockType: "bullet",
          content: "フロントエンド開発",
        },
        {
          blockKey: "scope-2",
          blockType: "bullet",
          content: "バックエンド開発",
        },
        {
          blockKey: "scope-3",
          blockType: "bullet",
          content: "データベース設計・構築",
        },
      ],
    },
    {
      sectionKey: "estimate",
      title: "見積もり",
      blocks: [
        {
          blockKey: "estimate-1",
          blockType: "paragraph",
          content: "詳細な見積もりは別紙をご参照ください。",
        },
      ],
    },
  ]

  return sections
}

export async function generateProposal(projectId: string) {
  const project = await prisma.quoteProject.findUnique({
    where: { id: projectId },
    include: { requirements: true },
  })

  if (!project || !project.requirements) {
    throw new Error("Project or requirements not found")
  }

  const template = generateProposalTemplate(project.requirements.payload)

  // 既存のセクションを削除（再生成の場合）
  await prisma.proposalSection.deleteMany({
    where: { projectId },
  })

  // セクションとブロックを作成
  for (let i = 0; i < template.length; i++) {
    const sectionTemplate = template[i]
    const section = await prisma.proposalSection.create({
      data: {
        projectId,
        sectionKey: sectionTemplate.sectionKey,
        title: sectionTemplate.title,
        orderIndex: i,
      },
    })

    for (let j = 0; j < sectionTemplate.blocks.length; j++) {
      const blockTemplate = sectionTemplate.blocks[j]
      await prisma.proposalBlock.create({
        data: {
          projectId,
          sectionId: section.id,
          blockKey: blockTemplate.blockKey,
          blockType: blockTemplate.blockType,
          content: blockTemplate.content,
          orderIndex: j,
        },
      })
    }
  }

  await prisma.quoteProject.update({
    where: { id: projectId },
    data: { contentUpdatedAt: new Date() },
  })
}

export async function regenerateProposal(projectId: string) {
  const project = await prisma.quoteProject.findUnique({
    where: { id: projectId },
    include: {
      requirements: true,
      proposalBlocks: {
        where: { isOverridden: false },
      },
    },
  })

  if (!project || !project.requirements) {
    throw new Error("Project or requirements not found")
  }

  const template = generateProposalTemplate(project.requirements.payload)

  // 未overrideのブロックのみ更新
  for (const sectionTemplate of template) {
    const section = await prisma.proposalSection.findUnique({
      where: {
        projectId_sectionKey: {
          projectId,
          sectionKey: sectionTemplate.sectionKey,
        },
      },
    })

    if (!section) continue

    for (const blockTemplate of sectionTemplate.blocks) {
      await prisma.proposalBlock.upsert({
        where: {
          projectId_blockKey: {
            projectId,
            blockKey: blockTemplate.blockKey,
          },
        },
        update: {
          content: blockTemplate.content,
        },
        create: {
          projectId,
          sectionId: section.id,
          blockKey: blockTemplate.blockKey,
          blockType: blockTemplate.blockType,
          content: blockTemplate.content,
          orderIndex: 0,
        },
      })
    }
  }

  await prisma.quoteProject.update({
    where: { id: projectId },
    data: { contentUpdatedAt: new Date() },
  })
}

export async function updateBlock(
  projectId: string,
  blockId: string,
  content: string
) {
  await prisma.proposalBlock.update({
    where: { id: blockId, projectId },
    data: {
      content,
      isOverridden: true,
    },
  })

  await prisma.quoteProject.update({
    where: { id: projectId },
    data: { contentUpdatedAt: new Date() },
  })
}

