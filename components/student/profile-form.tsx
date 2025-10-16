"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"
import { Loader2, User } from "lucide-react"

export function ProfileForm() {
  const { data: user } = trpc.student.getProfile.useQuery()
  const updateProfile = trpc.student.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile")
    },
  })

  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    sex: user?.sex || "",
    dateOfBirth: user?.dateOfBirth || "",
    maritalStatus: user?.maritalStatus || "",
    stateOfOrigin: user?.stateOfOrigin || "",
    lga: user?.lga || "",
    graduationDate: user?.graduationDate || "",
    courseOfStudy: user?.courseOfStudy || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>Complete Your Profile</CardTitle>
        </div>
        <CardDescription>
          Fill in your details for the NYSC clearance form. This information will be used to generate your official
          clearance document.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={formData.sex} onValueChange={(value) => handleChange("sex", value)}>
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select value={formData.maritalStatus} onValueChange={(value) => handleChange("maritalStatus", value)}>
                <SelectTrigger id="maritalStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stateOfOrigin">State of Origin</Label>
              <Input
                id="stateOfOrigin"
                placeholder="e.g., Ekiti"
                value={formData.stateOfOrigin}
                onChange={(e) => handleChange("stateOfOrigin", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lga">Local Government Area</Label>
              <Input
                id="lga"
                placeholder="e.g., Ado-Ekiti"
                value={formData.lga}
                onChange={(e) => handleChange("lga", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationDate">Graduation Date</Label>
              <Input
                id="graduationDate"
                type="month"
                value={formData.graduationDate}
                onChange={(e) => handleChange("graduationDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseOfStudy">Course of Study</Label>
              <Input
                id="courseOfStudy"
                placeholder="e.g., Computer Science"
                value={formData.courseOfStudy}
                onChange={(e) => handleChange("courseOfStudy", e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={updateProfile.isPending} className="w-full">
            {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
