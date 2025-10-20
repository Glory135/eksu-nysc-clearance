"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle2, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReviewSubmissionDialog } from "@/components/hod/review-submission-dialog"

export function AuditLogs() {
  const [selectedAudit, setSelectedAudit] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data: allAudits, isLoading: loadingAll } = trpc.admin.getUploadAudits.useQuery({ status: "all" })
  const { data: rejectedAudits, isLoading: loadingRejected } = trpc.admin.getUploadAudits.useQuery({
    status: "rejected",
  })
  const { data: acceptedAudits, isLoading: loadingAccepted } = trpc.admin.getUploadAudits.useQuery({
    status: "accepted",
  })

  const handleViewDetails = (audit: any) => {
    setSelectedAudit(audit)
    setDetailsOpen(true)
  }

  const renderTable = (auditsList: any[], emptyMessage: string) => {
    if (auditsList.length === 0) {
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
              <TableHead>Student</TableHead>
              <TableHead>Matric Number</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditsList.map((audit: any) => (
              <TableRow key={audit._id}>
                <TableCell className="font-medium">
                  {audit.studentId?.name || "N/A"}
                  {audit.studentId?.nyscForm && Array.isArray(audit.studentId.nyscForm.history) &&
                    audit.studentId.nyscForm.history.some((h: any) => h.action === "resubmitted") && (
                      <span className="ml-2 inline-block align-middle">
                        <Badge variant="outline">Resubmitted</Badge>
                      </span>
                    )}
                </TableCell>
                <TableCell>{audit.studentId?.matricNumber || "N/A"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{audit.fileName}</TableCell>
                <TableCell>{(audit.fileSize / 1024).toFixed(2)} KB</TableCell>
                <TableCell>
                  {audit.status === "accepted" ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Accepted
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Rejected
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(audit.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      onClick={() => handleViewDetails(audit)}
                    >
                      <a>
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </a>
                    </Button>
                    {audit.studentId?._id && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // open the read-only review dialog with the student's current NYSC form
                            setSelectedAudit(audit)
                            setDetailsOpen(true)
                          }}
                        >
                          View Submission
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const isLoading = loadingAll || loadingRejected || loadingAccepted

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
          <CardTitle>Upload Audit Logs</CardTitle>
          <CardDescription>Track all passport photo upload attempts and validation results</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rejected" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="rejected">Rejected ({rejectedAudits?.length || 0})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({acceptedAudits?.length || 0})</TabsTrigger>
              <TabsTrigger value="all">All ({allAudits?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="rejected" className="mt-6">
              {renderTable(rejectedAudits || [], "No rejected uploads")}
            </TabsContent>
            <TabsContent value="accepted" className="mt-6">
              {renderTable(acceptedAudits || [], "No accepted uploads")}
            </TabsContent>
            <TabsContent value="all" className="mt-6">
              {renderTable(allAudits || [], "No upload attempts")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Audit Details</DialogTitle>
            <DialogDescription>Detailed information about this upload attempt</DialogDescription>
          </DialogHeader>
          {selectedAudit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                  <p className="text-sm">{selectedAudit.studentId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matric Number</p>
                  <p className="text-sm">{selectedAudit.studentId?.matricNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedAudit.studentId?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upload Date</p>
                  <p className="text-sm">{new Date(selectedAudit.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">File Name</p>
                  <p className="text-sm truncate">{selectedAudit.fileName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">File Size</p>
                  <p className="text-sm">{(selectedAudit.fileSize / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">File Type</p>
                  <p className="text-sm">{selectedAudit.fileType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">
                    {selectedAudit.status === "accepted" ? (
                      <Badge variant="default">Accepted</Badge>
                    ) : (
                      <Badge variant="destructive">Rejected</Badge>
                    )}
                  </p>
                </div>
              </div>

              {selectedAudit.studentId?.nyscForm && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submission</p>
                  <div className="flex items-center gap-2 mt-2">
                    {/* Render the read-only ReviewSubmissionDialog for admins by mounting it here */}
                    <ReviewSubmissionDialog
                      form={selectedAudit.studentId.nyscForm}
                      open={Boolean(selectedAudit && detailsOpen)}
                      onOpenChange={(open: boolean) => {
                        if (!open) {
                          setSelectedAudit(null)
                        }
                        setDetailsOpen(open)
                      }}
                      readOnly
                    />
                    {selectedAudit.studentId.nyscForm.history && selectedAudit.studentId.nyscForm.history.some((h: any) => h.action === "resubmitted") && (
                      <Badge variant="outline">Resubmitted</Badge>
                    )}
                  </div>
                </div>
              )}

              {selectedAudit.rejectionReasons && selectedAudit.rejectionReasons.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Rejection Reasons</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedAudit.rejectionReasons.map((reason: string, index: number) => (
                      <li key={index} className="text-sm text-destructive">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAudit.validationDetails && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Validation Details</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
                    {JSON.stringify(selectedAudit.validationDetails, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
