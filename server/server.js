import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import Alert from "./models/Alert.js";
import SensorReading from "./models/SensorReading.js";
import Settings from "./models/Settings.js";
import { validateSensorReading } from "./utils/validateSensorReading.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const fishRules = [
  { name: "Tilapia", temperature: [25, 32], ph: [6, 9], turbidity: 25 },
  { name: "Catfish", temperature: [25, 30], ph: [6.5, 9], turbidity: 30 },
  { name: "Whiteleg Shrimp", temperature: [28, 32], ph: [7.5, 8.5], turbidity: 20 },
  { name: "Bangus (Milkfish)", temperature: [26, 32], ph: [7.5, 8.5], turbidity: 20 },
  { name: "Common Carp", temperature: [20, 30], ph: [6.5, 8.5], turbidity: 30 },
  { name: "Grass Carp", temperature: [20, 30], ph: [6.5, 8.5], turbidity: 30 },
  { name: "Hito (African Catfish)", temperature: [24, 32], ph: [6.5, 8.5], turbidity: 30 },
  { name: "Giant Freshwater Prawn (Ulang)", temperature: [26, 30], ph: [6.5, 8.5], turbidity: 20 },
];

function buildFishRecommendation(fish, water) {
  const outOfRange = [];
  if (water.temperature < fish.temperature[0] || water.temperature > fish.temperature[1]) {
    outOfRange.push("temperature");
  }
  if (water.ph < fish.ph[0] || water.ph > fish.ph[1]) {
    outOfRange.push("pH");
  }
  if (water.turbidity > fish.turbidity) {
    outOfRange.push("turbidity");
  }

  if (outOfRange.length === 0) {
    return {
      ...fish,
      status: "Recommended",
      reason: "The latest water reading is within this species' preferred ranges.",
    };
  }

  return {
    ...fish,
    status: outOfRange.length === 1 ? "Needs Adjustment" : "Not Recommended",
    reason:
      outOfRange.length === 1
        ? `Adjust ${outOfRange[0]} to meet this species' preferred range.`
        : `The latest reading is outside the preferred ${outOfRange.join(", ")} ranges for this species.`,
  };
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/settings", async (req, res, next) => {
  try {
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create({});
      settings = settings.toObject();
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

app.put("/api/settings", async (req, res, next) => {
  try {
    const allowedFields = [
      "temperatureMin",
      "temperatureMax",
      "phMin",
      "phMax",
      "turbidityMax",
      "automaticDosing",
      "phTarget",
      "dosingInterval",
      "dashboardAlerts",
      "criticalAlerts",
      "dosingAlerts",
      "connectionAlerts",
      "samplingInterval",
      "samplingPoint",
    ];
    const settingsData = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]]),
    );
    const settings = await Settings.findOneAndUpdate({}, settingsData, {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

app.get("/api/readings/latest", async (req, res, next) => {
  try {
    const reading = await SensorReading.findOne().sort({ recordedAt: -1 }).lean();
    res.json(reading);
  } catch (error) {
    next(error);
  }
});

app.get("/api/water/latest", async (req, res, next) => {
  try {
    const reading = await SensorReading.findOne().sort({ recordedAt: -1 }).lean();
    res.json(reading);
  } catch (error) {
    next(error);
  }
});

app.get("/api/fish-recommendations", async (req, res, next) => {
  try {
    const water = await SensorReading.findOne().sort({ recordedAt: -1 }).lean();
    if (!water) {
      return res.status(404).json({ message: "No water-quality readings are available" });
    }

    res.json({
      water,
      recommendations: fishRules.map((fish) => buildFishRecommendation(fish, water)),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/readings/history", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const readings = await SensorReading.find()
      .sort({ recordedAt: -1 })
      .limit(limit)
      .lean();
    res.json(readings);
  } catch (error) {
    next(error);
  }
});

app.get("/api/water/history", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const readings = await SensorReading.find()
      .sort({ recordedAt: -1 })
      .limit(limit)
      .lean();
    res.json(readings);
  } catch (error) {
    next(error);
  }
});

async function createThresholdAlerts(reading) {
  if (!reading.isValid || reading.isDelayed) {
    return [];
  }

  const thresholdAlerts = [];
  const settings = await Settings.findOne().lean();
  const thresholds = settings || {
    temperatureMin: 24,
    temperatureMax: 30,
    phMin: 6.5,
    phMax: 8.5,
    turbidityMax: 25,
  };

  if (
    reading.temperature < thresholds.temperatureMin ||
    reading.temperature > thresholds.temperatureMax
  ) {
    thresholdAlerts.push({
      title: "Unsafe Temperature Detected",
      message: `Measured temperature: ${reading.temperature}°C (Safe range: ${thresholds.temperatureMin}°C–${thresholds.temperatureMax}°C)`,
      severity: "warning",
    });
  }

  if (reading.ph < thresholds.phMin || reading.ph > thresholds.phMax) {
    thresholdAlerts.push({
      title: "Unsafe pH Detected",
      message: `Measured pH: ${reading.ph} (Safe range: ${thresholds.phMin}–${thresholds.phMax})`,
      severity: "critical",
    });
  }

  if (reading.turbidity > thresholds.turbidityMax) {
    thresholdAlerts.push({
      title: "High Turbidity Detected",
      message: `Measured turbidity: ${reading.turbidity} NTU (Maximum safe value: ${thresholds.turbidityMax} NTU)`,
      severity: "warning",
    });
  }

  const createdAlerts = [];

  for (const alertData of thresholdAlerts) {
    const existingAlert = await Alert.findOne({
      title: alertData.title,
      resolved: false,
    }).lean();

    if (!existingAlert) {
      createdAlerts.push(await Alert.create(alertData));
    }
  }

  return createdAlerts;
}

async function createWaterReading(req, res, next) {
  try {
    const result = validateSensorReading(req.body);
    if (result.errors.length > 0) {
      return res.status(400).json({
        message: "Invalid sensor reading",
        errors: result.errors,
      });
    }

    const reading = await SensorReading.create(result.reading);
    const alerts = await createThresholdAlerts(reading);
    res.status(201).json({
      reading,
      alerts,
      validation: { valid: reading.isValid, delayed: reading.isDelayed },
    });
  } catch (error) {
    next(error);
  }
}

app.post("/api/water", createWaterReading);
app.post("/api/readings", createWaterReading);

app.get("/api/alerts", async (req, res, next) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

app.post("/api/alerts", async (req, res, next) => {
  try {
    const { title, message, severity = "info" } = req.body;
    const alert = await Alert.create({ title, message, severity });
    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(400).json({ message: error.message || "Request failed" });
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas");

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});