import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role

  if (role === "student") {
    redirect("/student/dashboard")
  } else if (role === "hod") {
    redirect("/hod/dashboard")
  } else if (role === "admissions_officer") {
    redirect("/admissions/dashboard")
  } else if (role === "super_admin") {
    redirect("/admin/dashboard")
  }

  redirect("/login")
}
