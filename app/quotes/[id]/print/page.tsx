import { getQuote } from "@/lib/actions/quotes"
import { computeEstimate } from "@/lib/actions/estimate"
import { notFound } from "next/navigation"

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quote = await getQuote(id)

  if (!quote) {
    notFound()
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
    <div className="min-h-screen bg-white p-8 print:p-4">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 2cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold">{quote.title}</h1>
          <p className="mt-2 text-lg text-gray-600">{quote.clientName}</p>
        </header>

        {quote.proposalSections && quote.proposalSections.length > 0 && (
          <div className="space-y-8">
            {quote.proposalSections.map((section: any) => (
              <section key={section.id} className="break-inside-avoid">
                <h2 className="mb-4 text-2xl font-semibold">{section.title}</h2>
                <div className="space-y-4">
                  {section.blocks.map((block: any) => (
                    <div key={block.id} className="break-inside-avoid">
                      {block.blockType === "paragraph" ? (
                        <p className="text-sm leading-relaxed">{block.content}</p>
                      ) : (
                        <ul className="list-disc pl-6">
                          <li className="text-sm">{block.content}</li>
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {estimate && (
          <section className="mt-8 break-inside-avoid">
            <h2 className="mb-4 text-2xl font-semibold">見積もり</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-sm font-semibold">カテゴリ</th>
                  <th className="p-2 text-left text-sm font-semibold">ロール</th>
                  <th className="p-2 text-right text-sm font-semibold">人日</th>
                  <th className="p-2 text-right text-sm font-semibold">単価</th>
                  <th className="p-2 text-right text-sm font-semibold">金額</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item: any) => {
                  const rate =
                    item.role === "pm"
                      ? estimate.rateCard.pmDayRate
                      : item.role === "dev"
                      ? estimate.rateCard.devDayRate
                      : estimate.rateCard.designDayRate
                  const amount = Number(item.days) * rate

                  return (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 text-sm">{item.category}</td>
                      <td className="p-2 text-sm">{item.role}</td>
                      <td className="p-2 text-right text-sm">
                        {Number(item.days).toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-sm">
                        ¥{rate.toLocaleString()}
                      </td>
                      <td className="p-2 text-right text-sm font-semibold">
                        ¥{amount.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
                <tr className="border-t-2 font-bold">
                  <td colSpan={2} className="p-2 text-sm">
                    合計
                  </td>
                  <td className="p-2 text-right text-sm">
                    {estimate.totalDays.toFixed(2)}人日
                  </td>
                  <td colSpan={2} className="p-2 text-right text-sm">
                    ¥{estimate.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  )
}

