import assert from "node:assert/strict";
import test from "node:test";
import { getAlertTransition } from "../utils/alertLifecycle.js";

test("creates an alert for a new unsafe condition", () => {
  assert.equal(getAlertTransition(undefined, true), "create");
});

test("updates an open alert without duplicating it", () => {
  assert.equal(getAlertTransition("active", true), "update");
  assert.equal(getAlertTransition("acknowledged", true), "update");
});

test("resolves open alerts when a condition returns to safe", () => {
  assert.equal(getAlertTransition("active", false), "resolve");
  assert.equal(getAlertTransition("acknowledged", false), "resolve");
});

test("does not create alerts for safe conditions or reopen resolved alerts", () => {
  assert.equal(getAlertTransition(undefined, false), "none");
  assert.equal(getAlertTransition("resolved", false), "none");
  assert.equal(getAlertTransition("resolved", true), "create");
});
