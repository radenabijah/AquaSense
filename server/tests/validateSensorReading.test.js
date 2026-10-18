import assert from "node:assert/strict";
import test from "node:test";
import { validateSensorReading } from "../utils/validateSensorReading.js";

const now = new Date("2026-10-18T10:00:00.000Z");
const validPayload = {
  temperature: 27.5,
  ph: 7.2,
  turbidity: 12,
  deviceId: "pond-device-01",
  location: "Point A",
  recordedAt: "2026-10-18T09:59:00.000Z",
};

test("accepts a valid reading and records server receipt metadata", () => {
  const result = validateSensorReading(validPayload, now);

  assert.deepEqual(result.errors, []);
  assert.equal(result.reading.temperature, 27.5);
  assert.equal(result.reading.recordedAt.toISOString(), validPayload.recordedAt);
  assert.equal(result.reading.receivedAt, now);
  assert.equal(result.reading.isValid, true);
  assert.equal(result.reading.isDelayed, false);
});

test("rejects missing, non-numeric, and out-of-range sensor values", () => {
  const missingResult = validateSensorReading({ ph: 7.2, turbidity: 12 }, now);
  assert.ok(missingResult.errors.some((error) => error.includes("temperature must be")));

  const result = validateSensorReading(
    { ...validPayload, ph: "7.2", temperature: 101, turbidity: -1 },
    now,
  );

  assert.equal(result.errors.length, 3);
  assert.ok(result.errors.some((error) => error.includes("ph must be a finite number")));
  assert.ok(result.errors.some((error) => error.includes("temperature must be")));
  assert.ok(result.errors.some((error) => error.includes("turbidity must be")));
});

test("rejects malformed or timezone-free timestamps", () => {
  for (const recordedAt of ["not-a-date", "2026-10-18T10:00:00", "2026-02-30T10:00:00Z"]) {
    const result = validateSensorReading({ ...validPayload, recordedAt }, now);
    assert.ok(result.errors.some((error) => error.includes("recordedAt must be")));
  }
});

test("rejects timestamps more than 60 seconds in the future", () => {
  const result = validateSensorReading(
    { ...validPayload, recordedAt: "2026-10-18T10:01:01.000Z" },
    now,
  );

  assert.ok(result.errors.some((error) => error.includes("cannot be more than 60 seconds")));
});

test("retains old readings but marks them delayed", () => {
  const result = validateSensorReading(
    { ...validPayload, recordedAt: "2026-10-18T09:54:59.999Z" },
    now,
  );

  assert.deepEqual(result.errors, []);
  assert.equal(result.reading.isDelayed, true);
});

test("uses compatible defaults when optional device metadata is omitted", () => {
  const { deviceId, location, recordedAt, ...sensorValues } = validPayload;
  const result = validateSensorReading(sensorValues, now);

  assert.deepEqual(result.errors, []);
  assert.equal(result.reading.deviceId, "pond-device-01");
  assert.equal(result.reading.location, "Point A");
  assert.equal(result.reading.recordedAt, now);
});
