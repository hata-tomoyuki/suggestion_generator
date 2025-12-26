import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { org: true },
        })

        if (!user) {
          return null
        }

        // 簡易的な認証（本番環境では適切なパスワードハッシュ化が必要）
        // ここではemailベースの簡易認証を実装
        // 実際のプロダクションでは、UserモデルにpasswordHashフィールドを追加する必要があります

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.orgId = user.orgId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.orgId = token.orgId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})

