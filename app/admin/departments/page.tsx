import { DepartmentsManagement } from "@/components/admin/departments-management"

export default function DepartmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <p className="text-muted-foreground">Create and manage university departments</p>
      </div>

      <DepartmentsManagement />
    </div>
  )
}
