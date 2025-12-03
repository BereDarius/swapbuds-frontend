/**
 * Optimized date-fns Imports
 *
 * Centralized date formatting utilities to ensure tree-shaking works properly.
 * Import from this file instead of directly from date-fns to reduce bundle size.
 */

import {
  differenceInYears,
  format,
  formatDistanceToNow,
  parseISO,
} from "date-fns";

export { differenceInYears, format, formatDistanceToNow, parseISO };

/**
 * Format a date to a readable string
 * @param date - Date to format
 * @param formatStr - Format string (default: 'PPP' - e.g., "April 29, 2026")
 */
export function formatDate(date: Date | string, formatStr = "PPP"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param date - Date to format
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  return differenceInYears(new Date(), dateOfBirth);
}
