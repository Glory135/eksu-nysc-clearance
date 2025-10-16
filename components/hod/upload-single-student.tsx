"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"

export function UploadSingleStudent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    matricNumber: "",
  })

  const utils = trpc.useUtils()

  const uploadMutation = trpc.hod.uploadStudents.useMutation({
    onSuccess: (data) => {
      if (data.errors.length > 0) {
        toast.error(data.errors[0].error)
      } else {
        toast.success("Student invited successfully!")
        setFormData({ name: "", email: "", matricNumber: "" })
        utils.hod.getDepartmentStudents.invalidate()
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload student")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    uploadMutation.mutate({ students: [formData] })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Single Student</CardTitle>
        <CardDescription>Invite a graduate to the NYSC clearance system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={uploadMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@eksu.edu.ng"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={uploadMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="matricNumber">Matric Number</Label>
            <Input
              id="matricNumber"
              placeholder="EKSU/2020/12345"
              value={formData.matricNumber}
              onChange={(e) => setFormData({ ...formData, matricNumber: e.target.value })}
              required
              disabled={uploadMutation.isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? "Sending Invite..." : "Send Invite"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
