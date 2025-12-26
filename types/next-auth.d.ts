import { UserRole } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      orgId: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    orgId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    orgId: string
  }
}

