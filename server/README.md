# Sensor ingestion contract

The device can submit one water-quality reading as JSON to either
`POST /api/readings` or the compatible `POST /api/water` endpoint.

```json
{
  "deviceId": "pond-device-01",
  "location": "Point A",
  "temperature": 27.5,
  "ph": 7.2,
  "turbidity": 12.0,
  "recordedAt": "2026-10-18T10:00:00.000Z"
}
```

All sensor values must be JSON numbers (not numeric strings):

| Field | Required | Unit / accepted value |
| --- | --- | --- |
| `temperature` | Yes | Degrees Celsius; -50 through 100 |
| `ph` | Yes | pH scale; 0 through 14 |
| `turbidity` | Yes | NTU; finite and non-negative |
| `deviceId` | No, recommended | Non-empty string, at most 100 characters; defaults to `pond-device-01` |
| `location` | No | Non-empty string, at most 100 characters; defaults to `Point A` |
| `recordedAt` | No | Sensor capture time in ISO 8601 with timezone; defaults to server receipt time |

The server sets `receivedAt` on every saved reading. Valid readings captured
more than five minutes before receipt are retained for history with
`isDelayed: true`, but do not create threshold alerts. Timestamps more than 60
seconds in the future are rejected to allow for small device clock differences
without accepting implausible future data. Invalid payloads receive HTTP 400
with a `message` and an `errors` array; valid readings receive HTTP 201 and
include `reading`, `alerts`, and a `validation` summary.

The accepted value limits are data-integrity bounds, not aquaculture safety
thresholds. Safety thresholds are configured separately in AquaSense settings.

## Simulating a sensor device

Start the API server, then in another terminal run the simulator from this
directory:

```powershell
npm run simulate -- --scenario all --count 1
```

Available scenarios are:

| Scenario | Behavior |
| --- | --- |
| `normal` | Sends a reading in a typical safe range. |
| `breach` | Sends values above the default temperature, pH, and turbidity alert thresholds. |
| `delayed` | Sends a valid reading captured six minutes before the server receives it. |
| `invalid` | Sends a string instead of a numeric pH value and expects HTTP 400. |
| `disconnect` | Sends no reading and waits, simulating a device going silent. |
| `all` | Runs each of the above scenarios in order. |

The default scenario sends one normal reading to
`http://localhost:5000/api/readings`. Options can override the endpoint, device,
location, number of repetitions, and timing:

```powershell
npm run simulate -- --scenario normal --count 10 --interval-ms 1000 --device-id pond-device-01 --location "Point A"
```

Use `--endpoint` to specify a different full ingestion URL and
`--disconnect-ms` to set the silent period. `all` repeats the scenario sequence
`--count` times. A simulated disconnect only stops sending data; it does not
change device connectivity state in the API.

Run the automated simulator and ingestion-validation tests with:

```powershell
npm test
```
