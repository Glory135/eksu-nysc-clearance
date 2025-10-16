import { UploadForm } from "@/components/student/upload-form"
import { SubmissionStatus } from "@/components/student/submission-status"
import { ClearanceDocument } from "@/components/student/clearance-document"

export default function StudentDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Student Dashboard</h1>
          <p className="text-muted-foreground text-balance mt-2">
            Upload your documents and track your NYSC clearance status
          </p>
        </div>

        <ClearanceDocument />

        <div className="grid gap-6 lg:grid-cols-2">
          <SubmissionStatus />
          <UploadForm />
        </div>
      </div>
    </div>
  )
}
