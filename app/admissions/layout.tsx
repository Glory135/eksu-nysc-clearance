import type React from "react"
import { AdmissionsNav } from "@/components/layout/admissions-nav"

export default function AdmissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdmissionsNav />
      {children}
    </div>
  )
}
