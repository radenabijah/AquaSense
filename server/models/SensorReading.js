import mongoose from "mongoose";

const sensorReadingSchema = new mongoose.Schema(
  {
    temperature: { type: Number, required: true, min: -50, max: 100 },
    ph: { type: Number, required: true, min: 0, max: 14 },
    turbidity: { type: Number, required: true, min: 0 },
    deviceId: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, default: "Point A" },
    recordedAt: { type: Date, default: Date.now },
    receivedAt: { type: Date, required: true, default: Date.now },
    isValid: { type: Boolean, required: true, default: true },
    isDelayed: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

sensorReadingSchema.index({ recordedAt: -1 });
sensorReadingSchema.index({ deviceId: 1, recordedAt: -1 });

export default mongoose.model("SensorReading", sensorReadingSchema);
