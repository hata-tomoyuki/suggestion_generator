import { getQuote } from "@/lib/actions/quotes"
import { requireAuth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function QuoteDetailPage({
  params,
  form,
  preview,
  side,
  modal,
}: {
  params: Promise<{ id: string }>
  form: React.ReactNode
  preview: React.ReactNode
  side: React.ReactNode
  modal: React.ReactNode
}) {
  await requireAuth()
  const { id } = await params
  const quote = await getQuote(id)

  if (!quote) {
    redirect("/quotes")
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quote.title}</h1>
            <p className="text-sm text-gray-600">{quote.clientName}</p>
          </div>
          <Link
            href="/quotes"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            一覧に戻る
          </Link>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r">{form}</div>
        <div className="w-1/3 border-r">{preview}</div>
        <div className="w-1/3">{side}</div>
      </div>
      {modal}
    </div>
  )
}

