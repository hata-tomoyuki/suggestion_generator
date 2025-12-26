"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createComment, resolveComment } from "@/lib/actions/comments"
import Link from "next/link"

interface CommentModalProps {
  projectId: string
  block: {
    id: string
    content: string
    blockType: string
  }
  comments: Array<{
    id: string
    body: string
    status: string
    author: {
      name: string
    }
    resolvedBy: {
      name: string
    } | null
    createdAt: Date
  }>
}

export default function CommentModal({ projectId, block, comments }: CommentModalProps) {
  const router = useRouter()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await createComment(projectId, block.id, newComment)
      setNewComment("")
      router.refresh()
    } catch (error) {
      alert("コメントの投稿に失敗しました")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async (commentId: string) => {
    setIsSubmitting(true)
    try {
      await resolveComment(commentId)
      router.refresh()
    } catch (error) {
      alert("コメントの解決に失敗しました")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">コメント</h2>
          <Link
            href={`/quotes/${projectId}`}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Link>
        </div>

        <div className="mb-6 rounded border p-4">
          <p className="text-sm text-gray-600">ブロック内容:</p>
          <p className="mt-1">{block.content}</p>
        </div>

        <div className="mb-6 space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded border p-4 ${
                comment.status === "resolved" ? "bg-gray-50 opacity-60" : ""
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{comment.author.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                {comment.status === "open" && (
                  <button
                    onClick={() => handleResolve(comment.id)}
                    disabled={isSubmitting}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    解決
                  </button>
                )}
                {comment.status === "resolved" && comment.resolvedBy && (
                  <span className="text-xs text-gray-500">
                    解決済み ({comment.resolvedBy.name})
                  </span>
                )}
              </div>
              <p className="text-sm">{comment.body}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-500">コメントはありません</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Link
              href={`/quotes/${projectId}`}
              className="rounded border px-4 py-2 hover:bg-gray-50"
            >
              閉じる
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "投稿中..." : "投稿"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

