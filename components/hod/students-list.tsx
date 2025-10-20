"use client"

import { trpc } from "@/lib/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

export function StudentsList() {
  const { data: students, isLoading } = trpc.hod.getDepartmentStudents.useQuery()
  const [filterYear, setFilterYear] = useState<number | "all">("all")
  const utils = trpc.useUtils()

  const resendInviteMutation = trpc.hod.resendInvite.useMutation({
    onSuccess: () => {
      toast.success("Invite resent successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resend invite")
    },
  })

  const handleResendInvite = (studentId: string) => {
    resendInviteMutation.mutate({ studentId })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      invited: "secondary",
      active: "default",
      suspended: "destructive",
      inactive: "outline",
    }

    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Students</CardTitle>
        <CardDescription>Manage students in your department ({students?.length || 0} total)</CardDescription>
        <div className="mt-2">
          <label className="text-sm mr-2">Graduation Year:</label>
          <select value={filterYear as any} onChange={(e) => setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))} className="ml-2 rounded-md border px-2 py-1">
            <option value="all">All</option>
            {/* Show recent years up to current */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const year = new Date().getFullYear() - idx
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {!students || students.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No students found. Upload students to get started.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Graduation Year</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .filter((s) => (filterYear === "all" ? true : s.graduationYear === filterYear))
                  .map((student) => (
                  <TableRow key={student._id.toString()}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.graduationYear || "N/A"}</TableCell>
                    <TableCell>{student.matricNumber}</TableCell>
                    <TableCell>{getStatusBadge(student.accountStatus)}</TableCell>
                    <TableCell className="text-right">
                      {student.accountStatus === "invited" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvite(student._id.toString())}
                          disabled={resendInviteMutation.isPending}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Resend Invite
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
