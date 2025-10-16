import type React from "react"
import { HODNav } from "@/components/layout/hod-nav"

export default function HODLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HODNav />
      {children}
    </div>
  )
}
