import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import Alert from "./models/Alert.js";
import FishSpecies from "./models/FishSpecies.js";
import SensorReading from "./models/SensorReading.js";
import Settings from "./models/Settings.js";
import { validateSensorReading } from "./utils/validateSensorReading.js";
import { getDeviceStatus } from "./utils/deviceStatus.js";
import { buildReadingQuery, parsePagination } from "./utils/readingQuery.js";
import { getAlertTransition } from "./utils/alertLifecycle.js";
import { buildFishRecommendation } from "./utils/fishRecommendations.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    const reading = await SensorReading.findOne(
      req.query.deviceId ? { deviceId: req.query.deviceId } : {},
    ).sort({ recordedAt: -1, _id: -1 }).lean();
    res.json(reading);
  } catch (error) {
    next(error);
  }
});

app.get("/api/water/latest", async (req, res, next) => {
  try {
    const reading = await SensorReading.findOne(
      req.query.deviceId ? { deviceId: req.query.deviceId } : {},
    ).sort({ recordedAt: -1, _id: -1 }).lean();
    res.json(reading);
  } catch (error) {
    next(error);
  }
});

app.get("/api/fish-recommendations", async (req, res, next) => {
  try {
    const water = await SensorReading.findOne(
      req.query.deviceId ? { deviceId: req.query.deviceId } : {},
    ).sort({ recordedAt: -1, _id: -1 }).lean();
    const species = await FishSpecies.find({ enabled: true })
      .sort({ name: 1 })
      .lean();
    res.json({
      water,
      recommendations: species.map((fish) => buildFishRecommendation(fish, water)),
      catalogueInitialized: species.length > 0,
    });
  } catch (error) {
    next(error);
  }
});

async function getReadingsHistory(req, res, next) {
  try {
    const pagination = parsePagination(req.query.page, req.query.limit);
    const filters = buildReadingQuery({
      deviceId: req.query.deviceId,
      date: req.query.date,
    });
    const errors = [...pagination.errors, ...filters.errors];
    if (errors.length > 0) {
      return res.status(400).json({ message: "Invalid history query", errors });
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [items, total, [averages = {}]] = await Promise.all([
      SensorReading.find(filters.query)
        .sort({ recordedAt: -1, _id: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      SensorReading.countDocuments(filters.query),
      SensorReading.aggregate([
        { $match: filters.query },
        {
          $group: {
            _id: null,
            temperature: { $avg: "$temperature" },
            ph: { $avg: "$ph" },
            turbidity: { $avg: "$turbidity" },
          },
        },
      ]),
    ]);

    res.json({
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        averages: {
          temperature: averages.temperature ?? null,
          ph: averages.ph ?? null,
          turbidity: averages.turbidity ?? null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

app.get("/api/readings/history", getReadingsHistory);
app.get("/api/water/history", getReadingsHistory);

app.get("/api/devices", async (req, res, next) => {
  try {
    const settings = await Settings.findOne().lean();
    const samplingInterval = settings?.samplingInterval || "Every 5 Seconds";
    const latestByDevice = await SensorReading.aggregate([
      { $sort: { recordedAt: -1, _id: -1 } },
      {
        $group: {
          _id: "$deviceId",
          latestReading: { $first: "$$ROOT" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(
      latestByDevice.map(({ _id: deviceId, latestReading }) => {
        const receivedAt = latestReading.receivedAt || latestReading.recordedAt;
        return {
          deviceId,
          location: latestReading.location,
          lastRecordedAt: latestReading.recordedAt,
          lastReceivedAt: receivedAt,
          status: getDeviceStatus(receivedAt, samplingInterval),
          latestReading,
        };
      }),
    );
  } catch (error) {
    next(error);
  }
});

async function syncThresholdAlerts(reading) {
  if (!reading.isValid || reading.isDelayed) {
    return [];
  }

  const settings = await Settings.findOne().lean();
  const thresholds = settings || {
    temperatureMin: 24,
    temperatureMax: 30,
    phMin: 6.5,
    phMax: 8.5,
    turbidityMax: 25,
  };
  const conditions = [
    {
      type: "temperature",
      title: "Unsafe Temperature Detected",
      message: `Measured temperature: ${reading.temperature} C (safe range: ${thresholds.temperatureMin} to ${thresholds.temperatureMax} C)`,
      severity: "warning",
      outside:
        reading.temperature < thresholds.temperatureMin ||
        reading.temperature > thresholds.temperatureMax,
    },
    {
      type: "ph",
      title: "Unsafe pH Detected",
      message: `Measured pH: ${reading.ph} (safe range: ${thresholds.phMin} to ${thresholds.phMax})`,
      severity: "critical",
      outside: reading.ph < thresholds.phMin || reading.ph > thresholds.phMax,
    },
    {
      type: "turbidity",
      title: "High Turbidity Detected",
      message: `Measured turbidity: ${reading.turbidity} NTU (maximum: ${thresholds.turbidityMax} NTU)`,
      severity: "warning",
      outside: reading.turbidity > thresholds.turbidityMax,
    },
  ];
  const changedAlerts = [];

  for (const condition of conditions) {
    const filter = {
      deviceId: reading.deviceId,
      alertType: condition.type,
      status: { $in: ["active", "acknowledged"] },
    };
    const existing = await Alert.findOne(filter).lean();
    const transition = getAlertTransition(existing?.status, condition.outside);

    if (transition === "create") {
      changedAlerts.push(
        await Alert.create({
          title: condition.title,
          message: condition.message,
          severity: condition.severity,
          alertType: condition.type,
          deviceId: reading.deviceId,
          location: reading.location,
          status: "active",
        }),
      );
    } else if (transition === "update") {
      await Alert.updateOne(filter, {
        $set: { message: condition.message, location: reading.location },
      });
    } else if (transition === "resolve") {
      await Alert.updateMany(filter, {
        $set: {
          status: "resolved",
          resolved: true,
          resolvedAt: reading.receivedAt || new Date(),
          resolutionReason: "Condition returned to the configured safe range",
        },
      });
      changedAlerts.push({
        alertType: condition.type,
        deviceId: reading.deviceId,
        status: "resolved",
      });
    }
  }

  return changedAlerts;
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
    const alerts = await syncThresholdAlerts(reading);
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
    res.json(
      alerts.map((alert) => ({
        ...alert,
        status:
          alert.severity === "success"
            ? "resolved"
            : alert.status || (alert.resolved ? "resolved" : "active"),
      })),
    );
  } catch (error) {
    next(error);
  }
});

app.patch("/api/alerts/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["acknowledged", "resolved"].includes(status)) {
      return res.status(400).json({
        message: "Status must be acknowledged or resolved",
      });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    if (alert.status === "resolved" || alert.resolved) {
      return res.status(409).json({ message: "Resolved alerts cannot be changed" });
    }
    if (status === "acknowledged" && alert.status === "acknowledged") {
      return res.status(409).json({ message: "Alert is already acknowledged" });
    }

    alert.status = status;
    if (status === "acknowledged") {
      alert.acknowledgedAt = new Date();
    } else {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.resolutionReason = "Manually resolved";
    }
    await alert.save();
    res.json(alert);
  } catch (error) {
    next(error);
  }
});

app.post("/api/alerts", async (req, res, next) => {
  try {
    const { title, message, severity = "info" } = req.body;
    const alert = await Alert.create({
      title,
      message,
      severity,
      ...(severity === "success"
        ? { status: "resolved", resolved: true, resolvedAt: new Date() }
        : {}),
    });
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