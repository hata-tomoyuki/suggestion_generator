"use client"

import { useState } from "react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface QuoteFormProps {
  users: User[]
  onSubmit: (formData: FormData) => Promise<void>
}

export default function QuoteForm({ users, onSubmit }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    await onSubmit(formData)
  }

  const editors = users.filter((u) => u.role === "editor" || u.role === "admin")

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          案件タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
          クライアント名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="clientContactName" className="block text-sm font-medium text-gray-700">
          担当者名
        </label>
        <input
          type="text"
          id="clientContactName"
          name="clientContactName"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          type="email"
          id="clientEmail"
          name="clientEmail"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="templateScale" className="block text-sm font-medium text-gray-700">
          開発規模 <span className="text-red-500">*</span>
        </label>
        <select
          id="templateScale"
          name="templateScale"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="small">小規模</option>
          <option value="medium">中規模</option>
          <option value="large">大規模</option>
        </select>
      </div>

      <div>
        <label htmlFor="pmApproverUserId" className="block text-sm font-medium text-gray-700">
          PM承認者 <span className="text-red-500">*</span>
        </label>
        <select
          id="pmApproverUserId"
          name="pmApproverUserId"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {editors.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="salesApproverUserId" className="block text-sm font-medium text-gray-700">
          営業承認者 <span className="text-red-500">*</span>
        </label>
        <select
          id="salesApproverUserId"
          name="salesApproverUserId"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {editors.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          href="/quotes"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "作成中..." : "作成"}
        </button>
      </div>
    </form>
  )
}

