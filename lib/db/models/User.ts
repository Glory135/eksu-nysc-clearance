import mongoose, { Schema, type Document, type Model } from "mongoose"

export type UserRole = "student" | "hod" | "admissions_officer" | "super_admin"
export type AccountStatus = "invited" | "pending" | "active" | "suspended" | "inactive"

export interface IUser extends Document {
  name: string
  email: string
  matricNumber: string
  password: string | null
  role: UserRole
  department: mongoose.Types.ObjectId
  accountStatus: AccountStatus
  inviteToken?: string
  inviteTokenExpiry?: Date
  admissionCode?: string | null
  isActiveOfficer?: boolean
  phone?: string
  sex?: string
  dateOfBirth?: string
  maritalStatus?: string
  stateOfOrigin?: string
  lga?: string
  graduationDate?: string
  courseOfStudy?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    matricNumber: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    role: {
      type: String,
      enum: ["student", "hod", "admissions_officer", "super_admin"],
      default: "student",
    },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: function () { return this.role !== 'super_admin' && this.role !== 'admissions_officer'; } },
    accountStatus: {
      type: String,
      enum: ["invited", "pending", "active", "suspended", "inactive"],
      default: "invited",
    },
    inviteToken: { type: String },
    inviteTokenExpiry: { type: Date },
    admissionCode: { type: String, default: null },
    isActiveOfficer: { type: Boolean, default: false },
    phone: { type: String },
    sex: { type: String },
    dateOfBirth: { type: String },
    maritalStatus: { type: String },
    stateOfOrigin: { type: String },
    lga: { type: String },
    graduationDate: { type: String },
    courseOfStudy: { type: String },
  },
  { timestamps: true },
)

// Email and matricNumber indexes are automatically created by unique: true
UserSchema.index({ department: 1, role: 1 })
UserSchema.index({ role: 1, isActiveOfficer: 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
