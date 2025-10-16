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

interface FinalReviewDialogProps {
  form: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FinalReviewDialog({ form, open, onOpenChange }: FinalReviewDialogProps) {
  const [remarks, setRemarks] = useState("")
  const [action, setAction] = useState<"approve" | "reject" | null>(null)

  const utils = trpc.useUtils()

  const finalizeMutation = trpc.admissions.finalizeApproval.useMutation({
    onSuccess: (data) => {
      const approved = data.form.status === "admissions_approved"
      toast.success(approved ? "Submission cleared successfully" : "Submission rejected")
      utils.admissions.getApprovedForms.invalidate()
      utils.admissions.getAllForms.invalidate()
      onOpenChange(false)
      setRemarks("")
      setAction(null)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process submission")
    },
  })

  const handleApprove = () => {
    setAction("approve")
    finalizeMutation.mutate({
      formId: form._id.toString(),
      approved: true,
      remarks,
    })
  }

  const handleReject = () => {
    if (!remarks.trim()) {
      toast.error("Please provide remarks for rejection")
      return
    }
    setAction("reject")
    finalizeMutation.mutate({
      formId: form._id.toString(),
      approved: false,
      remarks,
    })
  }

  const isLoading = finalizeMutation.isPending
  const canTakeAction = form.status === "hod_approved"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Final Review</DialogTitle>
          <DialogDescription>Provide final approval or rejection for this NYSC clearance submission</DialogDescription>
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
              <Label className="text-sm text-muted-foreground">Department</Label>
              <p className="font-medium">{form.studentId?.department?.name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    form.status === "hod_approved" ? "outline" : form.status === "rejected" ? "destructive" : "default"
                  }
                  className="capitalize"
                >
                  {form.status === "hod_approved"
                    ? "Awaiting Final Approval"
                    : form.status === "admissions_approved"
                      ? "Cleared"
                      : form.status}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Submitted</Label>
              <p className="font-medium">{new Date(form.createdAt).toLocaleDateString()}</p>
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
              <Label>Review History</Label>
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

          {canTakeAction && (
            <div className="space-y-2">
              <Label htmlFor="remarks">Final Remarks (Optional for approval, required for rejection)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any final comments or feedback..."
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
          {canTakeAction && (
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
                    Clear Student
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
