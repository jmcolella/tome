/**
 * Parses a date string in YYYY-MM-DD format as a local date.
 *
 * This is critical for date-only values (no time component).
 * Using `new Date("2026-01-01")` would interpret it as UTC midnight,
 * which could result in the previous day due to timezone differences.
 *
 * This function creates a Date object representing midnight of the given
 * date in the LOCAL timezone, ensuring correct date storage.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object representing midnight of that date in local timezone
 */
export function parseDateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Gets the current date at start of day (midnight) in local timezone.
 * Useful for date-only comparisons and filtering.
 *
 * @returns Date object representing midnight of today in local timezone
 */
export function getTodayStartOfDay(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
