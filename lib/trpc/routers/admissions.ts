import { router, admissionsProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import NYSCForm from "@/lib/db/models/NYSCForm"
import User from "@/lib/db/models/User"
import { sendAdmissionsFinalDecisionEmail, sendClearanceReadyEmail } from "@/lib/email/templates"
import { generateClearancePDF } from "@/lib/pdf/generate-clearance"

export const admissionsRouter = router({
  getApprovedForms: admissionsProcedure.query(async () => {
    const forms = await NYSCForm.find({ status: "hod_approved" })
      .populate("studentId", "name email matricNumber department")
      .populate({
        path: "studentId",
        populate: {
          path: "department",
          select: "name",
        },
      })
      .populate("updatedBy", "name role")
      .sort({ updatedAt: -1 })

    return forms
  }),

  finalizeApproval: admissionsProcedure
    .input(
      z.object({
        formId: z.string(),
        approved: z.boolean(),
        remarks: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const form = await NYSCForm.findById(input.formId).populate("studentId")

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" })
      }

      form.status = input.approved ? "admissions_approved" : "rejected"
      form.remarks = input.remarks || ""
      form.updatedBy = ctx.user.id as any
      form.history.push({
        by: ctx.user.id as any,
        role: "admissions_officer",
        action: input.approved ? "approved" : "rejected",
        remarks: input.remarks,
        at: new Date(),
      })

      await form.save()

      const student = form.studentId as any
      if (student) {
        await sendAdmissionsFinalDecisionEmail({
          to: student.email,
          name: student.name,
          approved: input.approved,
          remarks: input.remarks,
        })

        if (input.approved) {
          try {
            // Get full student data with department
            const fullStudent = await User.findById(student._id).populate("department")
            const department = fullStudent?.department as any

            // Get HOD approval data
            const hodApproval = form.history.find((h) => h.action === "approved" && h.role === "hod")
            const hodUser = await User.findById(hodApproval?.by)

            // Generate clearance ID
            // Prefer graduationYear from the form (if manual) or from the student profile
            const preferredYear = (form as any).graduationYear || fullStudent?.graduationYear || new Date().getFullYear()
            const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
            const clearanceId = `EKSU-NYSC-${preferredYear}-${randomId}`

            // Prefer structured form data when available (manual submissions)
            const manual = (form as any).submissionType === "manual" && (form as any).formData

            const studentData = {
              name: manual ? (form as any).formData.name : fullStudent?.name || student.name,
              email: manual ? (form as any).formData.email : fullStudent?.email || student.email,
              matricNumber: manual ? (form as any).formData.matricNumber : fullStudent?.matricNumber || student.matricNumber,
              phone: manual ? (form as any).formData.phone : fullStudent?.phone,
              sex: manual ? (form as any).formData.sex : fullStudent?.sex,
              dateOfBirth: manual
                ? (form as any).formData.dateOfBirth?.toISOString?.() || (form as any).formData.dateOfBirth
                : fullStudent?.dateOfBirth,
              maritalStatus: manual ? (form as any).formData.maritalStatus : fullStudent?.maritalStatus,
              stateOfOrigin: manual ? (form as any).formData.stateOfOrigin : fullStudent?.stateOfOrigin,
              lga: manual ? (form as any).formData.lga : fullStudent?.lga,
              graduationDate: manual
                ? (form as any).formData.graduationDate?.toISOString?.() || (form as any).formData.graduationDate
                : fullStudent?.graduationDate,
              courseOfStudy: manual ? (form as any).formData.courseOfStudy : fullStudent?.courseOfStudy,
            }

            // Generate PDF
            const pdfUrl = await generateClearancePDF({
              clearanceId,
              student: studentData,
              department: {
                name: department?.name || "N/A",
                faculty: department?.faculty,
              },
              // include graduationYear for clarity in the PDF
              graduationDate: (form as any).graduationYear || fullStudent?.graduationYear,
              passportUrl: form.passportUrl,
              hod: {
                name: hodUser?.name as string,
                approvedAt: hodApproval?.at.toISOString() || new Date().toISOString(),
              },
              admissions: {
                name: ctx.user.name as string,
                approvedAt: new Date().toISOString(),
              },
            })

            // Update form with clearance data
            form.compiledUrl = pdfUrl
            form.clearanceId = clearanceId
            form.clearanceGeneratedAt = new Date()
            await form.save()

            // Send clearance ready email
            await sendClearanceReadyEmail({
              to: student.email,
              name: student.name,
              clearanceId,
              clearanceUrl: pdfUrl,
            })
          } catch (error) {
            console.error("[v0] Failed to generate clearance PDF:", error)
            // Don't fail the approval if PDF generation fails
          }
        }
      }

      return { success: true, form }
    }),

  getAllForms: admissionsProcedure
    .input(
      z
        .object({
          status: z.enum(["pending", "hod_approved", "admissions_approved", "rejected"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const query = input?.status ? { status: input.status } : {}

      const forms = await NYSCForm.find(query)
        .populate("studentId", "name email matricNumber department")
        .populate({
          path: "studentId",
          populate: {
            path: "department",
            select: "name",
          },
        })
        .populate("updatedBy", "name role")
        .sort({ updatedAt: -1 })

      return forms
    }),
})
