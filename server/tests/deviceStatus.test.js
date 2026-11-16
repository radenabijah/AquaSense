import assert from "node:assert/strict";
import test from "node:test";
import { getDeviceStatus, getReadingCondition } from "../utils/deviceStatus.js";

const now = new Date("2026-11-16T10:00:00.000Z");

test("classifies devices as online, stale, and offline using configured sampling intervals", () => {
  const timestamp = (offsetMs) => new Date(now.getTime() - offsetMs);

  assert.equal(getDeviceStatus(timestamp(10_000), "Every 5 Seconds", now), "online");
  assert.equal(getDeviceStatus(timestamp(25_000), "Every 5 Seconds", now), "stale");
  assert.equal(getDeviceStatus(timestamp(25_001), "Every 5 Seconds", now), "offline");
  assert.equal(getDeviceStatus(null, "Every 5 Seconds", now), "offline");
  assert.equal(getDeviceStatus(timestamp(120_000), "Every 1 Minute", now), "online");
});

test("classifies sensor readings against configured water-quality thresholds", () => {
  const thresholds = {
    temperatureMin: 24,
    temperatureMax: 30,
    phMin: 6.5,
    phMax: 8.5,
    turbidityMax: 25,
  };

  assert.deepEqual(
    getReadingCondition({ temperature: 27, ph: 7.2, turbidity: 10 }, thresholds),
    { temperature: "Safe", ph: "Safe", turbidity: "Safe" },
  );
  assert.deepEqual(
    getReadingCondition({ temperature: 31, ph: 7.2, turbidity: 30 }, thresholds),
    { temperature: "Unsafe", ph: "Safe", turbidity: "Unsafe" },
  );
  assert.equal(getReadingCondition(null, thresholds).temperature, "Unknown");
});
