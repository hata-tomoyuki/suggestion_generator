import { getQuote } from "@/lib/actions/quotes"
import EditBlockModal from "@/components/proposal/edit-block-modal"

interface ProposalBlock {
  id: string
  content: string
  blockType: string
}

export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>
}) {
  const { id, blockId } = await params
  const quote = await getQuote(id)
  const block = quote?.proposalBlocks.find((b: ProposalBlock) => b.id === blockId)

  if (!quote || !block) {
    return <div>ブロックが見つかりません</div>
  }

  return <EditBlockModal projectId={id} block={block} />
}

