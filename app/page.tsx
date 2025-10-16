"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default async function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    router.push("/login")
  }

  const role = session?.user.role

  if (role === "student") {
    router.push("/student/dashboard")
  } else if (role === "hod") {
    router.push("/hod/dashboard")
  } else if (role === "admissions_officer") {
    router.push("/admissions/dashboard")
  } else if (role === "super_admin") {
    router.push("/admin/dashboard")
  }

  router.push("/login")
}
