"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateBlock } from "@/lib/actions/proposal"
import Link from "next/link"

interface EditBlockModalProps {
  projectId: string
  block: {
    id: string
    content: string
    blockType: string
  }
}

export default function EditBlockModal({ projectId, block }: EditBlockModalProps) {
  const router = useRouter()
  const [content, setContent] = useState(block.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateBlock(projectId, block.id, content)
      router.refresh()
      router.push(`/quotes/${projectId}`)
    } catch (error) {
      alert("更新に失敗しました")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">ブロック編集</h2>
          <Link
            href={`/quotes/${projectId}`}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {block.blockType === "paragraph" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={5}
            />
          ) : (
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          )}

          <div className="flex justify-end space-x-2">
            <Link
              href={`/quotes/${projectId}`}
              className="rounded border px-4 py-2 hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

