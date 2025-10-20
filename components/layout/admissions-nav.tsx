"use client"

import Link from "next/link"
import { Logo } from "@/components/Logo"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { LayoutDashboard, LogOut, User } from "lucide-react"

export function AdmissionsNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admissions/dashboard" className="flex items-center gap-2">
              <Logo size={36} wrapperClassName="rounded-full overflow-hidden" />
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">NYSC Clearance</p>
                <p className="text-xs text-muted-foreground">Admissions Portal</p>
              </div>
            </Link>

            <Link href="/admissions/dashboard">
              <Button variant={pathname === "/admissions/dashboard" ? "default" : "ghost"} size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {session?.user && (
              <div className="hidden md:flex items-center gap-2 mr-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{session.user.name}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
