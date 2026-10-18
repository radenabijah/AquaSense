const STALE_AFTER_MS = 5 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 60 * 1000;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function isValidIsoTimestamp(value) {
  if (typeof value !== "string" || !ISO_TIMESTAMP_PATTERN.test(value)) {
    return false;
  }

  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    Number.isFinite(Date.parse(value)) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateSensorReading(payload, receivedAt = new Date()) {
  const errors = [];
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { errors: ["Request body must be a JSON object"] };
  }

  const numericFields = {
    temperature: { min: -50, max: 100, label: "temperature (-50 to 100 °C)" },
    ph: { min: 0, max: 14, label: "ph (0 to 14)" },
    turbidity: { min: 0, label: "turbidity (a non-negative NTU value)" },
  };

  for (const [field, range] of Object.entries(numericFields)) {
    const value = payload[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${field} must be a finite number`);
    } else if (value < range.min || (range.max !== undefined && value > range.max)) {
      errors.push(`${field} must be ${range.label}`);
    }
  }

  const deviceId = payload.deviceId === undefined ? "pond-device-01" : payload.deviceId;
  if (typeof deviceId !== "string" || !deviceId.trim() || deviceId.trim().length > 100) {
    errors.push("deviceId must be a non-empty string of at most 100 characters");
  }

  const location = payload.location === undefined ? "Point A" : payload.location;
  if (typeof location !== "string" || !location.trim() || location.trim().length > 100) {
    errors.push("location must be a non-empty string of at most 100 characters");
  }

  let recordedAt = receivedAt;
  if (payload.recordedAt !== undefined) {
    if (!isValidIsoTimestamp(payload.recordedAt)) {
      errors.push("recordedAt must be an ISO 8601 timestamp with a timezone, such as 2026-10-18T10:00:00Z");
    } else {
      recordedAt = new Date(payload.recordedAt);
      if (recordedAt.getTime() - receivedAt.getTime() > MAX_FUTURE_SKEW_MS) {
        errors.push("recordedAt cannot be more than 60 seconds in the future");
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors: [],
    reading: {
      temperature: payload.temperature,
      ph: payload.ph,
      turbidity: payload.turbidity,
      deviceId: deviceId.trim(),
      location: location.trim(),
      recordedAt,
      receivedAt,
      isValid: true,
      isDelayed: receivedAt.getTime() - recordedAt.getTime() > STALE_AFTER_MS,
    },
  };
}
