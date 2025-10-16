"use client"

import type React from "react"

import { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, UserCheck, Mail, RefreshCw, Shield, Copy, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function AdmissionsOfficersManagement() {
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "" })
  const [admissionCodeDisplay, setAdmissionCodeDisplay] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const { data: officers, isLoading, refetch } = trpc.admin.getAdmissionsOfficers.useQuery()
  const createMutation = trpc.admin.createAdmissionsOfficer.useMutation()
  const removeMutation = trpc.admin.removeAdmissionsOfficer.useMutation()
  const resetCodeMutation = trpc.admin.resetAdmissionCode.useMutation()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createMutation.mutateAsync(formData)
      setAdmissionCodeDisplay(result.rawAdmissionCode)
      toast({ title: "Admissions Officer created and invitation sent" })
      setFormData({ name: "", email: "" })
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleResetCode = async (officerId: string, officerName: string) => {
    if (!confirm(`Reset admission code for ${officerName}? This will deactivate all other officers.`)) return
    try {
      const result = await resetCodeMutation.mutateAsync({ officerId })
      setAdmissionCodeDisplay(result.rawAdmissionCode)
      setIsCreateOpen(false)
      toast({ title: "Admission code reset and sent via email" })
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this Admissions Officer?")) return
    try {
      await removeMutation.mutateAsync({ id })
      toast({ title: "Admissions Officer removed successfully" })
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
    toast({ title: "Code copied to clipboard" })
  }

  const handleCloseDialog = () => {
    setIsCreateOpen(false)
    setAdmissionCodeDisplay(null)
    setCopiedCode(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Admissions Officers</CardTitle>
            <CardDescription>Manage admissions officer accounts and access codes</CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Officer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : officers && officers.length > 0 ? (
          <div className="space-y-2">
            {officers.map((officer: any) => (
              <div key={officer._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{officer.name}</p>
                      {officer.isActiveOfficer && (
                        <Badge variant="default" className="bg-primary">
                          <Shield className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {officer.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetCode(officer._id, officer.name)}
                    disabled={resetCodeMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleRemove(officer._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No admissions officers yet. Create one to get started.
          </p>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          {admissionCodeDisplay ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Admissions Officer Created
                </DialogTitle>
                <DialogDescription>Save this admission code securely. It will only be shown once.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert className="border-primary bg-primary/5">
                  <Shield className="h-4 w-4 text-primary" />
                  <AlertDescription className="ml-2">
                    <p className="font-semibold text-sm mb-2">Secure Access Code:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-bold text-primary tracking-wider bg-background px-3 py-2 rounded border flex-1">
                        {admissionCodeDisplay}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(admissionCodeDisplay)}
                        className="shrink-0"
                      >
                        {copiedCode ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertDescription className="text-sm">
                    <ul className="list-disc list-inside space-y-1">
                      <li>This code has been sent to the officer via email</li>
                      <li>They will need this code to log in along with their credentials</li>
                      <li>Only one admissions officer can be active at a time</li>
                      <li>You can reset the code anytime from the management panel</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseDialog}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Admissions Officer Account</DialogTitle>
                <DialogDescription>
                  Add a new admissions officer. They will receive a secure access code via email.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="ml-2 text-sm">
                    Creating a new officer will deactivate any existing active officers. Only one officer can be active
                    at a time.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mrs. Jane Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., jane.smith@eksu.edu.ng"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create & Send Invite"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
