import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const SIMULATOR_SCENARIOS = [
  "normal",
  "breach",
  "invalid",
  "delayed",
  "disconnect",
  "all",
];

const DEFAULT_ENDPOINT = "http://localhost:5000/api/readings";
const DEFAULT_DEVICE_ID = "pond-device-01";
const DEFAULT_LOCATION = "Point A";

export function createScenarioPayload(scenario, {
  deviceId = DEFAULT_DEVICE_ID,
  location = DEFAULT_LOCATION,
  now = new Date(),
} = {}) {
  const base = {
    deviceId,
    location,
    temperature: 27.5,
    ph: 7.2,
    turbidity: 12,
    recordedAt: now.toISOString(),
  };

  switch (scenario) {
    case "normal":
      return base;
    case "breach":
      return { ...base, temperature: 35, ph: 9.5, turbidity: 100 };
    case "invalid":
      return { ...base, ph: "not-a-number" };
    case "delayed":
      return {
        ...base,
        recordedAt: new Date(now.getTime() - 6 * 60 * 1000).toISOString(),
      };
    case "disconnect":
      return null;
    default:
      throw new Error(`Unknown simulator scenario: ${scenario}`);
  }
}

export function parseSimulatorArgs(args) {
  const options = {
    scenario: "normal",
    count: 1,
    intervalMs: 1000,
    disconnectMs: 10000,
    endpoint: DEFAULT_ENDPOINT,
    deviceId: DEFAULT_DEVICE_ID,
    location: DEFAULT_LOCATION,
  };

  const valueOptions = new Map([
    ["--scenario", "scenario"],
    ["--count", "count"],
    ["--interval-ms", "intervalMs"],
    ["--disconnect-ms", "disconnectMs"],
    ["--endpoint", "endpoint"],
    ["--device-id", "deviceId"],
    ["--location", "location"],
  ]);

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!valueOptions.has(flag)) {
      throw new Error(`Unknown option: ${flag}`);
    }
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${flag}`);
    }

    const key = valueOptions.get(flag);
    if (key === "count" || key === "intervalMs" || key === "disconnectMs") {
      if (!/^\d+$/.test(value)) {
        throw new Error(`${flag} must be a non-negative integer`);
      }
      options[key] = Number(value);
    } else {
      options[key] = value;
    }
    index += 1;
  }

  if (!SIMULATOR_SCENARIOS.includes(options.scenario)) {
    throw new Error(`--scenario must be one of: ${SIMULATOR_SCENARIOS.join(", ")}`);
  }
  if (!Number.isInteger(options.count) || options.count < 1 || options.count > 1000) {
    throw new Error("--count must be an integer from 1 to 1000");
  }
  for (const key of ["intervalMs", "disconnectMs"]) {
    if (!Number.isSafeInteger(options[key]) || options[key] < 0) {
      throw new Error(`--${key === "intervalMs" ? "interval" : "disconnect"}-ms must be a non-negative safe integer`);
    }
  }
  if (!options.deviceId.trim() || options.deviceId.length > 100) {
    throw new Error("--device-id must be a non-empty string of at most 100 characters");
  }
  if (!options.location.trim() || options.location.length > 100) {
    throw new Error("--location must be a non-empty string of at most 100 characters");
  }

  let endpoint;
  try {
    endpoint = new URL(options.endpoint);
  } catch {
    throw new Error("--endpoint must be an absolute HTTP or HTTPS URL");
  }
  if (endpoint.protocol !== "http:" && endpoint.protocol !== "https:") {
    throw new Error("--endpoint must use HTTP or HTTPS");
  }
  options.endpoint = endpoint.toString();

  return options;
}

function buildScenarioSequence(scenario, count) {
  if (scenario !== "all") {
    return Array.from({ length: count }, () => scenario);
  }

  return Array.from({ length: count }, () => [
    "normal",
    "breach",
    "disconnect",
    "delayed",
    "invalid",
  ]).flat();
}

const wait = (durationMs) =>
  new Promise((resolvePromise) => setTimeout(resolvePromise, durationMs));

export async function runSimulator({
  scenario = "normal",
  count = 1,
  intervalMs = 1000,
  disconnectMs = 10000,
  endpoint = DEFAULT_ENDPOINT,
  deviceId = DEFAULT_DEVICE_ID,
  location = DEFAULT_LOCATION,
  fetchImpl = fetch,
  sleep = wait,
  now = () => new Date(),
  log = console.log,
} = {}) {
  if (!SIMULATOR_SCENARIOS.includes(scenario)) {
    throw new Error(`Unknown simulator scenario: ${scenario}`);
  }
  if (!Number.isInteger(count) || count < 1 || count > 1000) {
    throw new Error("count must be an integer from 1 to 1000");
  }

  const sequence = buildScenarioSequence(scenario, count);
  const summary = { sent: 0, accepted: 0, rejected: 0, disconnects: 0 };

  for (let index = 0; index < sequence.length; index += 1) {
    const currentScenario = sequence[index];
    if (currentScenario === "disconnect") {
      summary.disconnects += 1;
      log(`Simulating device silence for ${disconnectMs} ms; no reading will be sent.`);
      if (disconnectMs > 0) {
        await sleep(disconnectMs);
      }
    } else {
      const payload = createScenarioPayload(currentScenario, {
        deviceId,
        location,
        now: now(),
      });
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseBody = await response.json();
      const shouldBeAccepted = currentScenario !== "invalid";

      summary.sent += 1;
      if (shouldBeAccepted && response.status >= 200 && response.status < 300) {
        summary.accepted += 1;
        log(`${currentScenario}: accepted (HTTP ${response.status}).`);
      } else if (!shouldBeAccepted && response.status === 400) {
        summary.rejected += 1;
        log(`${currentScenario}: rejected as expected (HTTP 400: ${responseBody.message}).`);
      } else {
        throw new Error(
          `${currentScenario}: unexpected HTTP ${response.status} from ${endpoint}: ${JSON.stringify(responseBody)}`,
        );
      }
    }

    if (index < sequence.length - 1 && currentScenario !== "disconnect" && intervalMs > 0) {
      await sleep(intervalMs);
    }
  }

  log(
    `Simulation complete: ${summary.sent} readings sent, ${summary.accepted} accepted, ` +
      `${summary.rejected} invalid readings rejected, ${summary.disconnects} disconnect pause(s).`,
  );
  return summary;
}

async function main() {
  try {
    const options = parseSimulatorArgs(process.argv.slice(2));
    await runSimulator(options);
  } catch (error) {
    console.error(`Sensor simulator failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
