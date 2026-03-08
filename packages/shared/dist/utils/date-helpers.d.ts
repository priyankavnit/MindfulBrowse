/**
 * Date utility functions for Mindful Browse platform
 * Provides consistent date handling across all packages
 */
/**
 * Get current ISO date string (YYYY-MM-DD format)
 */
export declare function getCurrentISODate(): string;
/**
 * Get current ISO datetime string
 */
export declare function getCurrentISODateTime(): string;
/**
 * Convert Date to ISO date string (YYYY-MM-DD format)
 */
export declare function toISODate(date: Date): string;
/**
 * Convert Date to ISO datetime string
 */
export declare function toISODateTime(date: Date): string;
/**
 * Parse ISO date string to Date object
 */
export declare function parseISODate(dateString: string): Date;
/**
 * Get date N days ago from today
 */
export declare function getDaysAgo(days: number): string;
/**
 * Get date N days from today
 */
export declare function getDaysFromNow(days: number): string;
/**
 * Get start and end dates for a time range
 */
export declare function getDateRange(range: '7d' | '30d' | '90d'): {
    startDate: string;
    endDate: string;
};
/**
 * Calculate days between two dates
 */
export declare function daysBetween(startDate: string, endDate: string): number;
/**
 * Check if a date string is valid ISO date format (YYYY-MM-DD)
 */
export declare function isValidISODate(dateString: string): boolean;
/**
 * Check if a datetime string is valid ISO datetime format
 */
export declare function isValidISODateTime(datetimeString: string): boolean;
/**
 * Get TTL timestamp for DynamoDB (Unix timestamp)
 */
export declare function getTTLTimestamp(daysFromNow: number): number;
/**
 * Convert Unix timestamp to ISO datetime string
 */
export declare function unixToISODateTime(timestamp: number): string;
/**
 * Convert ISO datetime string to Unix timestamp
 */
export declare function isoDateTimeToUnix(datetimeString: string): number;
/**
 * Get the start of day for a given date
 */
export declare function getStartOfDay(date: Date): Date;
/**
 * Get the end of day for a given date
 */
export declare function getEndOfDay(date: Date): Date;
/**
 * Get array of dates between start and end date (inclusive)
 */
export declare function getDatesBetween(startDate: string, endDate: string): string[];
/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export declare function formatDateForDisplay(dateString: string, locale?: string): string;
/**
 * Format datetime for display (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export declare function formatDateTimeForDisplay(datetimeString: string, locale?: string): string;
/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
export declare function getRelativeTimeString(datetimeString: string): string;
/**
 * Check if a date is today
 */
export declare function isToday(dateString: string): boolean;
/**
 * Check if a date is yesterday
 */
export declare function isYesterday(dateString: string): boolean;
/**
 * Get week start date (Monday) for a given date
 */
export declare function getWeekStart(dateString: string): string;
/**
 * Get month start date for a given date
 */
export declare function getMonthStart(dateString: string): string;
/**
 * Get timezone offset in minutes
 */
export declare function getTimezoneOffset(): number;
/**
 * Convert UTC datetime to local timezone
 */
export declare function utcToLocal(utcDatetimeString: string): string;
/**
 * Convert local datetime to UTC
 */
export declare function localToUTC(localDatetimeString: string): string;
//# sourceMappingURL=date-helpers.d.ts.map