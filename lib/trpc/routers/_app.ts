import { router } from "../server"
import { authRouter } from "./auth"
import { hodRouter } from "./hod"
import { studentRouter } from "./student"
import { admissionsRouter } from "./admissions"
import { adminRouter } from "./admin"

export const appRouter = router({
  auth: authRouter,
  hod: hodRouter,
  student: studentRouter,
  admissions: admissionsRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
