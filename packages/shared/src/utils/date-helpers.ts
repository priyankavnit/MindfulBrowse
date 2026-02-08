/**
 * Date utility functions for Mindful Browse platform
 * Provides consistent date handling across all packages
 */

import { TIME } from './constants';

/**
 * Get current ISO date string (YYYY-MM-DD format)
 */
export function getCurrentISODate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current ISO datetime string
 */
export function getCurrentISODateTime(): string {
  return new Date().toISOString();
}

/**
 * Convert Date to ISO date string (YYYY-MM-DD format)
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Convert Date to ISO datetime string
 */
export function toISODateTime(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
}

/**
 * Get date N days ago from today
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

/**
 * Get date N days from today
 */
export function getDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/**
 * Get start and end dates for a time range
 */
export function getDateRange(range: '7d' | '30d' | '90d'): { startDate: string; endDate: string } {
  const endDate = getCurrentISODate();
  let startDate: string;
  
  switch (range) {
    case '7d':
      startDate = getDaysAgo(7);
      break;
    case '30d':
      startDate = getDaysAgo(30);
      break;
    case '90d':
      startDate = getDaysAgo(90);
      break;
    default:
      throw new Error(`Invalid date range: ${range}`);
  }
  
  return { startDate, endDate };
}

/**
 * Calculate days between two dates
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (TIME.MILLISECONDS_PER_SECOND * TIME.SECONDS_PER_MINUTE * TIME.MINUTES_PER_HOUR * TIME.HOURS_PER_DAY));
}

/**
 * Check if a date string is valid ISO date format (YYYY-MM-DD)
 */
export function isValidISODate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === toISODate(date);
}

/**
 * Check if a datetime string is valid ISO datetime format
 */
export function isValidISODateTime(datetimeString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!regex.test(datetimeString)) {
    return false;
  }
  
  const date = new Date(datetimeString);
  return !isNaN(date.getTime());
}

/**
 * Get TTL timestamp for DynamoDB (Unix timestamp)
 */
export function getTTLTimestamp(daysFromNow: number): number {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return Math.floor(date.getTime() / TIME.MILLISECONDS_PER_SECOND);
}

/**
 * Convert Unix timestamp to ISO datetime string
 */
export function unixToISODateTime(timestamp: number): string {
  return new Date(timestamp * TIME.MILLISECONDS_PER_SECOND).toISOString();
}

/**
 * Convert ISO datetime string to Unix timestamp
 */
export function isoDateTimeToUnix(datetimeString: string): number {
  return Math.floor(new Date(datetimeString).getTime() / TIME.MILLISECONDS_PER_SECOND);
}

/**
 * Get the start of day for a given date
 */
export function getStartOfDay(date: Date): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Get the end of day for a given date
 */
export function getEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * Get array of dates between start and end date (inclusive)
 */
export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(toISODate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export function formatDateForDisplay(dateString: string, locale = 'en-US'): string {
  const date = parseISODate(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime for display (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDateTimeForDisplay(datetimeString: string, locale = 'en-US'): string {
  const date = new Date(datetimeString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function getRelativeTimeString(datetimeString: string): string {
  const date = new Date(datetimeString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / TIME.MILLISECONDS_PER_SECOND);
  const diffMinutes = Math.floor(diffSeconds / TIME.SECONDS_PER_MINUTE);
  const diffHours = Math.floor(diffMinutes / TIME.MINUTES_PER_HOUR);
  const diffDays = Math.floor(diffHours / TIME.HOURS_PER_DAY);
  
  if (Math.abs(diffDays) >= 1) {
    return diffDays > 0 ? `${diffDays} day${diffDays > 1 ? 's' : ''} ago` : `in ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
  } else if (Math.abs(diffHours) >= 1) {
    return diffHours > 0 ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago` : `in ${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''}`;
  } else if (Math.abs(diffMinutes) >= 1) {
    return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago` : `in ${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''}`;
  } else {
    return 'just now';
  }
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getCurrentISODate();
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(dateString: string): boolean {
  return dateString === getDaysAgo(1);
}

/**
 * Get week start date (Monday) for a given date
 */
export function getWeekStart(dateString: string): string {
  const date = parseISODate(dateString);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(date.setDate(diff));
  return toISODate(weekStart);
}

/**
 * Get month start date for a given date
 */
export function getMonthStart(dateString: string): string {
  const date = parseISODate(dateString);
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  return toISODate(monthStart);
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Convert UTC datetime to local timezone
 */
export function utcToLocal(utcDatetimeString: string): string {
  const date = new Date(utcDatetimeString);
  return date.toISOString();
}

/**
 * Convert local datetime to UTC
 */
export function localToUTC(localDatetimeString: string): string {
  const date = new Date(localDatetimeString);
  return date.toISOString();
}