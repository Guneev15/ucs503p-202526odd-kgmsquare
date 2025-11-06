// Utility functions for date/time formatting in Indian Standard Time (IST)

/**
 * Format a date to IST with full date format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Wednesday, October 30, 2025")
 */
export function formatDateIST(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
}

/**
 * Format a time to IST with 12-hour format
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "08:30:45 PM IST")
 */
export function formatTimeIST(date: string | Date): string {
  const timeStr = new Date(date).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return `${timeStr} IST`;
}

/**
 * Format both date and time to IST
 * @param date - Date string or Date object
 * @returns Object with separate date and time strings
 */
export function formatDateTimeIST(date: string | Date): { date: string; time: string } {
  return {
    date: formatDateIST(date),
    time: formatTimeIST(date)
  };
}

/**
 * Get the current date/time in IST
 * @returns Current Date object
 */
export function nowIST(): Date {
  return new Date();
}
