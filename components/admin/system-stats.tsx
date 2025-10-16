"use client"

import { trpc } from "@/lib/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, FileCheck, Clock, CheckCircle2, UserCheck } from "lucide-react"

export function SystemStats() {
  const { data: stats, isLoading } = trpc.admin.getSystemStats.useQuery()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: "Total Departments",
      value: stats.totalDepartments,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "HODs",
      value: stats.totalHODs,
      icon: UserCheck,
      color: "text-purple-600",
    },
    {
      title: "Admissions Officers",
      value: stats.totalAdmissionsOfficers,
      icon: UserCheck,
      color: "text-indigo-600",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Submissions",
      value: stats.totalSubmissions,
      icon: FileCheck,
      color: "text-orange-600",
    },
    {
      title: "Pending HOD Review",
      value: stats.pendingHODReview,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Pending Final Approval",
      value: stats.pendingFinalApproval,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "Cleared Students",
      value: stats.clearedStudents,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
