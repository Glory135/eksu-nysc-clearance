"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Ban, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function UserManagement() {
  const { toast } = useToast()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"suspend" | "activate">("suspend")

  const { data: students, isLoading, refetch } = trpc.admin.getAllUsers.useQuery({ role: "student" })
  const toggleStatus = trpc.admin.toggleUserStatus.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: `User ${actionType === "suspend" ? "suspended" : "activated"} successfully`,
      })
      refetch()
      setActionDialogOpen(false)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleToggleStatus = (user: any, suspend: boolean) => {
    setSelectedUser(user)
    setActionType(suspend ? "suspend" : "activate")
    setActionDialogOpen(true)
  }

  const confirmAction = () => {
    if (selectedUser) {
      toggleStatus.mutate({
        userId: selectedUser._id,
        suspend: actionType === "suspend",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage student accounts and access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student: any) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.matricNumber}</TableCell>
                    <TableCell>{student.department?.name || "N/A"}</TableCell>
                    <TableCell>
                      {student.accountStatus === "suspended" ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {student.accountStatus === "suspended" ? (
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(student, false)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(student, true)}>
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionType === "suspend" ? "Suspend User" : "Activate User"}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "suspend"
                ? "Are you sure you want to suspend this user? They will not be able to access the system."
                : "Are you sure you want to activate this user? They will regain access to the system."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {toggleStatus.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
