import { getQuote } from "@/lib/actions/quotes"
import RequirementsForm from "@/components/quotes/requirements-form"

interface RequirementPayload {
  templateScale?: string
  screenMin?: number
  screenMax?: number
  dataComplexity?: string
  features?: {
    auth?: boolean
    rbac?: boolean
    crud?: boolean
    search?: boolean
    externalApi?: boolean
  }
  nonFunctional?: {
    performance?: boolean
    security?: boolean
    operation?: boolean
  }
}

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
      <RequirementsForm
        projectId={id}
        initialData={
          quote.requirements?.payload && typeof quote.requirements.payload === "object" && !Array.isArray(quote.requirements.payload)
            ? (quote.requirements.payload as RequirementPayload)
            : undefined
        }
      />
    </div>
  )
}

