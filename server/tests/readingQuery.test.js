import assert from "node:assert/strict";
import test from "node:test";
import { buildReadingQuery, parsePagination } from "../utils/readingQuery.js";

test("builds device and UTC date filters", () => {
  const result = buildReadingQuery({ deviceId: " pond-2 ", date: "2026-11-16" });

  assert.deepEqual(result.errors, []);
  assert.equal(result.query.deviceId, "pond-2");
  assert.equal(result.query.recordedAt.$gte.toISOString(), "2026-11-16T00:00:00.000Z");
  assert.equal(result.query.recordedAt.$lt.toISOString(), "2026-11-17T00:00:00.000Z");
});

test("rejects malformed device and date filters", () => {
  assert.ok(buildReadingQuery({ deviceId: " " }).errors.length > 0);
  assert.ok(buildReadingQuery({ date: "2026-02-30" }).errors.length > 0);
  assert.ok(buildReadingQuery({ date: "yesterday" }).errors.length > 0);
});

test("parses pagination with defaults and clamps page size", () => {
  assert.deepEqual(parsePagination(undefined, undefined), {
    errors: [],
    page: 1,
    limit: 20,
  });
  assert.deepEqual(parsePagination("3", "500"), {
    errors: [],
    page: 3,
    limit: 100,
  });
  assert.ok(parsePagination("0", "10").errors.length > 0);
});
