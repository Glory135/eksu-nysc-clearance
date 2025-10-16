import mongoose from "mongoose"

const uploadAuditSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected"],
      required: true,
    },
    rejectionReasons: [
      {
        type: String,
      },
    ],
    validationDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
)

const UploadAudit = mongoose.models.UploadAudit || mongoose.model("UploadAudit", uploadAuditSchema)

export default UploadAudit
