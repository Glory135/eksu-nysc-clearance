"use client"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FormDataDisplayProps {
  formData: any
  submissionType?: "manual" | "upload"
}

export function FormDataDisplay({ formData, submissionType }: FormDataDisplayProps) {
  if (submissionType !== "manual" || !formData) {
    return null
  }

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A"
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return date.toLocaleDateString("en-GB")
  }

  const formatDateOfBirth = (dateString: string | Date) => {
    if (!dateString) return { day: "", month: "", year: "" }
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "long" }),
      year: date.getFullYear().toString(),
    }
  }

  const dobParts = formatDateOfBirth(formData.dateOfBirth)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">NYSC Form Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Full Name</Label>
            <p className="font-medium">{formData.name || "N/A"}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Matric Number</Label>
            <p className="font-medium">{formData.matricNumber || "N/A"}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Faculty</Label>
            <p className="font-medium">{formData.faculty || "N/A"}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Department</Label>
            <p className="font-medium">{formData.department || "N/A"}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Course of Study</Label>
            <p className="font-medium">{formData.courseOfStudy || "N/A"}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">JAMB Reg. No.</Label>
            <p className="font-medium">{formData.jambRegNo || "N/A"}</p>
          </div>
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Sex</Label>
            <div className="mt-1">
              <Badge variant="outline" className="capitalize">
                {formData.sex || "N/A"}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Marital Status</Label>
            <div className="mt-1">
              <Badge variant="outline" className="capitalize">
                {formData.maritalStatus || "N/A"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <Label className="text-sm text-muted-foreground">Date of Birth</Label>
          <div className="flex gap-4 mt-1">
            <div className="text-center">
              <div className="border-b border-gray-300 px-2 py-1 min-w-[60px]">
                {dobParts.day}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Day</div>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 px-2 py-1 min-w-[80px]">
                {dobParts.month}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Month</div>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 px-2 py-1 min-w-[60px]">
                {dobParts.year}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Year</div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">State of Origin</Label>
            <p className="font-medium">{formData.stateOfOrigin || "N/A"}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Local Government of Origin</Label>
            <p className="font-medium">{formData.lga || "N/A"}</p>
          </div>
        </div>

        {/* Academic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Graduation Date</Label>
            <p className="font-medium">{formatDate(formData.graduationDate) || "N/A"}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Phone Number</Label>
            <p className="font-medium">{formData.phone || "N/A"}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Email Address</Label>
            <p className="font-medium">{formData.email || "N/A"}</p>
          </div>
        </div>

        {/* Student Declaration */}
        {formData.studentDeclaration && (
          <div className="border-t pt-4">
            <Label className="text-sm text-muted-foreground">Student Declaration</Label>
            <div className="mt-2 p-3 bg-muted/50 rounded-md">
              <p className="text-sm italic mb-2">
                "I Confirm that the information provided by me above is true and authentic."
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Student Name</Label>
                  <p className="font-medium">{formData.studentDeclaration.fullName || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Declaration Date</Label>
                  <p className="font-medium">
                    {formatDate(formData.studentDeclaration.signedAt) || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
