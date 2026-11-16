const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function buildReadingQuery({ deviceId, date } = {}) {
  const query = {};

  if (deviceId !== undefined) {
    if (typeof deviceId !== "string" || !deviceId.trim() || deviceId.length > 100) {
      return { errors: ["deviceId must be a non-empty string of at most 100 characters"] };
    }
    query.deviceId = deviceId.trim();
  }

  if (date !== undefined) {
    if (typeof date !== "string" || !DATE_PATTERN.test(date)) {
      return { errors: ["date must use YYYY-MM-DD format"] };
    }
    const [year, month, day] = date.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, day));
    if (
      start.getUTCFullYear() !== year ||
      start.getUTCMonth() !== month - 1 ||
      start.getUTCDate() !== day
    ) {
      return { errors: ["date must be a valid calendar date"] };
    }
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    query.recordedAt = { $gte: start, $lt: end };
  }

  return { errors: [], query };
}

export function parsePagination(pageValue, limitValue) {
  const parsePositiveInteger = (value, fallback, maximum) => {
    if (value === undefined) {
      return { value: fallback };
    }
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
      return { error: "page and limit must be positive integers" };
    }
    const parsedValue = Number(value);
    if (!Number.isSafeInteger(parsedValue)) {
      return { error: "page and limit must be safe positive integers" };
    }
    return { value: Math.min(parsedValue, maximum) };
  };

  const page = parsePositiveInteger(pageValue, DEFAULT_PAGE, Number.MAX_SAFE_INTEGER);
  const limit = parsePositiveInteger(limitValue, DEFAULT_LIMIT, MAX_LIMIT);
  if (page.error || limit.error) {
    return { errors: [page.error || limit.error] };
  }

  return { errors: [], page: page.value, limit: limit.value };
}
