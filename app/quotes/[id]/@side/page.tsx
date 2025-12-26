import { getQuote } from "@/lib/actions/quotes"
import { computeEstimate } from "@/lib/actions/estimate"
import { getCurrentUser } from "@/lib/auth"
import SidePanel from "@/components/quotes/side-panel"

export default async function SidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quote = await getQuote(id)
  const user = await getCurrentUser()

  if (!quote) {
    return <div>案件が見つかりません</div>
  }

  let estimate = null
  if (quote.requirements) {
    try {
      estimate = await computeEstimate(id)
    } catch (error) {
      console.error("Estimate calculation error:", error)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-white p-6">
      <SidePanel quote={quote} estimate={estimate} currentUserId={user?.id} />
    </div>
  )
}
