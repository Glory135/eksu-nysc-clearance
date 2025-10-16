import { router, hodProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import User from "@/lib/db/models/User"
import NYSCForm from "@/lib/db/models/NYSCForm"
import Department from "@/lib/db/models/Department"
import { sendInviteEmail, sendHODDecisionEmail } from "@/lib/email/templates"
import crypto from "crypto"

export const hodRouter = router({
  uploadStudents: hodProcedure
    .input(
      z.object({
        students: z.array(
          z.object({
            name: z.string(),
            email: z.string().email(),
            matricNumber: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { students } = input
      const hodDepartment = ctx.user.department

      const department = await Department.findById(hodDepartment)
      if (!department) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Department not found" })
      }

      const createdStudents = []
      const errors = []

      for (const student of students) {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({
            $or: [{ email: student.email }, { matricNumber: student.matricNumber }],
          })

          if (existingUser) {
            errors.push({
              student,
              error: "User with this email or matric number already exists",
            })
            continue
          }

          // Generate invite token
          const inviteToken = crypto.randomBytes(32).toString("hex")
          const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

          const newUser = await User.create({
            name: student.name,
            email: student.email,
            matricNumber: student.matricNumber,
            role: "student",
            department: hodDepartment,
            accountStatus: "invited",
            inviteToken,
            inviteTokenExpiry,
          })

          // Send invite email
          await sendInviteEmail({
            to: student.email,
            name: student.name,
            token: inviteToken,
            hodName: ctx.user.name!,
            departmentName: department.name,
          })

          createdStudents.push(newUser)
        } catch (error) {
          errors.push({ student, error: "Failed to create user" })
        }
      }

      return {
        success: true,
        created: createdStudents.length,
        errors,
      }
    }),

  getDepartmentForms: hodProcedure.query(async ({ ctx }) => {
    const forms = await NYSCForm.find()
      .populate({
        path: "studentId",
        match: { department: ctx.user.department },
        select: "name email matricNumber",
      })
      .populate("updatedBy", "name role")
      .sort({ updatedAt: -1 })

    // Filter out forms where studentId is null (not in department)
    return forms.filter((form) => form.studentId !== null)
  }),

  approveForm: hodProcedure
    .input(
      z.object({
        formId: z.string(),
        remarks: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const form = await NYSCForm.findById(input.formId).populate("studentId")

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" })
      }

      form.status = "hod_approved"
      form.remarks = input.remarks || ""
      form.updatedBy = ctx.user.id as any
      form.history.push({
        by: ctx.user.id as any,
        role: "hod",
        action: "approved",
        remarks: input.remarks,
        at: new Date(),
      })

      await form.save()

      const student = form.studentId as any
      if (student) {
        await sendHODDecisionEmail({
          to: student.email,
          name: student.name,
          approved: true,
          remarks: input.remarks,
          hodName: ctx.user.name!,
        })
      }

      return { success: true, form }
    }),

  rejectForm: hodProcedure
    .input(
      z.object({
        formId: z.string(),
        remarks: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const form = await NYSCForm.findById(input.formId).populate("studentId")

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" })
      }

      form.status = "rejected"
      form.remarks = input.remarks
      form.updatedBy = ctx.user.id as any
      form.history.push({
        by: ctx.user.id as any,
        role: "hod",
        action: "rejected",
        remarks: input.remarks,
        at: new Date(),
      })

      await form.save()

      const student = form.studentId as any
      if (student) {
        await sendHODDecisionEmail({
          to: student.email,
          name: student.name,
          approved: false,
          remarks: input.remarks,
          hodName: ctx.user.name!,
        })
      }

      return { success: true, form }
    }),

  getDepartmentStudents: hodProcedure.query(async ({ ctx }) => {
    const students = await User.find({
      department: ctx.user.department,
      role: "student",
    }).sort({ createdAt: -1 })

    return students
  }),

  resendInvite: hodProcedure.input(z.object({ studentId: z.string() })).mutation(async ({ input, ctx }) => {
    const student = await User.findById(input.studentId)

    if (!student || student.department.toString() !== ctx.user.department) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" })
    }

    const inviteToken = crypto.randomBytes(32).toString("hex")
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    student.inviteToken = inviteToken
    student.inviteTokenExpiry = inviteTokenExpiry
    await student.save()

    const department = await Department.findById(ctx.user.department)

    await sendInviteEmail({
      to: student.email,
      name: student.name,
      token: inviteToken,
      hodName: ctx.user.name!,
      departmentName: department!.name,
    })

    return { success: true }
  }),
})
