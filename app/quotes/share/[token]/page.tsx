import { verifyShareLink } from "@/lib/actions/share"
import { getQuote } from "@/lib/actions/quotes"
import ShareView from "@/components/quotes/share-view"

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ password?: string }>
}) {
  const { token } = await params
  const { password } = await searchParams

  if (!password) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
          <h2 className="text-center text-2xl font-bold">パスワードを入力</h2>
          <form method="get" className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              認証
            </button>
          </form>
        </div>
      </div>
    )
  }

  try {
    const shareLink = await verifyShareLink(token, password)
    const quote = await getQuote(shareLink.projectId)

    if (!quote) {
      return <div>案件が見つかりません</div>
    }

    return <ShareView quote={quote} />
  } catch (error: any) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">エラー</p>
            <p className="mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }
}

