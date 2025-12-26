"use client"

interface ProposalBlock {
  id: string
  blockType: string
  content: string
}

interface ProposalSection {
  id: string
  title: string
  blocks: ProposalBlock[]
}

interface EstimateItem {
  id: string
  category: string
  role: string
  days: number | string
}

interface ShareViewProps {
  quote: {
    title: string
    clientName: string
    proposalSections?: ProposalSection[]
    estimateItems?: EstimateItem[]
  }
}

export default function ShareView({ quote }: ShareViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-lg bg-white p-8 shadow">
          <h1 className="mb-4 text-3xl font-bold">{quote.title}</h1>
          <p className="text-lg text-gray-600">{quote.clientName}</p>
        </div>

        {quote.proposalSections && quote.proposalSections.length > 0 && (
          <div className="space-y-6">
            {quote.proposalSections.map((section) => (
              <div key={section.id} className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">{section.title}</h2>
                <div className="space-y-3">
                  {section.blocks.map((block) => (
                    <div key={block.id}>
                      {block.blockType === "paragraph" ? (
                        <p className="text-sm leading-relaxed">{block.content}</p>
                      ) : (
                        <ul className="list-disc pl-5">
                          <li className="text-sm">{block.content}</li>
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {quote.estimateItems && quote.estimateItems.length > 0 && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">見積もり</h2>
            <div className="space-y-2">
              {quote.estimateItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.category} ({item.role})
                  </span>
                  <span>{Number(item.days).toFixed(2)}人日</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

