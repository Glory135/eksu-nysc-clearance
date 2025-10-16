import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db/mongoose"
import User from "@/lib/db/models/User"
import mongoose from "mongoose"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        admissionCode: { label: "Admission Code", type: "text", optional: true },
      },
      // @ts-expect-error - credentials is not typed correctly
      async authorize(credentials: Record<"email" | "password" | "admissionCode", string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()

          const user = await User.findOne({ email: credentials.email }).populate("department")

          if (!user || !user.password) {
            return null
          }

          // Only active accounts can log in
          if (user.accountStatus !== "active") {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)

          if (!isPasswordValid) {
            return null
          }

          if (user.role === "admissions_officer") {
            // Check if officer is active
            if (!user.isActiveOfficer) {
              return null
            }

            // Validate admission code
            if (!credentials.admissionCode || !user.admissionCode) {
              return null
            }

            const isCodeValid = await bcrypt.compare(credentials.admissionCode as string, user.admissionCode)

            if (!isCodeValid) {
              return null
            }
          }

          return {
            id: (user._id as mongoose.Types.ObjectId).toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department?._id?.toString() || null,
            accountStatus: user.accountStatus,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.department = user.department
        token.accountStatus = user.accountStatus
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.department = token.department as string
        session.user.accountStatus = token.accountStatus as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

