/**
 * Local timezone date/time utilities
 * Prevents UTC/timezone shift issues by working with local time directly
 */

/**
 * Get today's date as yyyy-mm-dd in local timezone
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current local datetime as yyyy-mm-ddTHH:mm:ss
 */
export function getCurrentLocalDateTimeString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Parse a yyyy-mm-dd date string as local time (not UTC)
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Parse a yyyy-mm-ddTHH:mm:ss datetime string as local time
 */
export function parseLocalDateTime(dateTimeString: string): Date {
  const [dateStr, timeStr] = dateTimeString.split('T');
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes, seconds] = (timeStr || '00:00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Format a yyyy-mm-dd date string for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a yyyy-mm-ddTHH:mm:ss datetime string for display
 * Falls back to handling ISO strings with Z suffix (old data)
 */
export function formatDateTime(dateTimeString: string): string {
  try {
    let date: Date;

    // Handle ISO format with Z (old data)
    if (dateTimeString.includes('Z')) {
      date = new Date(dateTimeString);
    } else if (dateTimeString.includes('T')) {
      // Handle local datetime format
      date = parseLocalDateTime(dateTimeString);
    } else {
      // Handle date-only format
      date = parseLocalDate(dateTimeString);
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateTimeString;
  }
}

/**
 * Check if a yyyy-mm-dd date string is the same as compareDate (default: today)
 */
export function isSameLocalDate(
  dateString: string,
  compareDate: Date = new Date()
): boolean {
  const date = parseLocalDate(dateString);
  return (
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
}

/**
 * Check if a yyyy-mm-dd date string is within this week (local timezone)
 */
export function isThisWeek(dateString: string): boolean {
  const date = parseLocalDate(dateString);
  const now = new Date();

  // Get start of this week (Monday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);

  // Get end of this week (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return date >= weekStart && date <= weekEnd;
}

/**
 * Get the start and end of this week (local timezone)
 * Returns [weekStart, weekEnd] as yyyy-mm-dd strings
 */
export function getThisWeekRange(): [string, string] {
  const now = new Date();

  // Get start of this week (Monday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));

  // Get end of this week (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return [formatDate(weekStart), formatDate(weekEnd)];
}

/**
 * Get dates for the past N days (local timezone)
 * Returns array of yyyy-mm-dd strings from N days ago to today
 */
export function getPastNDays(days: number): string[] {
  const result: string[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    result.push(`${year}-${month}-${day}`);
  }

  return result;
}
