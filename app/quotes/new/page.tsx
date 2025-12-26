import { getUsers } from "@/lib/actions/quotes"
import { requireAuth } from "@/lib/auth"
import { createQuote } from "@/lib/actions/quotes"
import { redirect } from "next/navigation"
import QuoteForm from "@/components/quotes/quote-form"

export default async function NewQuotePage() {
  await requireAuth()
  const users = await getUsers()

  async function handleSubmit(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const clientName = formData.get("clientName") as string
    const clientContactName = formData.get("clientContactName") as string
    const clientEmail = formData.get("clientEmail") as string
    const pmApproverUserId = formData.get("pmApproverUserId") as string
    const salesApproverUserId = formData.get("salesApproverUserId") as string
    const templateScale = formData.get("templateScale") as "small" | "medium" | "large"

    const project = await createQuote({
      title,
      clientName,
      clientContactName: clientContactName || undefined,
      clientEmail: clientEmail || undefined,
      pmApproverUserId,
      salesApproverUserId,
      templateScale,
    })

    redirect(`/quotes/${project.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">新規案件作成</h1>
        <QuoteForm users={users} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

