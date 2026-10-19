import assert from "node:assert/strict";
import test from "node:test";
import { validateSensorReading } from "../utils/validateSensorReading.js";
import {
  createScenarioPayload,
  parseSimulatorArgs,
  runSimulator,
} from "../simulator/sensorSimulator.js";

const now = new Date("2026-10-18T10:00:00.000Z");

test("normal and threshold-breach scenarios produce valid ingestion payloads", () => {
  for (const scenario of ["normal", "breach"]) {
    const result = validateSensorReading(createScenarioPayload(scenario, { now }), now);
    assert.deepEqual(result.errors, []);
    assert.equal(result.reading.isDelayed, false);
  }

  const breach = createScenarioPayload("breach", { now });
  assert.ok(breach.temperature > 30);
  assert.ok(breach.ph > 8.5);
  assert.ok(breach.turbidity > 25);
});

test("delayed scenario is accepted by validation but marked delayed", () => {
  const result = validateSensorReading(createScenarioPayload("delayed", { now }), now);

  assert.deepEqual(result.errors, []);
  assert.equal(result.reading.isDelayed, true);
});

test("invalid scenario produces a payload rejected by ingestion validation", () => {
  const result = validateSensorReading(createScenarioPayload("invalid", { now }), now);

  assert.ok(result.errors.some((error) => error.includes("ph must be a finite number")));
});

test("disconnect scenario contains no reading payload", () => {
  assert.equal(createScenarioPayload("disconnect", { now }), null);
});

test("simulator CLI validates scenario and numeric options", () => {
  assert.deepEqual(
    parseSimulatorArgs(["--scenario", "all", "--count", "2", "--interval-ms", "0"]),
    {
      scenario: "all",
      count: 2,
      intervalMs: 0,
      disconnectMs: 10000,
      endpoint: "http://localhost:5000/api/readings",
      deviceId: "pond-device-01",
      location: "Point A",
    },
  );
  assert.throws(() => parseSimulatorArgs(["--scenario", "unknown"]), /--scenario must be one of/);
  assert.throws(() => parseSimulatorArgs(["--count", "0"]), /--count must be/);
});

test("all scenario sends valid and invalid cases and pauses without sending for disconnect", async () => {
  const received = [];
  const sleeps = [];
  const summary = await runSimulator({
    scenario: "all",
    count: 1,
    intervalMs: 0,
    disconnectMs: 50,
    now: () => now,
    sleep: async (durationMs) => sleeps.push(durationMs),
    log: () => {},
    fetchImpl: async (endpoint, options) => {
      const payload = JSON.parse(options.body);
      received.push(payload);
      const validation = validateSensorReading(payload, now);
      return {
        status: validation.errors.length === 0 ? 201 : 400,
        json: async () => ({ message: validation.errors.join(", ") }),
      };
    },
  });

  assert.deepEqual(summary, { sent: 4, accepted: 3, rejected: 1, disconnects: 1 });
  assert.equal(received.length, 4);
  assert.equal(received[0].temperature, 27.5);
  assert.equal(received[1].temperature, 35);
  assert.equal(received[2].recordedAt, "2026-10-18T09:54:00.000Z");
  assert.equal(received[3].ph, "not-a-number");
  assert.deepEqual(sleeps, [50]);
});

test("simulator fails when the server response does not match the scenario", async () => {
  await assert.rejects(
    runSimulator({
      scenario: "normal",
      intervalMs: 0,
      log: () => {},
      fetchImpl: async () => ({
        status: 400,
        json: async () => ({ message: "bad reading" }),
      }),
    }),
    /unexpected HTTP 400/,
  );
});
