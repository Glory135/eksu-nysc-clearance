import { router, publicProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"
import User from "@/lib/db/models/User"

export const authRouter = router({
  setPasswordFromInvite: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ input }) => {
      const { token, password } = input

      const user = await User.findOne({
        inviteToken: token,
        inviteTokenExpiry: { $gt: new Date() },
      })

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired invite token",
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      user.password = hashedPassword
      user.accountStatus = "active"
      user.inviteToken = undefined
      user.inviteTokenExpiry = undefined

      await user.save()

      return {
        success: true,
        message: "Password set successfully. You can now log in.",
      }
    }),

  verifyInviteToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
    const user = await User.findOne({
      inviteToken: input.token,
      inviteTokenExpiry: { $gt: new Date() },
    }).populate("department")

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid or expired invite token",
      })
    }

    return {
      valid: true,
      name: user.name,
      email: user.email,
      department: user.department.name,
    }
  }),
})
