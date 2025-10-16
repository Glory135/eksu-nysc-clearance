import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { validatePassportPhoto } from "@/lib/validation/passport-validator"
import UploadAudit from "@/lib/db/models/UploadAudit"
import { connectDB } from "@/lib/db/mongoose"

export async function POST(request: Request) {
  const session = await auth()

  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json({ error: "File must be JPG or PNG" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be less than 5MB" }, { status: 400 })
    }

    // Convert file to base64 for AI validation
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Validate passport photo using AI
    const validationResult = await validatePassportPhoto(dataUrl)

    // Log the validation attempt
    await UploadAudit.create({
      studentId: session.user.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      status: validationResult.isValid ? "accepted" : "rejected",
      rejectionReasons: validationResult.errors,
      validationDetails: validationResult.details,
    })

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          valid: false,
          errors: validationResult.errors,
          details: validationResult.details,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      valid: true,
      message: "Passport photo validated successfully",
    })
  } catch (error: any) {
    console.error("[v0] Validation error:", error)
    return NextResponse.json({ error: error.message || "Validation failed" }, { status: 500 })
  }
}
