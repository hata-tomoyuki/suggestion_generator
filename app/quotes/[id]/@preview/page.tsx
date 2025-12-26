import { getQuote } from "@/lib/actions/quotes"
import ProposalPreview from "@/components/proposal/proposal-preview"

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quote = await getQuote(id)

  if (!quote) {
    return <div>案件が見つかりません</div>
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <h2 className="mb-4 text-xl font-bold">提案書プレビュー</h2>
      <ProposalPreview projectId={id} sections={quote.proposalSections} />
    </div>
  )
}

