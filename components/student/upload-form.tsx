"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"
import { Upload, FileImage, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PassportGuidelines } from "./passport-guidelines"
import { Progress } from "@/components/ui/progress"

export function UploadForm() {
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [formFile, setFormFile] = useState<File | null>(null)
  const [passportPreview, setPassportPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{
    passport: boolean
    form: boolean
  }>({ passport: false, form: false })

  const utils = trpc.useUtils()

  const submitMutation = trpc.student.submitForm.useMutation({
    onSuccess: () => {
      toast.success("Documents submitted successfully!")
      utils.student.getMyForm.invalidate()
      setPassportFile(null)
      setFormFile(null)
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
        toast.error("Form must be JPG, PNG, or PDF")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Form must be less than 10MB")
        return
      }
      setFormFile(file)
    }
  }

  const uploadFile = async (file: File, fileType: "passport" | "form") => {
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

    if (!passportFile || !formFile) {
      toast.error("Please upload both passport photo and NYSC form")
      return
    }

    if (validationStatus !== "valid") {
      toast.error("Please upload a valid passport photo")
      return
    }

    setIsUploading(true)

    try {
      // Upload passport photo
      setUploadProgress({ passport: false, form: false })
      const passportUrl = await uploadFile(passportFile, "passport")
      setUploadProgress({ passport: true, form: false })

      // Upload NYSC form
      const formUrl = await uploadFile(formFile, "form")
      setUploadProgress({ passport: true, form: true })

      // Submit to database
      await submitMutation.mutateAsync({ passportUrl, formUrl })
    } catch (error: any) {
      toast.error(error.message || "Failed to upload documents")
    } finally {
      setIsUploading(false)
      setUploadProgress({ passport: false, form: false })
    }
  }

  return (
    <div className="space-y-6">
      <PassportGuidelines />

      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>Upload your passport photograph and NYSC mobilization form</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <AlertDescription className="text-sm">
                <strong>File Requirements:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Passport photo: JPG or PNG, max 5MB</li>
                  <li>NYSC form: JPG, PNG, or PDF, max 10MB</li>
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

            <div className="space-y-2">
              <Label htmlFor="form">NYSC Mobilization Form</Label>
              <input
                id="form"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFormChange}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="form">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                  disabled={isUploading}
                >
                  <span>
                    {uploadProgress.form ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    {formFile ? formFile.name : "Choose NYSC Form"}
                  </span>
                </Button>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isUploading || !passportFile || !formFile || validationStatus !== "valid"}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Documents
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
