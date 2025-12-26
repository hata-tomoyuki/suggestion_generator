"use server"

import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { Decimal } from "@prisma/client/runtime/library"

// 0.25人日刻みで丸める関数
function roundToQuarterDay(days: number): Decimal {
  return new Decimal(Math.round(days * 4) / 4)
}

// ベース画面数
const BASE_SCREENS = {
  small: 12.5,
  medium: 27.5,
  large: 45,
}

// PM工数比率
const PM_RATIOS = {
  small: 0.08,
  medium: 0.10,
  large: 0.12,
}

// dataComplexity係数
const DATA_COMPLEXITY_FACTORS = {
  low: 0.90,
  medium: 1.00,
  high: 1.15,
}

interface RequirementPayload {
  templateScale: "small" | "medium" | "large"
  screenMin: number
  screenMax: number
  dataComplexity: "low" | "medium" | "high"
  features: {
    auth?: boolean
    rbac?: boolean
    crud?: boolean
    search?: boolean
    externalApi?: boolean
    [key: string]: boolean | undefined
  }
  nonFunctional?: {
    performance?: boolean
    security?: boolean
    operation?: boolean
  }
}

export const computeEstimate = cache(async (projectId: string) => {
  const project = await prisma.quoteProject.findUnique({
    where: { id: projectId },
    include: {
      requirements: true,
      org: {
        include: {
          rateCards: {
            where: { isActive: true },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  if (!project || !project.requirements) {
    throw new Error("Project or requirements not found")
  }

  const requirements = project.requirements.payload as RequirementPayload
  const rateCard = project.org.rateCards[0]

  if (!rateCard) {
    throw new Error("Active rate card not found")
  }

  const baseScreen = BASE_SCREENS[requirements.templateScale]
  const screenAvg = (requirements.screenMin + requirements.screenMax) / 2
  const screenFactor = Math.max(0.8, Math.min(1.6, screenAvg / baseScreen))

  const dataComplexityFactor = DATA_COMPLEXITY_FACTORS[requirements.dataComplexity]

  // 基本工数計算
  let baseDays = baseScreen * screenFactor * dataComplexityFactor

  // 機能加算
  let featureDays = 0
  if (requirements.features.auth) featureDays += 2.0
  if (requirements.features.rbac) featureDays += 1.5
  if (requirements.features.crud) featureDays += 1.0
  if (requirements.features.search) featureDays += 1.5
  if (requirements.features.externalApi) featureDays += 2.5

  // 非機能要件加算
  if (requirements.nonFunctional?.performance) featureDays += 1.0
  if (requirements.nonFunctional?.security) featureDays += 1.5
  if (requirements.nonFunctional?.operation) featureDays += 1.0

  const totalNonPmDays = roundToQuarterDay(baseDays + featureDays)

  // PM工数計算
  const pmRatio = PM_RATIOS[requirements.templateScale]
  const pmDays = roundToQuarterDay(Number(totalNonPmDays) * pmRatio)

  // ロール別工数配分（簡易版：実際の要件に応じて調整）
  const devDays = roundToQuarterDay(Number(totalNonPmDays) * 0.6)
  const designDays = roundToQuarterDay(Number(totalNonPmDays) * 0.4)

  // EstimateItemを保存/更新
  const estimateItems = [
    { category: "development", role: "dev", days: devDays },
    { category: "development", role: "design", days: designDays },
    { category: "pm", role: "pm", days: pmDays },
  ]

  for (const item of estimateItems) {
    await prisma.estimateItem.upsert({
      where: {
        projectId_category_role: {
          projectId,
          category: item.category,
          role: item.role,
        },
      },
      update: {
        days: item.days,
      },
      create: {
        projectId,
        category: item.category,
        role: item.role,
        days: item.days,
      },
    })
  }

  // 見積サマリを返す
  const items = await prisma.estimateItem.findMany({
    where: { projectId },
  })

  const totalDays = items.reduce((sum, item) => sum + Number(item.days), 0)
  const totalAmount =
    Number(pmDays) * rateCard.pmDayRate +
    Number(devDays) * rateCard.devDayRate +
    Number(designDays) * rateCard.designDayRate

  return {
    items,
    totalDays,
    totalAmount,
    rateCard,
  }
})

