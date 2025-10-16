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
            const year = new Date().getFullYear()
            const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
            const clearanceId = `EKSU-NYSC-${year}-${randomId}`

            // Generate PDF
            const pdfUrl = await generateClearancePDF({
              clearanceId,
              student: {
                name: fullStudent?.name || student.name,
                email: fullStudent?.email || student.email,
                matricNumber: fullStudent?.matricNumber || student.matricNumber,
                phone: fullStudent?.phone,
                sex: fullStudent?.sex,
                dateOfBirth: fullStudent?.dateOfBirth,
                maritalStatus: fullStudent?.maritalStatus,
                stateOfOrigin: fullStudent?.stateOfOrigin,
                lga: fullStudent?.lga,
                graduationDate: fullStudent?.graduationDate,
                courseOfStudy: fullStudent?.courseOfStudy,
              },
              department: {
                name: department?.name || "N/A",
                faculty: department?.faculty,
              },
              passportUrl: form.passportUrl,
              hod: {
                name: hodUser?.name || "HOD",
                approvedAt: hodApproval?.at.toISOString() || new Date().toISOString(),
              },
              admissions: {
                name: ctx.user.name,
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
