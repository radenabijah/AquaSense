import dotenv from "dotenv";
import mongoose from "mongoose";
import Alert from "./models/Alert.js";
import SensorReading from "./models/SensorReading.js";

dotenv.config();

const readings = [
  { temperature: 27.8, ph: 7.2, turbidity: 16 },
  { temperature: 27.9, ph: 7.1, turbidity: 15 },
  { temperature: 28.0, ph: 7.2, turbidity: 15 },
  { temperature: 28.1, ph: 7.3, turbidity: 14 },
  { temperature: 28.2, ph: 7.2, turbidity: 14 },
  { temperature: 28.4, ph: 7.2, turbidity: 13 },
];

const alerts = [
  {
    title: "High pH Detected",
    message: "Measured pH: 8.8 (Above Safe Threshold)",
    severity: "critical",
  },
  {
    title: "High Turbidity",
    message: "Measured Turbidity: 45 NTU",
    severity: "warning",
  },
  {
    title: "Water Returned to Safe Range",
    message: "pH normalized to 7.2",
    severity: "success",
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  if (await SensorReading.exists({})) {
    const result = await SensorReading.updateMany(
      { $or: [{ location: { $exists: false } }, { location: null }, { location: "" }] },
      { $set: { location: "Point A" } },
    );
    console.log(`Updated ${result.modifiedCount} existing sensor readings with a location.`);
  } else {
    await SensorReading.insertMany(
      readings.map((reading, index) => ({
        ...reading,
        deviceId: "pond-device-01",
        location: "Point A",
        recordedAt: new Date(Date.now() - (readings.length - index) * 15 * 60 * 1000),
      })),
    );
    console.log(`Seeded ${readings.length} sensor readings.`);
  }

  if (await Alert.exists({})) {
    console.log("Alerts already exist; skipping alert seed.");
  } else {
    await Alert.insertMany(alerts);
    console.log(`Seeded ${alerts.length} alerts.`);
  }
}

seed()
  .catch((error) => {
    console.error("Failed to seed database:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
