"use client"

import Link from "next/link"
import { ProposalBlockType } from "@prisma/client"

interface ProposalBlock {
  id: string
  blockKey: string
  blockType: ProposalBlockType
  content: string
  isOverridden: boolean
  comments: Array<{
    id: string
    body: string
    author: {
      name: string
    }
  }>
}

interface ProposalSection {
  id: string
  sectionKey: string
  title: string
  blocks: ProposalBlock[]
}

interface ProposalPreviewProps {
  projectId: string
  sections: ProposalSection[]
}

export default function ProposalPreview({
  projectId,
  sections,
}: ProposalPreviewProps) {
  if (sections.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center text-gray-500">
        提案書がまだ生成されていません。要件を入力してから生成してください。
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id} className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">{section.title}</h3>
          <div className="space-y-3">
            {section.blocks.map((block) => (
              <div
                key={block.id}
                className="group relative rounded border p-3 hover:bg-gray-50"
              >
                {block.blockType === "paragraph" ? (
                  <p className="text-sm leading-relaxed">{block.content}</p>
                ) : (
                  <ul className="list-disc pl-5">
                    <li className="text-sm">{block.content}</li>
                  </ul>
                )}
                {block.isOverridden && (
                  <span className="ml-2 text-xs text-blue-600">(編集済み)</span>
                )}
                {block.comments.length > 0 && (
                  <Link
                    href={`/quotes/${projectId}/comment/${block.id}`}
                    className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white"
                  >
                    {block.comments.length}
                  </Link>
                )}
                <Link
                  href={`/quotes/${projectId}/edit/${block.id}`}
                  className="absolute right-2 bottom-2 opacity-0 text-xs text-blue-600 group-hover:opacity-100"
                >
                  編集
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

