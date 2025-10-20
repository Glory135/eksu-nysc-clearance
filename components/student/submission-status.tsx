"use client"

import { trpc } from "@/lib/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SubmissionStatus() {
  const { data: form, isLoading } = trpc.student.getMyForm.useQuery()

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!form) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Submission Status</CardTitle>
          <CardDescription>You have not submitted your documents yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Ready to Submit?</AlertTitle>
            <AlertDescription>
              Upload your passport photograph and NYSC mobilization form to begin the clearance process.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          label: "Pending Review",
          description: "Your submission is awaiting review by your Head of Department",
        }
      case "hod_approved":
        return {
          icon: CheckCircle2,
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200",
          label: "HOD Approved",
          description: "Your HOD has approved your submission. Awaiting final approval from Admissions Office",
        }
      case "admissions_approved":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
          label: "Cleared",
          description: "Congratulations! Your NYSC clearance has been approved",
        }
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50 border-red-200",
          label: "Rejected",
          description: "Your submission has been rejected. Please review the remarks below",
        }
      default:
        return {
          icon: Clock,
          color: "text-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
          label: status,
          description: "",
        }
    }
  }

  const statusInfo = getStatusInfo(form.status)
  const StatusIcon = statusInfo.icon

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submission Status</CardTitle>
        <CardDescription>Submitted on {new Date(form.createdAt).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className={statusInfo.bgColor}>
          <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
          <AlertTitle className={statusInfo.color}>{statusInfo.label}</AlertTitle>
          <AlertDescription className="text-foreground">{statusInfo.description}</AlertDescription>
        </Alert>

        {form.remarks && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Remarks:</h3>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{form.remarks}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Uploaded Documents:</h3>
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

        {form.history && form.history.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">History:</h3>
            <div className="space-y-2">
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
      </CardContent>
    </Card>
  )
}
