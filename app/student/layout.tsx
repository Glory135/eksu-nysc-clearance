import type React from "react"
import { StudentNav } from "@/components/layout/student-nav"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <StudentNav />
      {children}
    </div>
  )
}
