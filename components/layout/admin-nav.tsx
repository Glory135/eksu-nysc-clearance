"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, Users, UserCheck, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Departments",
    href: "/admin/departments",
    icon: Building2,
  },
  {
    title: "HODs",
    href: "/admin/hods",
    icon: UserCheck,
  },
  {
    title: "Admissions Officers",
    href: "/admin/officers",
    icon: Users,
  },
  {
    title: "Audit",
    href: "/admin/audit",
    icon: Shield,
  },
]

import { Logo } from "@/components/Logo"

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-between border-b bg-background px-6 py-4">
      <div className="flex items-center gap-8 w-full">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Logo size={36}  wrapperClassName="rounded-full overflow-hidden" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-none">EKSU NYSC</span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
        <div className="md:hidden ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className={cn("flex items-center gap-2 w-full", pathname === item.href && "text-primary")}>
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="hidden md:block">
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  )
}
