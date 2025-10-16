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
    formUrl: { type: String, required: true },
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
