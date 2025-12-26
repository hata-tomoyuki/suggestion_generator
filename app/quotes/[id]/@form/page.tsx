import { getQuote } from "@/lib/actions/quotes"
import RequirementsForm from "@/components/quotes/requirements-form"

export default async function FormPage({
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
    <div className="h-full overflow-y-auto bg-white p-6">
      <h2 className="mb-4 text-xl font-bold">要件入力</h2>
      <RequirementsForm projectId={id} initialData={quote.requirements?.payload} />
    </div>
  )
}

