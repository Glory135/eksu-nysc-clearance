import { DashboardStats } from "@/components/hod/dashboard-stats"
import { SubmissionsList } from "@/components/hod/submissions-list"

export default function HODDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-5 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">HOD Dashboard</h1>
          <p className="text-muted-foreground text-balance mt-2">
            Review and approve NYSC clearance submissions from your department
          </p>
        </div>

        <DashboardStats />

        <SubmissionsList />
      </div>
    </div>
  )
}
