"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"
import { Upload, FileImage, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PassportGuidelines } from "./passport-guidelines"
import { Progress } from "@/components/ui/progress"

export function UploadForm() {
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [passportPreview, setPassportPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ passport: boolean }>({ passport: false })

  // Manual NYSC form fields
  const [formData, setFormData] = useState({
    name: "",
    faculty: "",
    department: "",
    courseOfStudy: "",
    matricNumber: "",
    jambRegNo: "",
    sex: "male" as "male" | "female" | "",
    dateOfBirth: "",
    maritalStatus: "single" as "single" | "married" | "",
    stateOfOrigin: "",
    lga: "",
    graduationDate: "",
    phone: "",
    email: "",
    studentDeclaration: { fullName: "", signedAt: "" },
  })

  const { data: profile } = trpc.student.getProfile.useQuery()

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name ?? prev.name,
        email: profile.email ?? prev.email,
        matricNumber: profile.matricNumber ?? prev.matricNumber,
        phone: profile.phone ?? prev.phone,
        sex: (profile.sex as any) ?? prev.sex,
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : prev.dateOfBirth,
        maritalStatus: (profile.maritalStatus as any) ?? prev.maritalStatus,
        stateOfOrigin: profile.stateOfOrigin ?? prev.stateOfOrigin,
        lga: profile.lga ?? prev.lga,
        graduationDate: profile.graduationDate
          ? new Date(profile.graduationDate).toISOString().slice(0, 10)
          : prev.graduationDate,
        courseOfStudy: profile.courseOfStudy ?? prev.courseOfStudy,
      }))
    }
  }, [profile])

  const utils = trpc.useUtils()

  const submitMutation = trpc.student.submitForm.useMutation({
    onSuccess: () => {
      toast.success("Documents submitted successfully!")
      utils.student.getMyForm.invalidate()
      setPassportFile(null)
      // setFormFile(null)
      setPassportPreview(null)
      setValidationStatus("idle")
      setValidationErrors([])
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit documents")
    },
  })

  const validatePassportPhoto = async (file: File) => {
    setIsValidating(true)
    setValidationStatus("validating")
    setValidationErrors([])

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/validate-passport", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setValidationStatus("invalid")
        setValidationErrors(data.errors || ["Validation failed"])
        toast.error("Passport photo validation failed")
        return false
      }

      setValidationStatus("valid")
      toast.success("Passport photo validated successfully!")
      return true
    } catch (error: any) {
      setValidationStatus("invalid")
      setValidationErrors([error.message || "Validation failed"])
      toast.error("Failed to validate passport photo")
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handlePassportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Passport photo must be JPG or PNG")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Passport photo must be less than 5MB")
        return
      }

      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPassportPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Validate the photo
      const isValid = await validatePassportPhoto(file)

      if (isValid) {
        setPassportFile(file)
      } else {
        setPassportFile(null)
        // Keep preview to show what was rejected
      }
    }
  }

  const updateField = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const uploadFile = async (file: File, fileType: "passport") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileType", fileType)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Upload failed")
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passportFile) {
      toast.error("Please upload a valid passport photo")
      return
    }

    if (validationStatus !== "valid") {
      toast.error("Please upload a valid passport photo")
      return
    }

    // Basic client validation for manual form
    const requiredKeys: Array<keyof typeof formData> = [
      "name",
      "faculty",
      "department",
      "courseOfStudy",
      "matricNumber",
      "jambRegNo",
      "sex",
      "dateOfBirth",
      "maritalStatus",
      "stateOfOrigin",
      "lga",
      "graduationDate",
      "phone",
      "email",
    ]
    const missing = requiredKeys.filter((k) => !(formData as any)[k])
    if (missing.length > 0) {
      toast.error("Please complete all required NYSC form fields")
      return
    }

    setIsUploading(true)

    try {
      // Upload passport photo
      setUploadProgress({ passport: false })
      // commented out because i dont have a vercel blob token for now
      // const passportUrl = await uploadFile(passportFile, "passport")
      const passportUrl = "placeholder"
      setUploadProgress({ passport: true })

      // Submit manual data
      const payload = {
        mode: "manual" as const,
        passportUrl,
        formData: {
          ...formData,
          studentDeclaration:
            formData.studentDeclaration.fullName
              ? { fullName: formData.studentDeclaration.fullName, signedAt: formData.studentDeclaration.signedAt || new Date().toISOString() }
              : undefined,
        },
      }
      await submitMutation.mutateAsync(payload)
    } catch (error: any) {
      toast.error(error.message || "Failed to upload documents")
    } finally {
      setIsUploading(false)
      setUploadProgress({ passport: false })
    }
  }

  return (
    <div className="space-y-6">
      <PassportGuidelines />

      <Card>
        <CardHeader>
          <CardTitle>NYSC Clearance Submission</CardTitle>
          <CardDescription>Upload your passport photograph, then fill your NYSC form details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <AlertDescription className="text-sm">
                <strong>File Requirements:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Passport photo: JPG or PNG, max 5MB</li>
                  <li>NYSC form: Fill the fields below accurately (no image upload)</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="passport">Passport Photograph *</Label>

              {isValidating && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Validating passport photo...</p>
                      <Progress value={undefined} className="w-full" />
                      <p className="text-xs text-muted-foreground">
                        Checking photo quality, background, face visibility, and appropriate attire
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationStatus === "valid" && (
                <Alert className="border-primary bg-primary/5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">
                    Passport photo validated successfully! You can now submit your documents.
                  </AlertDescription>
                </Alert>
              )}

              {validationStatus === "invalid" && validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">Passport photo validation failed:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm">Please upload a new photo that meets all requirements.</p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-start gap-4">
                {passportPreview && (
                  <div
                    className={`w-32 h-32 rounded-lg overflow-hidden border-2 ${
                      validationStatus === "valid"
                        ? "border-primary"
                        : validationStatus === "invalid"
                          ? "border-destructive"
                          : "border-border"
                    }`}
                  >
                    <img
                      src={passportPreview || "/placeholder.svg"}
                      alt="Passport preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    id="passport"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePassportChange}
                    className="hidden"
                    disabled={isUploading || isValidating}
                  />
                  <label htmlFor="passport">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      asChild
                      disabled={isUploading || isValidating}
                    >
                      <span>
                        {isValidating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : validationStatus === "valid" ? (
                          <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                        ) : (
                          <FileImage className="mr-2 h-4 w-4" />
                        )}
                        {passportFile ? passportFile.name : "Choose Passport Photo"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {validationStatus === "valid" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <input id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="matricNumber">Matric Number *</Label>
                    <input id="matricNumber" value={formData.matricNumber} onChange={(e) => updateField("matricNumber", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="faculty">Faculty *</Label>
                    <input id="faculty" value={formData.faculty} onChange={(e) => updateField("faculty", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <input id="department" value={formData.department} onChange={(e) => updateField("department", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="courseOfStudy">Course of Study *</Label>
                    <input id="courseOfStudy" value={formData.courseOfStudy} onChange={(e) => updateField("courseOfStudy", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="jambRegNo">JAMB Reg. No. *</Label>
                    <input id="jambRegNo" value={formData.jambRegNo} onChange={(e) => updateField("jambRegNo", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="sex">Sex *</Label>
                    <select id="sex" value={formData.sex} onChange={(e) => updateField("sex", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2">
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <input id="dob" type="date" value={formData.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="maritalStatus">Marital Status *</Label>
                    <select id="maritalStatus" value={formData.maritalStatus} onChange={(e) => updateField("maritalStatus", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2">
                      <option value="">Select...</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="stateOfOrigin">State of Origin *</Label>
                    <input id="stateOfOrigin" value={formData.stateOfOrigin} onChange={(e) => updateField("stateOfOrigin", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="lga">Local Government of Origin *</Label>
                    <input id="lga" value={formData.lga} onChange={(e) => updateField("lga", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="graduationDate">Graduation Date *</Label>
                    <input id="graduationDate" type="date" value={formData.graduationDate} onChange={(e) => updateField("graduationDate", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <input id="phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <input id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="declName">Type your full name to confirm</Label>
                    <input id="declName" value={formData.studentDeclaration.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, studentDeclaration: { ...prev.studentDeclaration, fullName: e.target.value, signedAt: new Date().toISOString().slice(0, 10) } }))} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <Label htmlFor="declDate">Declaration Date</Label>
                    <input id="declDate" type="date" value={formData.studentDeclaration.signedAt} onChange={(e) => setFormData((prev) => ({ ...prev, studentDeclaration: { ...prev.studentDeclaration, signedAt: e.target.value } }))} className="mt-1 w-full rounded-md border px-3 py-2" />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isUploading ||
                !passportFile ||
                validationStatus !== "valid"
              }
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
