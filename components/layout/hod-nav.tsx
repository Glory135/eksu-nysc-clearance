"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Upload, LogOut } from "lucide-react"

import { Logo } from "@/components/Logo"

export function HODNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/hod/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/hod/upload-students",
      label: "Upload Students",
      icon: Upload,
    },
  ]

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/hod/dashboard" className="flex items-center gap-2">
              <Logo size={36}  wrapperClassName="rounded-full overflow-hidden" />
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">NYSC Clearance</p>
                <p className="text-xs text-muted-foreground">HOD Portal</p>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn("gap-2", isActive && "bg-primary text-primary-foreground")}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
