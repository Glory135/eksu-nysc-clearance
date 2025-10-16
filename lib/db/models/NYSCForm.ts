import mongoose, { Schema, type Document, type Model } from "mongoose"

export type FormStatus = "pending" | "hod_approved" | "admissions_approved" | "rejected"

export interface IFormHistory {
  by: mongoose.Types.ObjectId
  role: string
  action: string
  remarks?: string
  at: Date
}

export interface INYSCForm extends Document {
  studentId: mongoose.Types.ObjectId
  passportUrl: string
  formUrl: string
  submissionType?: "upload" | "manual"
  formData?: {
    name: string
    faculty: string
    department: string
    courseOfStudy: string
    matricNumber: string
    jambRegNo: string
    sex: "male" | "female"
    dateOfBirth: Date
    maritalStatus: "single" | "married"
    stateOfOrigin: string
    lga: string
    graduationDate: Date
    phone: string
    email: string
    studentDeclaration?: { fullName: string; signedAt: Date }
  }
  status: FormStatus
  remarks: string
  history: IFormHistory[]
  updatedBy: mongoose.Types.ObjectId
  clearanceGeneratedAt: Date | null
  compiledUrl: string | null
  clearanceId: string | null
  createdAt: Date
  updatedAt: Date
}

const FormHistorySchema = new Schema<IFormHistory>(
  {
    by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    remarks: { type: String },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
)

const NYSCFormSchema = new Schema<INYSCForm>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    passportUrl: { type: String, required: true },
    // Keep optional for backward compatibility when using manual form entry
    formUrl: { type: String, required: false },
    submissionType: { type: String, enum: ["upload", "manual"], default: "upload" },
    formData: {
      name: { type: String },
      faculty: { type: String },
      department: { type: String },
      courseOfStudy: { type: String },
      matricNumber: { type: String },
      jambRegNo: { type: String },
      sex: { type: String, enum: ["male", "female"] },
      dateOfBirth: { type: Date },
      maritalStatus: { type: String, enum: ["single", "married"] },
      stateOfOrigin: { type: String },
      lga: { type: String },
      graduationDate: { type: Date },
      phone: { type: String },
      email: { type: String },
      studentDeclaration: {
        fullName: { type: String },
        signedAt: { type: Date },
      },
    },
    status: {
      type: String,
      enum: ["pending", "hod_approved", "admissions_approved", "rejected"],
      default: "pending",
    },
    remarks: { type: String, default: "" },
    history: [FormHistorySchema],
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    clearanceGeneratedAt: { type: Date, default: null },
    compiledUrl: { type: String, default: null },
    clearanceId: { type: String, default: null },
  },
  { timestamps: true },
)

// Index for studentId is automatically created by unique: true
NYSCFormSchema.index({ status: 1 })
NYSCFormSchema.index({ clearanceId: 1 })

const NYSCForm: Model<INYSCForm> = mongoose.models.NYSCForm || mongoose.model<INYSCForm>("NYSCForm", NYSCFormSchema)

export default NYSCForm
