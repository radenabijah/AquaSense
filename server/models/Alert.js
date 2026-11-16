import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["info", "warning", "critical", "success"],
      default: "info",
    },
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved"],
      default: "active",
    },
    resolved: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
    resolvedAt: { type: Date },
    resolutionReason: { type: String, trim: true },
    alertType: { type: String, enum: ["temperature", "ph", "turbidity"] },
    deviceId: { type: String, trim: true },
    location: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

alertSchema.index({ createdAt: -1 });
alertSchema.index({ deviceId: 1, alertType: 1, status: 1 });

export default mongoose.model("Alert", alertSchema);
