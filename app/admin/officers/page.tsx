import { AdmissionsOfficersManagement } from "@/components/admin/admissions-officers-management"

export default function OfficersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admissions Officers</h1>
        <p className="text-muted-foreground">Create and manage admissions officer accounts</p>
      </div>

      <AdmissionsOfficersManagement />
    </div>
  )
}
