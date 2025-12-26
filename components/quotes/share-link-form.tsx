"use client"

import { useState } from "react"
import { createShareLink } from "@/lib/actions/share"
import { useRouter } from "next/navigation"

interface ShareLinkFormProps {
  projectId: string
}

export default function ShareLinkForm({ projectId }: ShareLinkFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [expiresDays, setExpiresDays] = useState(7)
  const [isCreating, setIsCreating] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresDays)

      const link = await createShareLink(projectId, password, expiresAt)
      const url = `${window.location.origin}/quotes/share/${link.token}`
      setShareLink(url)
      router.refresh()
    } catch (error) {
      alert("共有リンクの作成に失敗しました")
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  if (shareLink) {
    return (
      <div className="rounded-lg border p-4">
        <p className="mb-2 text-sm font-medium">共有リンクが作成されました:</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareLink)
              alert("リンクをコピーしました")
            }}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            コピー
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">共有リンク作成</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          有効期限（日数）
        </label>
        <input
          type="number"
          value={expiresDays}
          onChange={(e) => setExpiresDays(parseInt(e.target.value))}
          min="1"
          max="365"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isCreating}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isCreating ? "作成中..." : "作成"}
      </button>
    </form>
  )
}

