import { AuditLogs } from "@/components/admin/audit-logs"
import { UserManagement } from "@/components/admin/user-management"

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Audit</h1>
        <p className="text-muted-foreground">Monitor upload attempts and manage user access</p>
      </div>

      <AuditLogs />
      <UserManagement />
    </div>
  )
}
