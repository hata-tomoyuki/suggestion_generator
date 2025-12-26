"use client"

import { ProjectStatus } from "@prisma/client"
import { approveByPM, approveBySales, submitForReview } from "@/lib/actions/approval"
import { generateProposal } from "@/lib/actions/proposal"
import { useRouter } from "next/navigation"
import { useState } from "react"
import ShareLinkForm from "./share-link-form"
import Link from "next/link"

const statusLabels: Record<ProjectStatus, string> = {
  draft: "下書き",
  review: "レビュー中",
  approved: "承認済み",
  shared: "共有済み",
  archived: "アーカイブ",
}

interface EstimateItem {
  id: string
  category: string
  role: string
  days: number | string
}

interface Estimate {
  items: EstimateItem[]
  totalDays: number
  totalAmount: number
}

interface Quote {
  id: string
  status: string
  pmApproverUserId: string
  salesApproverUserId: string
  pmApprovedAt: Date | null
  salesApprovedAt: Date | null
  requirements: unknown
  reviewComments: unknown[]
  pmApprover: {
    name: string
  }
  salesApprover: {
    name: string
  }
}

interface SidePanelProps {
  quote: Quote
  estimate: Estimate | null
  currentUserId?: string
}

export default function SidePanel({ quote, estimate, currentUserId }: SidePanelProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateProposal = async () => {
    setIsLoading(true)
    try {
      await generateProposal(quote.id)
      router.refresh()
    } catch (error) {
      alert("提案書の生成に失敗しました")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    setIsLoading(true)
    try {
      await submitForReview(quote.id)
      router.refresh()
    } catch (error) {
      alert("レビュー提出に失敗しました")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprovePM = async () => {
    setIsLoading(true)
    try {
      await approveByPM(quote.id)
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "承認に失敗しました"
      alert(errorMessage)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveSales = async () => {
    setIsLoading(true)
    try {
      await approveBySales(quote.id)
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "承認に失敗しました"
      alert(errorMessage)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">ステータス</h3>
        <div className="rounded-lg bg-gray-100 p-3">
          <span className="text-sm font-medium">{statusLabels[quote.status]}</span>
        </div>
      </div>

      {estimate && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">見積もり</h3>
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            {estimate.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.category} ({item.role})
                </span>
                <span>{Number(item.days).toFixed(2)}人日</span>
              </div>
            ))}
            <div className="mt-3 border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>合計</span>
                <span>{estimate.totalDays.toFixed(2)}人日</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-600">
                <span>金額</span>
                <span>¥{estimate.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-lg font-semibold">承認者</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">PM承認者:</span>{" "}
            <span className="font-medium">{quote.pmApprover.name}</span>
            {quote.pmApprovedAt && (
              <span className="ml-2 text-green-600">✓ 承認済み</span>
            )}
          </div>
          <div>
            <span className="text-gray-600">営業承認者:</span>{" "}
            <span className="font-medium">{quote.salesApprover.name}</span>
            {quote.salesApprovedAt && (
              <span className="ml-2 text-green-600">✓ 承認済み</span>
            )}
          </div>
        </div>
      </div>

      {quote.reviewComments && quote.reviewComments.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">未解決コメント</h3>
          <div className="rounded-lg bg-yellow-50 p-3">
            <span className="text-sm font-medium text-yellow-800">
              {quote.reviewComments.length}件の未解決コメントがあります
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {quote.status === ProjectStatus.draft && (
          <>
            {!quote.requirements && (
              <button
                onClick={handleGenerateProposal}
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "生成中..." : "提案書を生成"}
              </button>
            )}
            {quote.requirements && (
              <button
                onClick={handleSubmitReview}
                disabled={isLoading}
                className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "提出中..." : "レビューに提出"}
              </button>
            )}
          </>
        )}

        {quote.status === ProjectStatus.review && (
          <>
            {quote.pmApproverUserId === currentUserId && (
              <button
                onClick={handleApprovePM}
                disabled={isLoading || !!quote.pmApprovedAt}
                className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {quote.pmApprovedAt ? "PM承認済み" : "PM承認"}
              </button>
            )}
            {quote.salesApproverUserId === currentUserId && (
              <button
                onClick={handleApproveSales}
                disabled={isLoading || !!quote.salesApprovedAt}
                className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {quote.salesApprovedAt ? "営業承認済み" : "営業承認"}
              </button>
            )}
          </>
        )}

        {(quote.status === ProjectStatus.approved ||
          quote.status === ProjectStatus.shared) && (
          <>
            <ShareLinkForm projectId={quote.id} />
            <Link
              href={`/quotes/${quote.id}/print`}
              target="_blank"
              className="block w-full rounded-md bg-gray-600 px-4 py-2 text-center text-white hover:bg-gray-700"
            >
              PDF表示
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

