import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongoose"
import NYSCForm from "@/lib/db/models/NYSCForm"
import User from "@/lib/db/models/User"
import { generateClearancePDF } from "@/lib/pdf/generate-clearance"

export async function POST(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admissions officers can trigger manual generation
    if (session.user.role !== "admissions_officer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectDB()

    const { studentId } = await params

    // Find the approved form
    const form = await NYSCForm.findOne({
      studentId,
      status: "admissions_approved",
    })

    if (!form) {
      return NextResponse.json({ error: "No approved form found for this student" }, { status: 404 })
    }

    // Check if already generated
    if (form.compiledUrl) {
      return NextResponse.json({ url: form.compiledUrl, clearanceId: form.clearanceId })
    }

    // Get student data
    const student = await User.findById(studentId).populate("department")
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const department = student.department as any

    // Get HOD approval data
    const hodApproval = form.history.find((h) => h.action === "approved" && h.role === "hod")
    const admissionsApproval = form.history.find((h) => h.action === "approved" && h.role === "admissions_officer")

    if (!hodApproval || !admissionsApproval) {
      return NextResponse.json({ error: "Missing approval data" }, { status: 400 })
    }

    const hodUser = await User.findById(hodApproval.by)
    const admissionsUser = await User.findById(admissionsApproval.by)

    // Generate clearance ID
    const year = new Date().getFullYear()
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    const clearanceId = `EKSU-NYSC-${year}-${randomId}`

    // Generate PDF
    const pdfUrl = await generateClearancePDF({
      clearanceId,
      student: {
        name: student.name,
        email: student.email,
        matricNumber: student.matricNumber,
        phone: student.phone,
        sex: student.sex,
        dateOfBirth: student.dateOfBirth,
        maritalStatus: student.maritalStatus,
        stateOfOrigin: student.stateOfOrigin,
        lga: student.lga,
        graduationDate: student.graduationDate,
        courseOfStudy: student.courseOfStudy,
      },
      department: {
        name: department?.name || "N/A",
        faculty: department?.faculty,
      },
      passportUrl: form.passportUrl,
      hod: {
        name: hodUser?.name || "HOD",
        approvedAt: hodApproval.at.toISOString(),
      },
      admissions: {
        name: admissionsUser?.name || "Admissions Officer",
        approvedAt: admissionsApproval.at.toISOString(),
      },
    })

    // Update form with clearance data
    form.compiledUrl = pdfUrl
    form.clearanceId = clearanceId
    form.clearanceGeneratedAt = new Date()
    await form.save()

    return NextResponse.json({
      success: true,
      url: pdfUrl,
      clearanceId,
    })
  } catch (error) {
    console.error("[v0] Error generating clearance:", error)
    return NextResponse.json({ error: "Failed to generate clearance" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { studentId } = await params

    // Check permissions
    if (session.user.role === "student" && session.user.id !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const form = await NYSCForm.findOne({ studentId })

    if (!form || !form.compiledUrl) {
      return NextResponse.json({ error: "Clearance not found" }, { status: 404 })
    }

    return NextResponse.json({
      url: form.compiledUrl,
      clearanceId: form.clearanceId,
      generatedAt: form.clearanceGeneratedAt,
    })
  } catch (error) {
    console.error("[v0] Error fetching clearance:", error)
    return NextResponse.json({ error: "Failed to fetch clearance" }, { status: 500 })
  }
}
