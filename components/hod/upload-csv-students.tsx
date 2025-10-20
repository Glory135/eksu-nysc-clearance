"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"
import { Upload, Download, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function UploadCSVStudents() {
  const [file, setFile] = useState<File | null>(null)
  const [graduationYear, setGraduationYear] = useState<number | "">(new Date().getFullYear())
  const [uploadResults, setUploadResults] = useState<{
    created: number
    errors: Array<{ student: any; error: string }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const utils = trpc.useUtils()

  const uploadMutation = trpc.hod.uploadStudents.useMutation({
    onSuccess: (data) => {
      setUploadResults({ created: data.created, errors: data.errors })
      if (data.created > 0) {
        toast.success(`Successfully invited ${data.created} student(s)`)
        utils.hod.getDepartmentStudents.invalidate()
      }
      if (data.errors.length > 0) {
        toast.error(`${data.errors.length} student(s) failed to upload`)
      }
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload CSV")
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please upload a CSV file")
        return
      }
      setFile(selectedFile)
      setUploadResults(null)
    }
  }

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const students = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      if (values.length >= 3) {
        const student = {
          name: values[headers.indexOf("name")] || values[0],
          email: values[headers.indexOf("email")] || values[1],
          matricNumber: values[headers.indexOf("matricnumber")] || values[2],
          // Optional per-row graduationYear column
          graduationYear: headers.includes("graduationyear") ? Number(values[headers.indexOf("graduationyear")]) || undefined : undefined,
        }
        students.push(student)
      }
    }
    return students
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    try {
      const text = await file.text()
      const students = parseCSV(text)

      if (students.length === 0) {
        toast.error("No valid students found in CSV")
        return
      }

      uploadMutation.mutate({ students, graduationYear: graduationYear === "" ? undefined : Number(graduationYear) })
    } catch (error) {
      toast.error("Failed to parse CSV file")
    }
  }

  const downloadTemplate = () => {
    const csv = "name,email,matricNumber,graduationYear\nJohn Doe,john.doe@eksu.edu.ng,EKSU/2020/12345,2024"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student-upload-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Students (CSV)</CardTitle>
        <CardDescription>Upload multiple students at once using a CSV file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>CSV Format</AlertTitle>
          <AlertDescription>Your CSV file should have columns: name, email, matricNumber, graduationYear</AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col">
            <span className="text-sm mb-1">Graduation Year (batch)</span>
            <input
              type="number"
              min={2000}
              max={new Date().getFullYear()}
              value={graduationYear as any}
              onChange={(e) => setGraduationYear(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
        </div>

        <Button variant="outline" onClick={downloadTemplate} className="w-full bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Download CSV Template
        </Button>

        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : "Choose CSV File"}
              </span>
            </Button>
          </label>
        </div>

        {file && (
          <Button onClick={handleUpload} className="w-full" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? "Uploading..." : "Upload & Send Invites"}
          </Button>
        )}

        {uploadResults && (
          <div className="space-y-2">
            {uploadResults.created > 0 && (
              <Alert className="bg-primary/5 border-primary/20">
                <AlertDescription className="text-foreground">
                  Successfully invited {uploadResults.created} student(s)
                </AlertDescription>
              </Alert>
            )}
            {uploadResults.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Failed to upload {uploadResults.errors.length} student(s)</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-2">
                    {uploadResults.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>
                        {err.student.name} ({err.student.email}): {err.error}
                      </li>
                    ))}
                    {uploadResults.errors.length > 5 && <li>...and {uploadResults.errors.length - 5} more</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
