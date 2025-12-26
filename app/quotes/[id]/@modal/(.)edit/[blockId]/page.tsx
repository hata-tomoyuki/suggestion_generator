import { getQuote } from "@/lib/actions/quotes"
import EditBlockModal from "@/components/proposal/edit-block-modal"

export default async function EditBlockModalPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>
}) {
  const { id, blockId } = await params
  const quote = await getQuote(id)
  const block = quote?.proposalBlocks.find((b: any) => b.id === blockId)

  if (!quote || !block) {
    return null
  }

  return <EditBlockModal projectId={id} block={block} />
}

