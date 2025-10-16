import { AdmissionsDashboardStats } from "@/components/admissions/dashboard-stats"
import { AllSubmissionsList } from "@/components/admissions/all-submissions-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

export default function AdmissionsDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-5 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Admissions Dashboard</h1>
          <p className="text-muted-foreground text-balance mt-2">
            Provide final approval for NYSC clearance submissions across all departments
          </p>
        </div>

        <Alert className="border-primary bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2">
            <span className="font-semibold text-primary">Verified via Admission Code</span> — You are logged in as the
            active Admissions Officer with secure code authentication.
          </AlertDescription>
        </Alert>

        <AdmissionsDashboardStats />

        <AllSubmissionsList />
      </div>
    </div>
  )
}
