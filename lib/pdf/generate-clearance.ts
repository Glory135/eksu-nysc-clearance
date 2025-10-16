import { renderToBuffer } from "@react-pdf/renderer"
import { ClearanceFormPDF } from "./clearance-template"
import { put } from "@vercel/blob"

interface GenerateClearanceOptions {
  clearanceId: string
  student: {
    name: string
    email: string
    matricNumber: string
    phone?: string
    sex?: string
    dateOfBirth?: string
    maritalStatus?: string
    stateOfOrigin?: string
    lga?: string
    graduationDate?: string
    courseOfStudy?: string
  }
  department: {
    name: string
    faculty?: string
  }
  passportUrl: string
  hod: {
    name: string
    approvedAt: string
  }
  admissions: {
    name: string
    approvedAt: string
  }
}

export async function generateClearancePDF(data: GenerateClearanceOptions): Promise<string> {
  try {
    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      ClearanceFormPDF({
        data: {
          ...data,
          generatedAt: new Date().toISOString(),
        },
      }),
    )

    // Upload to Vercel Blob
    const filename = `clearance-${data.clearanceId}-${Date.now()}.pdf`
    const blob = await put(filename, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
    })

    return blob.url
  } catch (error) {
    console.error("[v0] Failed to generate clearance PDF:", error)
    throw new Error("Failed to generate clearance PDF")
  }
}
