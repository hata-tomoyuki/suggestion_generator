import { getQuote } from "@/lib/actions/quotes"
import { getComments } from "@/lib/actions/comments"
import CommentModal from "@/components/proposal/comment-modal"

interface ProposalBlock {
  id: string
  content: string
  blockType: string
}

export default async function CommentModalPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>
}) {
  const { id, blockId } = await params
  const quote = await getQuote(id)
  const block = quote?.proposalBlocks.find((b: ProposalBlock) => b.id === blockId)
  const comments = await getComments(blockId)

  if (!quote || !block) {
    return null
  }

  return <CommentModal projectId={id} block={block} comments={comments} />
}

