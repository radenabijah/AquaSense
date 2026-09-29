import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    temperatureMin: { type: Number, required: true, min: -50, max: 100, default: 24 },
    temperatureMax: { type: Number, required: true, min: -50, max: 100, default: 30 },
    phMin: { type: Number, required: true, min: 0, max: 14, default: 6.5 },
    phMax: { type: Number, required: true, min: 0, max: 14, default: 8.5 },
    turbidityMax: { type: Number, required: true, min: 0, default: 25 },
    automaticDosing: { type: Boolean, default: true },
    phTarget: { type: Number, required: true, min: 0, max: 14, default: 7.2 },
    dosingInterval: { type: Number, required: true, min: 1, default: 30 },
    dashboardAlerts: { type: Boolean, default: true },
    criticalAlerts: { type: Boolean, default: true },
    dosingAlerts: { type: Boolean, default: true },
    connectionAlerts: { type: Boolean, default: true },
    samplingInterval: { type: String, default: "Every 5 Seconds" },
    samplingPoint: { type: String, default: "Point A" },
  },
  { timestamps: true },
);

export default mongoose.model("Settings", settingsSchema);
