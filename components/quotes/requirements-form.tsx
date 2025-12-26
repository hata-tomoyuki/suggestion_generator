"use client"

import { useState, useEffect } from "react"
import { saveRequirements } from "@/lib/actions/requirements"
import { computeEstimate } from "@/lib/actions/estimate"

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

interface RequirementsFormProps {
  projectId: string
  initialData?: RequirementPayload
}

export default function RequirementsForm({
  projectId,
  initialData,
}: RequirementsFormProps) {
  const [formData, setFormData] = useState({
    templateScale: initialData?.templateScale || "medium",
    screenMin: initialData?.screenMin || 10,
    screenMax: initialData?.screenMax || 20,
    dataComplexity: initialData?.dataComplexity || "medium",
    features: {
      auth: initialData?.features?.auth || false,
      rbac: initialData?.features?.rbac || false,
      crud: initialData?.features?.crud || false,
      search: initialData?.features?.search || false,
      externalApi: initialData?.features?.externalApi || false,
    },
    nonFunctional: {
      performance: initialData?.nonFunctional?.performance || false,
      security: initialData?.nonFunctional?.security || false,
      operation: initialData?.nonFunctional?.operation || false,
    },
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        templateScale: initialData.templateScale || "medium",
        screenMin: initialData.screenMin || 10,
        screenMax: initialData.screenMax || 20,
        dataComplexity: initialData.dataComplexity || "medium",
        features: {
          auth: initialData.features?.auth || false,
          rbac: initialData.features?.rbac || false,
          crud: initialData.features?.crud || false,
          search: initialData.features?.search || false,
          externalApi: initialData.features?.externalApi || false,
        },
        nonFunctional: {
          performance: initialData.nonFunctional?.performance || false,
          security: initialData.nonFunctional?.security || false,
          operation: initialData.nonFunctional?.operation || false,
        },
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await saveRequirements(projectId, formData)
      // 見積もりを自動計算
      try {
        await computeEstimate(projectId)
      } catch (error) {
        console.error("Estimate calculation error:", error)
      }
      alert("保存しました")
      window.location.reload()
    } catch (error) {
      alert("保存に失敗しました")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          開発規模
        </label>
        <select
          value={formData.templateScale}
          onChange={(e) =>
            setFormData({ ...formData, templateScale: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
        >
          <option value="small">小規模</option>
          <option value="medium">中規模</option>
          <option value="large">大規模</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            画面数（最小）
          </label>
          <input
            type="number"
            value={formData.screenMin}
            onChange={(e) =>
              setFormData({ ...formData, screenMin: parseInt(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            画面数（最大）
          </label>
          <input
            type="number"
            value={formData.screenMax}
            onChange={(e) =>
              setFormData({ ...formData, screenMax: parseInt(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          データ複雑度
        </label>
        <select
          value={formData.dataComplexity}
          onChange={(e) =>
            setFormData({ ...formData, dataComplexity: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          機能要件
        </label>
        <div className="space-y-2">
          {[
            { key: "auth", label: "認証機能" },
            { key: "rbac", label: "RBAC（ロールベースアクセス制御）" },
            { key: "crud", label: "CRUD操作" },
            { key: "search", label: "検索機能" },
            { key: "externalApi", label: "外部API連携" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features[key as keyof typeof formData.features]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      [key]: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          非機能要件
        </label>
        <div className="space-y-2">
          {[
            { key: "performance", label: "性能要件" },
            { key: "security", label: "セキュリティ要件" },
            { key: "operation", label: "運用要件" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={
                  formData.nonFunctional[key as keyof typeof formData.nonFunctional]
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nonFunctional: {
                      ...formData.nonFunctional,
                      [key]: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaving ? "保存中..." : "保存"}
      </button>
    </form>
  )
}

