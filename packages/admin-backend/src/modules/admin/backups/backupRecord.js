const mongoose = require("mongoose")

const backupRecordSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    dbName: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "restore_success", "restore_failed"],
      default: "pending",
    },
    fileUrl: {
      type: String,
      required: function () {
        return this.status === "success" || this.status === "restore_success"
      },
    },
    cloudinaryPublicId: {
      type: String,
      required: function () {
        return this.status === "success" || this.status === "restore_success"
      },
    },
    fileSize: {
      type: Number,
      min: 0,
    },
    triggeredBy: {
      type: String,
      enum: ["cron_job", "manual_admin"],
      default: "cron_job",
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes for faster querying
backupRecordSchema.index({ tenant: 1, createdAt: -1 })
backupRecordSchema.index({ status: 1, createdAt: 1 })

const BackupRecord = mongoose.model("BackupRecord", backupRecordSchema)

module.exports = BackupRecord
