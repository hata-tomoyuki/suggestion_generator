import { getQuotes } from "@/lib/actions/quotes"
import { requireAuth } from "@/lib/auth"
import Link from "next/link"
import { ProjectStatus } from "@prisma/client"

const statusLabels: Record<ProjectStatus, string> = {
  draft: "下書き",
  review: "レビュー中",
  approved: "承認済み",
  shared: "共有済み",
  archived: "アーカイブ",
}

const statusColors: Record<ProjectStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  shared: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-600",
}

export default async function QuotesPage() {
  await requireAuth()
  const quotes = await getQuotes()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">案件一覧</h1>
          <Link
            href="/quotes/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            新規作成
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  クライアント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  更新日時
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {quote.title}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{quote.clientName}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{quote.owner.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[quote.status]}`}
                    >
                      {statusLabels[quote.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {quote.updatedAt.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotes.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              案件がありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

