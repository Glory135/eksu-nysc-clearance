"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"
import { CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewSubmissionDialogProps {
  form: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReviewSubmissionDialog({ form, open, onOpenChange }: ReviewSubmissionDialogProps) {
  const [remarks, setRemarks] = useState("")
  const [action, setAction] = useState<"approve" | "reject" | null>(null)

  const utils = trpc.useUtils()

  const approveMutation = trpc.hod.approveForm.useMutation({
    onSuccess: () => {
      toast.success("Submission approved successfully")
      utils.hod.getDepartmentForms.invalidate()
      onOpenChange(false)
      setRemarks("")
      setAction(null)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve submission")
    },
  })

  const rejectMutation = trpc.hod.rejectForm.useMutation({
    onSuccess: () => {
      toast.success("Submission rejected")
      utils.hod.getDepartmentForms.invalidate()
      onOpenChange(false)
      setRemarks("")
      setAction(null)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject submission")
    },
  })

  const handleApprove = () => {
    setAction("approve")
    approveMutation.mutate({
      formId: form._id.toString(),
      remarks,
    })
  }

  const handleReject = () => {
    if (!remarks.trim()) {
      toast.error("Please provide remarks for rejection")
      return
    }
    setAction("reject")
    rejectMutation.mutate({
      formId: form._id.toString(),
      remarks,
    })
  }

  const isLoading = approveMutation.isPending || rejectMutation.isPending
  const isPending = form.status === "pending"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
          <DialogDescription>Review the student's documents and approve or reject the submission</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Student Name</Label>
              <p className="font-medium">{form.studentId?.name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Matric Number</Label>
              <p className="font-medium">{form.studentId?.matricNumber || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{form.studentId?.email || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    form.status === "pending" ? "secondary" : form.status === "rejected" ? "destructive" : "default"
                  }
                  className="capitalize"
                >
                  {form.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Uploaded Documents</Label>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start bg-transparent" asChild>
                <a href={form.passportUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Passport Photo
                </a>
              </Button>
              <Button variant="outline" className="justify-start bg-transparent" asChild>
                <a href={form.formUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View NYSC Form
                </a>
              </Button>
            </div>
          </div>

          {form.remarks && (
            <div className="space-y-2">
              <Label>Previous Remarks</Label>
              <Alert>
                <AlertDescription>{form.remarks}</AlertDescription>
              </Alert>
            </div>
          )}

          {form.history && form.history.length > 0 && (
            <div className="space-y-2">
              <Label>History</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {form.history.map((entry: any, idx: number) => (
                  <div key={idx} className="text-sm border-l-2 border-primary pl-3 py-1">
                    <p className="font-medium capitalize">
                      {entry.action} by {entry.by?.name || "System"} ({entry.role})
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.at).toLocaleString()}</p>
                    {entry.remarks && <p className="text-xs text-muted-foreground mt-1">{entry.remarks}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPending && (
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional for approval, required for rejection)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any comments or feedback..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Close
          </Button>
          {isPending && (
            <>
              <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
                {isLoading && action === "reject" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </>
                )}
              </Button>
              <Button onClick={handleApprove} disabled={isLoading}>
                {isLoading && action === "approve" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
