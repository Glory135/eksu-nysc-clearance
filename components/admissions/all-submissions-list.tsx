"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinalReviewDialog } from "./final-review-dialog"

export function AllSubmissionsList() {
  const { data: approvedForms, isLoading: loadingApproved } = trpc.admissions.getApprovedForms.useQuery()
  const { data: allForms, isLoading: loadingAll } = trpc.admissions.getAllForms.useQuery()
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  const pendingFinalApproval = approvedForms || []
  const clearedForms = allForms?.filter((f) => f.status === "admissions_approved") || []
  const rejectedForms = allForms?.filter((f) => f.status === "rejected") || []

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending HOD" },
      hod_approved: { variant: "outline", label: "Awaiting Final Approval" },
      admissions_approved: { variant: "default", label: "Cleared" },
      rejected: { variant: "destructive", label: "Rejected" },
    }

    const config = variants[status] || { variant: "outline" as const, label: status }

    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    )
  }

  const handleReview = (form: any) => {
    setSelectedForm(form)
    setReviewDialogOpen(true)
  }

  const renderTable = (formsList: any[], emptyMessage: string) => {
    if (formsList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Matric Number</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formsList.map((form) => (
              <TableRow key={form._id.toString()}>
                <TableCell className="font-medium">{form.studentId?.name || "N/A"}</TableCell>
                <TableCell>{form.studentId?.matricNumber || "N/A"}</TableCell>
                <TableCell>{form.studentId?.department?.name || "N/A"}</TableCell>
                <TableCell>{new Date(form.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(form.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleReview(form)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const isLoading = loadingApproved || loadingAll

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
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>Review and provide final approval for NYSC clearance submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="pending">Pending ({pendingFinalApproval.length})</TabsTrigger>
              <TabsTrigger value="cleared">Cleared ({clearedForms.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedForms.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-6">
              {renderTable(pendingFinalApproval, "No submissions awaiting final approval")}
            </TabsContent>
            <TabsContent value="cleared" className="mt-6">
              {renderTable(clearedForms, "No cleared submissions")}
            </TabsContent>
            <TabsContent value="rejected" className="mt-6">
              {renderTable(rejectedForms, "No rejected submissions")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedForm && (
        <FinalReviewDialog form={selectedForm} open={reviewDialogOpen} onOpenChange={setReviewDialogOpen} />
      )}
    </>
  )
}
