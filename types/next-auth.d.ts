import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      department: string
      accountStatus: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    department: string
    accountStatus: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    department: string
    accountStatus: string
  }
}
