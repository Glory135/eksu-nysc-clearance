import { router, studentProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import NYSCForm from "@/lib/db/models/NYSCForm"
import User from "@/lib/db/models/User"
import { sendSubmissionConfirmation } from "@/lib/email/templates"

export const studentRouter = router({
  submitForm: studentProcedure
    .input(
      z.object({
        passportUrl: z.string().url(),
        formUrl: z.string().url(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if student already has a submission
      const existingForm = await NYSCForm.findOne({ studentId: ctx.user.id })

      if (existingForm) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already submitted your form",
        })
      }

      const form = await NYSCForm.create({
        studentId: ctx.user.id,
        passportUrl: input.passportUrl,
        formUrl: input.formUrl,
        status: "pending",
        history: [
          {
            by: ctx.user.id,
            role: "student",
            action: "submitted",
            at: new Date(),
          },
        ],
      })

      const student = await User.findById(ctx.user.id)
      if (student) {
        await sendSubmissionConfirmation({
          to: student.email,
          name: student.name,
          submissionId: form._id.toString(),
        })
      }

      return { success: true, form }
    }),

  getMyForm: studentProcedure.query(async ({ ctx }) => {
    const form = await NYSCForm.findOne({ studentId: ctx.user.id }).populate("history.by", "name role")

    return form
  }),

  getProfile: studentProcedure.query(async ({ ctx }) => {
    const user = await User.findById(ctx.user.id).select(
      "name email matricNumber phone sex dateOfBirth maritalStatus stateOfOrigin lga graduationDate courseOfStudy",
    )

    return user
  }),

  updateProfile: studentProcedure
    .input(
      z.object({
        phone: z.string().optional(),
        sex: z.string().optional(),
        dateOfBirth: z.string().optional(),
        maritalStatus: z.string().optional(),
        stateOfOrigin: z.string().optional(),
        lga: z.string().optional(),
        graduationDate: z.string().optional(),
        courseOfStudy: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await User.findByIdAndUpdate(
        ctx.user.id,
        {
          $set: input,
        },
        { new: true },
      )

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
      }

      return { success: true, user }
    }),
})
