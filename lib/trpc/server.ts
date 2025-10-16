import { initTRPC, TRPCError } from "@trpc/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/db/mongoose"
import superjson from "superjson"

export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions)
  await connectDB()

  return {
    session,
    user: session?.user,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  })
})

// Role-based procedures
export const hodProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "hod") {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({ ctx })
})

export const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "student") {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({ ctx })
})

export const admissionsProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admissions_officer") {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({ ctx })
})
