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
