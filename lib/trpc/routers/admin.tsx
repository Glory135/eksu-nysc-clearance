import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../server"
import { connectDB } from "@/lib/db/mongoose"
import User from "@/lib/db/models/User"
import Department from "@/lib/db/models/Department"
import NYSCForm from "@/lib/db/models/NYSCForm"
import UploadAudit from "@/lib/db/models/UploadAudit" // Added import for UploadAudit
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/lib/email/resend"

function generateAdmissionCode(): string {
  const prefix = "EKSU-AO"
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase()
  return `${prefix}-${randomPart}`
}

export const adminRouter = router({
  // Get system-wide statistics
  getSystemStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    await connectDB()

    const [
      totalDepartments,
      totalHODs,
      totalAdmissionsOfficers,
      totalStudents,
      totalSubmissions,
      pendingHODReview,
      pendingFinalApproval,
      clearedStudents,
    ] = await Promise.all([
      Department.countDocuments(),
      User.countDocuments({ role: "hod" }),
      User.countDocuments({ role: "admissions_officer" }),
      User.countDocuments({ role: "student" }),
      NYSCForm.countDocuments(),
      NYSCForm.countDocuments({ status: "pending" }),
      NYSCForm.countDocuments({ status: "hod_approved" }),
      NYSCForm.countDocuments({ status: "admissions_approved" }),
    ])

    return {
      totalDepartments,
      totalHODs,
      totalAdmissionsOfficers,
      totalStudents,
      totalSubmissions,
      pendingHODReview,
      pendingFinalApproval,
      clearedStudents,
    }
  }),

  // Department Management
  getDepartments: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    await connectDB()

    const departments = await Department.find().populate("hodUserId", "name email").sort({ name: 1 }).lean()

    return departments
  }),

  createDepartment: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      await connectDB()

      // Check if department already exists
      const existing = await Department.findOne({
        $or: [{ name: input.name }, { code: input.code }],
      })

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Department with this name or code already exists",
        })
      }

      const department = await Department.create(input)
      return department
    }),

  updateDepartment: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        code: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      await connectDB()

      const department = await Department.findByIdAndUpdate(
        input.id,
        { name: input.name, code: input.code },
        { new: true },
      )

      if (!department) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Department not found" })
      }

      return department
    }),

  deleteDepartment: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    await connectDB()

    // Check if department has students
    const studentsCount = await User.countDocuments({ department: input.id })
    if (studentsCount > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Cannot delete department with existing students",
      })
    }

    await Department.findByIdAndDelete(input.id)
    return { success: true }
  }),

  // HOD Management
  getHODs: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    await connectDB()

    const hods = await User.find({ role: "hod" }).populate("department", "name code").sort({ name: 1 }).lean()

    return hods
  }),

  createHOD: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        departmentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      await connectDB()

      // Check if user already exists
      const existing = await User.findOne({ email: input.email })
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        })
      }

      // Check if department exists
      const department = await Department.findById(input.departmentId)
      if (!department) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Department not found" })
      }

      // Check if department already has a HOD
      if (department.hodUserId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Department already has a HOD assigned",
        })
      }

      // Generate invite token
      const inviteToken = crypto.randomBytes(32).toString("hex")
      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Create HOD user
      const hod = await User.create({
        name: input.name,
        email: input.email,
        role: "hod",
        department: input.departmentId,
        matricNumber: crypto.randomBytes(32).toString("hex"),
        inviteToken,
        inviteExpires,
      })

      // Update department with HOD
      department.hodUserId = hod._id
      await department.save()

      // Send invite email
      const inviteUrl = `${process.env.NEXTAUTH_URL}/register/${inviteToken}`
      await sendEmail({
        to: input.email,
        subject: "EKSU NYSC Clearance - HOD Account Created",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #006400; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">EKSU NYSC Clearance System</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #006400;">HOD Account Created</h2>
              <p>Hello ${input.name},</p>
              <p>A Head of Department account has been created for you at ${department.name}.</p>
              <p>Please click the button below to set your password and activate your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background-color: #006400; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Password</a>
              </div>
              <p style="color: #666; font-size: 14px;">This link will expire in 7 days.</p>
              <p style="color: #666; font-size: 14px;">If you didn't expect this email, please ignore it.</p>
            </div>
          </div>
        `,
      })

      return hod
    }),

  removeHOD: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    await connectDB()

    const hod = await User.findById(input.id)
    if (!hod || hod.role !== "hod") {
      throw new TRPCError({ code: "NOT_FOUND", message: "HOD not found" })
    }

    // Remove HOD from department
    if (hod.department) {
      await Department.findByIdAndUpdate(hod.department, { $unset: { hodUserId: 1 } })
    }

    await User.findByIdAndDelete(input.id)
    return { success: true }
  }),

  // Admissions Officer Management
  getAdmissionsOfficers: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    await connectDB()

    const officers = await User.find({ role: "admissions_officer" }).sort({ name: 1 }).lean()

    return officers
  }),

  createAdmissionsOfficer: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      await connectDB()

      // Check if user already exists
      const existing = await User.findOne({ email: input.email })
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        })
      }

      await User.updateMany({ role: "admissions_officer", isActiveOfficer: true }, { isActiveOfficer: false })

      const rawAdmissionCode = generateAdmissionCode()
      const hashedAdmissionCode = await bcrypt.hash(rawAdmissionCode, 10)

      // Generate invite token
      const inviteToken = crypto.randomBytes(32).toString("hex")
      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const officer = await User.create({
        name: input.name,
        email: input.email,
        role: "admissions_officer",
        matricNumber: crypto.randomBytes(32).toString("hex"),
        inviteToken,
        inviteExpires,
        admissionCode: hashedAdmissionCode,
        isActiveOfficer: true,
      })

      const inviteUrl = `${process.env.NEXTAUTH_URL}/register/${inviteToken}`
      await sendEmail({
        to: input.email,
        subject: "Your EKSU Admissions Officer Access Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #006400; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">EKSU NYSC Clearance System</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #006400;">Admissions Officer Account Created</h2>
              <p>Hello ${input.name},</p>
              <p>You have been assigned as the EKSU Admissions Officer.</p>
              
              <div style="background-color: #fff; border: 2px solid #006400; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #006400;">Your Secure Access Code:</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #006400; letter-spacing: 2px;">${rawAdmissionCode}</p>
              </div>
              
              <p style="color: #d32f2f; font-weight: bold;">⚠️ IMPORTANT: Keep this code confidential!</p>
              <p>You will need this code along with your email and password to log in to your Admissions Dashboard.</p>
              
              <p>Please click the button below to set your password and activate your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background-color: #006400; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Password</a>
              </div>
              <p style="color: #666; font-size: 14px;">This link will expire in 7 days.</p>
              <p style="color: #666; font-size: 14px;">If you didn't expect this email, please ignore it.</p>
            </div>
          </div>
        `,
      })

      return {
        ...officer.toObject(),
        rawAdmissionCode, // Only returned on creation
      }
    }),

  resetAdmissionCode: publicProcedure.input(z.object({ officerId: z.string() })).mutation(async ({ ctx, input }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    await connectDB()

    const officer = await User.findById(input.officerId)
    if (!officer || officer.role !== "admissions_officer") {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Admissions officer not found",
      })
    }

    // Deactivate all other officers
    await User.updateMany({ role: "admissions_officer", _id: { $ne: input.officerId } }, { isActiveOfficer: false })

    // Generate new admission code
    const rawAdmissionCode = generateAdmissionCode()
    const hashedAdmissionCode = await bcrypt.hash(rawAdmissionCode, 10)

    // Update officer with new code and set as active
    officer.admissionCode = hashedAdmissionCode
    officer.isActiveOfficer = true
    await officer.save()

    // Send email with new code
    await sendEmail({
      to: officer.email,
      subject: "Your New EKSU Admissions Officer Access Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #006400; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">EKSU NYSC Clearance System</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #006400;">New Admissions Officer Access Code</h2>
            <p>Hello ${officer.name},</p>
            <p>Your admissions officer access code has been reset.</p>
            
            <div style="background-color: #fff; border: 2px solid #006400; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #006400;">Your New Secure Access Code:</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #006400; letter-spacing: 2px;">${rawAdmissionCode}</p>
            </div>
            
            <p style="color: #d32f2f; font-weight: bold;">⚠️ IMPORTANT: Keep this code confidential!</p>
            <p>Your previous code is no longer valid. Use this new code along with your email and password to log in.</p>
            
            <p style="color: #666; font-size: 14px;">If you didn't request this change, please contact the system administrator immediately.</p>
          </div>
        </div>
      `,
    })

    return {
      success: true,
      rawAdmissionCode, // Only returned on reset
    }
  }),

  removeAdmissionsOfficer: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    await connectDB()

    const officer = await User.findById(input.id)
    if (!officer || officer.role !== "admissions_officer") {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Admissions officer not found",
      })
    }

    await User.findByIdAndDelete(input.id)
    return { success: true }
  }),

  // Get all users for overview
  getAllUsers: publicProcedure
    .input(
      z.object({
        role: z.enum(["student", "hod", "admissions_officer", "super_admin"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      await connectDB()

      const filter = input.role ? { role: input.role } : {}
      const users = await User.find(filter).populate("department", "name code").sort({ createdAt: -1 }).lean()

      return users
    }),

  // Audit and User Management Procedures
  getUploadAudits: publicProcedure
    .input(
      z.object({
        status: z.enum(["accepted", "rejected", "all"]).optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      await connectDB()

      const filter = input.status && input.status !== "all" ? { status: input.status } : {}

      const audits = await UploadAudit.find(filter)
        .populate("studentId", "name email matricNumber")
        .sort({ createdAt: -1 })
        .limit(input.limit)
        .lean()

      return audits
    }),

  toggleUserStatus: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        suspend: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.role !== "super_admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      await connectDB()

      const user = await User.findById(input.userId)
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
      }

      user.accountStatus = input.suspend ? "suspended" : "active"
      await user.save()

      return { success: true, user }
    }),
})
