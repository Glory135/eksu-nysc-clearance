import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IDepartment extends Document {
  name: string
  code: string
  hodUserId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    hodUserId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true },
)

DepartmentSchema.index({ name: 1 })
DepartmentSchema.index({ code: 1 })

const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema)

export default Department
