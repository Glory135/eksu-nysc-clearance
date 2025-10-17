import { router, studentProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import NYSCForm from "@/lib/db/models/NYSCForm"
import type { INYSCForm } from "@/lib/db/models/NYSCForm"
import User from "@/lib/db/models/User"
import { sendSubmissionConfirmation } from "@/lib/email/templates"

export const studentRouter = router({
  submitForm: studentProcedure
    .input(
      z.union([
        // Backward compatible: file upload mode
        z.object({
          mode: z.literal("upload").optional(),
          // Optional in dev when Blob upload is disabled
          passportUrl: z.string().optional().default(""),
          formUrl: z.string().url(),
        }),
        // New: manual entry mode with structured fields
        z.object({
          mode: z.literal("manual"),
          // Optional in dev; when empty the PDF renderer will show placeholder
          passportUrl: z.string().optional().default(""),
          formData: z.object({
            name: z.string().min(2),
            faculty: z.string().min(2),
            department: z.string().min(2),
            courseOfStudy: z.string().min(2),
            matricNumber: z.string().min(2),
            jambRegNo: z.string().min(2),
            sex: z.enum(["male", "female"]),
            dateOfBirth: z.string(),
            maritalStatus: z.enum(["single", "married"]),
            stateOfOrigin: z.string().min(2),
            lga: z.string().min(2),
            graduationDate: z.string(),
            phone: z.string().min(5),
            email: z.string().email(),
            studentDeclaration: z
              .object({ fullName: z.string().min(2), signedAt: z.string() })
              .optional(),
          }),
        }),
      ]),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if student already has a submission
      const existingForm = await NYSCForm.findOne({ studentId: ctx.user.id })

      // If a previous submission exists and it's not rejected, block duplicate submissions.
      // If it exists and was rejected, allow a resubmission by updating the existing document.
      if (existingForm && existingForm.status !== "rejected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already submitted your form",
        })
      }

      const isManual = (input as any).mode === "manual"

      // Build the payload common to create or update
      const payload: Partial<INYSCForm> = {
        studentId: ctx.user.id,
        passportUrl: (input as any).passportUrl,
        formUrl: isManual ? undefined : (input as any).formUrl,
        submissionType: isManual ? "manual" : "upload",
        formData: isManual
          ? {
              ...((input as any).formData as any),
              dateOfBirth: new Date((input as any).formData.dateOfBirth),
              graduationDate: new Date((input as any).formData.graduationDate),
              studentDeclaration: (input as any).formData.studentDeclaration
                ? {
                    fullName: (input as any).formData.studentDeclaration.fullName,
                    signedAt: new Date((input as any).formData.studentDeclaration.signedAt),
                  }
                : undefined,
            }
          : undefined,
        status: "pending",
      }

      let form: INYSCForm

      if (existingForm && existingForm.status === "rejected") {
        // Update the existing rejected form to allow resubmission. Clear any generated
        // compiled artifacts to avoid confusion and append a resubmission history entry.
        const updated = await NYSCForm.findByIdAndUpdate(
          existingForm._id,
          {
            $set: payload,
            $unset: { compiledUrl: "", clearanceId: "", clearanceGeneratedAt: "" },
            $push: {
              history: {
                by: ctx.user.id,
                role: "student",
                action: "resubmitted",
                at: new Date(),
              },
            },
          },
          { new: true },
        )

        if (!updated) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update existing form" })
        }

        form = updated as INYSCForm
      } else {
        // No existing form (or existing was handled above) — create a new one
        const created: INYSCForm = await NYSCForm.create({
          ...(payload as any),
          history: [
            {
              by: ctx.user.id,
              role: "student",
              action: "submitted",
              at: new Date(),
            },
          ],
        })

        form = created
      }

      const student = await User.findById(ctx.user.id)
      if (student) {
        const created: any = form as any
        const submissionId = created?.id ? String(created.id) : String(created?._id)
        await sendSubmissionConfirmation({
          to: student.email,
          name: student.name,
          submissionId,
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
