"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink, FileCheck, Calendar } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { useSession } from "next-auth/react"

export function ClearanceDocument() {
  const { data: session } = useSession()
  const { data: submission, isLoading } = trpc.student.getMyForm.useQuery()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clearance Document</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!submission || submission.status !== "admissions_approved" || !submission.compiledUrl) {
    return null
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <CardTitle>NYSC Clearance Form</CardTitle>
            </div>
            <CardDescription>Your official clearance document is ready</CardDescription>
          </div>
          <Badge className="bg-primary">Cleared</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-background p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Clearance ID:</span>
            <span className="font-mono font-semibold">{submission.clearanceId}</span>
          </div>
          {submission.clearanceGeneratedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Generated:</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(submission.clearanceGeneratedAt)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <a href={submission.compiledUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Form
            </a>
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <a href={submission.compiledUrl} download>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs text-amber-900">
            <strong>Important:</strong> Keep your Clearance ID safe. Present this form during NYSC registration.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
