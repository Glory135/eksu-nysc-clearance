"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.replace("/login")
      return
    }

    const role = session.user.role

    if (role === "student") {
      router.replace("/student/dashboard")
    } else if (role === "hod") {
      router.replace("/hod/dashboard")
    } else if (role === "admissions_officer") {
      router.replace("/admissions/dashboard")
    } else if (role === "super_admin") {
      router.replace("/admin/dashboard")
    } else {
      router.replace("/login")
    }
  }, [session, status, router])

  return null
}
