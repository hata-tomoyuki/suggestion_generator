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

  // スナップショット作成
  const snapshot = {
    projectId: quote.id,
    title: quote.title,
    clientName: quote.clientName,
    sections: quote.proposalSections.map((section: any) => ({
      id: section.id,
      title: section.title,
      blocks: section.blocks.map((block: any) => ({
        id: block.id,
        content: block.content,
        blockType: block.blockType,
      })),
    })),
    estimateItems: quote.estimateItems.map((item: any) => ({
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
      sourceSnapshot: snapshot as any,
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

