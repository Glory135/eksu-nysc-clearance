import { HODsManagement } from "@/components/admin/hods-management"

export default function HODsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Heads of Department</h1>
        <p className="text-muted-foreground">Create HOD accounts and assign them to departments</p>
      </div>

      <HODsManagement />
    </div>
  )
}
