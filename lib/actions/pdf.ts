"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getQuote } from "@/lib/actions/quotes"
import { PdfExportStatus } from "@prisma/client"

export async function generatePdfExport(projectId: string) {
  const user = await requireAuth()

  const quote = await getQuote(projectId)
  if (!quote) {
    throw new Error("Project not found")
  }

  interface ProposalBlock {
    id: string
    content: string
    blockType: string
  }

  interface ProposalSection {
    id: string
    title: string
    blocks: ProposalBlock[]
  }

  interface EstimateItem {
    id: string
    category: string
    role: string
    days: number | string
  }

  interface Snapshot {
    projectId: string
    title: string
    clientName: string
    sections: Array<{
      id: string
      title: string
      blocks: Array<{
        id: string
        content: string
        blockType: string
      }>
    }>
    estimateItems: Array<{
      id: string
      category: string
      role: string
      days: number
    }>
    generatedAt: string
  }

  // スナップショット作成
  const snapshot: Snapshot = {
    projectId: quote.id,
    title: quote.title,
    clientName: quote.clientName,
    sections: quote.proposalSections.map((section: ProposalSection) => ({
      id: section.id,
      title: section.title,
      blocks: section.blocks.map((block: ProposalBlock) => ({
        id: block.id,
        content: block.content,
        blockType: block.blockType,
      })),
    })),
    estimateItems: quote.estimateItems.map((item: EstimateItem) => ({
      id: item.id,
      category: item.category,
      role: item.role,
      days: Number(item.days),
    })),
    generatedAt: new Date().toISOString(),
  }

  // PDFエクスポートレコード作成
  const pdfExport = await prisma.pdfExport.create({
    data: {
      projectId,
      fileKey: `pdf/${projectId}/${Date.now()}.pdf`,
      status: PdfExportStatus.queued,
      sourceSnapshot: snapshot,
      generatedByUserId: user.id,
    },
  })

  // 実際のPDF生成は別のジョブキューやバックグラウンド処理で行う
  // ここではレコード作成のみ

  return pdfExport
}

export async function getPdfExports(projectId: string) {
  await requireAuth()

  const exports = await prisma.pdfExport.findMany({
    where: { projectId },
    orderBy: { generatedAt: "desc" },
    include: {
      generatedBy: {
        select: {
          name: true,
        },
      },
    },
  })

  return exports
}

