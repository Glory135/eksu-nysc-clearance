import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth/config"

export default NextAuth(authOptions)
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
