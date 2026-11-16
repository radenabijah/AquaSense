const SAMPLE_INTERVALS_MS = {
  "Every 5 Seconds": 5_000,
  "Every 10 Seconds": 10_000,
  "Every 30 Seconds": 30_000,
  "Every 1 Minute": 60_000,
};

export function getDeviceStatus(lastReceivedAt, samplingInterval, now = new Date()) {
  if (!lastReceivedAt) {
    return "offline";
  }

  const intervalMs = SAMPLE_INTERVALS_MS[samplingInterval] || 5_000;
  const elapsedMs = Math.max(0, now.getTime() - new Date(lastReceivedAt).getTime());

  if (elapsedMs <= intervalMs * 2) {
    return "online";
  }
  if (elapsedMs <= intervalMs * 5) {
    return "stale";
  }
  return "offline";
}

export function getReadingCondition(reading, thresholds) {
  if (!reading) {
    return { temperature: "Unknown", ph: "Unknown", turbidity: "Unknown" };
  }

  return {
    temperature:
      reading.temperature < thresholds.temperatureMin ||
      reading.temperature > thresholds.temperatureMax
        ? "Unsafe"
        : "Safe",
    ph:
      reading.ph < thresholds.phMin || reading.ph > thresholds.phMax
        ? "Unsafe"
        : "Safe",
    turbidity: reading.turbidity > thresholds.turbidityMax ? "Unsafe" : "Safe",
  };
}
