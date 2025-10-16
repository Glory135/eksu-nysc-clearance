import { authOptions } from "@/lib/auth/config"
import { put } from "@vercel/blob"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileType = formData.get("fileType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = {
      passport: ["image/jpeg", "image/png"],
      form: ["image/jpeg", "image/png", "application/pdf"],
    }

    const allowedMimeTypes = fileType === "passport" ? allowedTypes.passport : allowedTypes.form

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}` }, { status: 400 })
    }

    // Validate file size
    const maxSize = fileType === "passport" ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for passport, 10MB for form

    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`${session.user.id}/${fileType}-${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
