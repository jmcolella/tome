import dayjs from "dayjs";

/**
 * Parses a DATE column value from the API as a local date.
 *
 * When the backend returns a DATE column (e.g., "2026-01-01T00:00:00.000Z"),
 * it's sent as UTC midnight. Without special handling, this would be interpreted
 * as UTC midnight and displayed as the previous day in EST/other timezones.
 *
 * This function extracts the date portion and creates a Date object representing
 * that date in the LOCAL timezone, ensuring correct display.
 *
 * @param apiDateValue - Date object or ISO string from API (e.g., "2026-01-01T00:00:00.000Z")
 * @returns Date object representing that date in local timezone
 */
export function parseDateFromApi(
  apiDateValue: Date | string | null | undefined
): Date | null {
  if (!apiDateValue) {
    return null;
  }

  // Convert Date object to ISO string if needed
  const isoString =
    apiDateValue instanceof Date ? apiDateValue.toISOString() : apiDateValue;

  // Extract just the date part (YYYY-MM-DD)
  const datePart = isoString.split("T")[0];

  if (!datePart || !/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return null;
  }

  // Parse as local date
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Formats a date for display, handling both API dates and local dates.
 *
 * @param date - Date from API or local Date object
 * @param format - Format string for dayjs (default: "MMM D, YYYY")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: string = "MMM D, YYYY"
): string {
  if (!date) {
    return "";
  }

  const localDate = parseDateFromApi(date);

  if (!localDate) {
    return "";
  }

  return dayjs(localDate).format(format);
}
