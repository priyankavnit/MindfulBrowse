import { BrowsingEventSchema, ProcessingEventSchema, DailyMetricsSchema, UserProfileSchema, WellbeingScoresSchema, InsightSchema, } from '../types';
/**
 * Validation utility functions for Mindful Browse data models
 * Provides runtime validation and type guards for all core data structures
 */
// Type guard functions
export function isBrowsingEvent(data) {
    return BrowsingEventSchema.safeParse(data).success;
}
export function isProcessingEvent(data) {
    return ProcessingEventSchema.safeParse(data).success;
}
export function isDailyMetrics(data) {
    return DailyMetricsSchema.safeParse(data).success;
}
export function isUserProfile(data) {
    return UserProfileSchema.safeParse(data).success;
}
export function isWellbeingScores(data) {
    return WellbeingScoresSchema.safeParse(data).success;
}
export function isInsight(data) {
    return InsightSchema.safeParse(data).success;
}
// Validation functions that throw on invalid data
export function validateBrowsingEvent(data) {
    return BrowsingEventSchema.parse(data);
}
export function validateProcessingEvent(data) {
    return ProcessingEventSchema.parse(data);
}
export function validateDailyMetrics(data) {
    return DailyMetricsSchema.parse(data);
}
export function validateUserProfile(data) {
    return UserProfileSchema.parse(data);
}
export function validateWellbeingScores(data) {
    return WellbeingScoresSchema.parse(data);
}
export function validateInsight(data) {
    return InsightSchema.parse(data);
}
// Safe validation functions that return results with error information
export function safeValidateBrowsingEvent(data) {
    return BrowsingEventSchema.safeParse(data);
}
export function safeValidateProcessingEvent(data) {
    return ProcessingEventSchema.safeParse(data);
}
export function safeValidateDailyMetrics(data) {
    return DailyMetricsSchema.safeParse(data);
}
export function safeValidateUserProfile(data) {
    return UserProfileSchema.safeParse(data);
}
export function safeValidateWellbeingScores(data) {
    return WellbeingScoresSchema.safeParse(data);
}
export function safeValidateInsight(data) {
    return InsightSchema.safeParse(data);
}
// Batch validation utilities
export function validateBrowsingEventBatch(data) {
    return data.map(validateBrowsingEvent);
}
export function safeValidateBrowsingEventBatch(data) {
    return data.map(safeValidateBrowsingEvent);
}
// Privacy validation helpers
export function validatePrivacyCompliance(data) {
    // Check that no sensitive data is present
    const sensitiveFields = ['password', 'credentials', 'fullContent', 'privateMessages'];
    function checkObject(obj, path = '') {
        if (typeof obj !== 'object' || obj === null) {
            return true;
        }
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            // Check for sensitive field names
            if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
                console.warn(`Potential privacy violation: sensitive field detected at ${currentPath}`);
                return false;
            }
            // Recursively check nested objects
            if (typeof value === 'object' && value !== null) {
                if (!checkObject(value, currentPath)) {
                    return false;
                }
            }
        }
        return true;
    }
    return checkObject(data);
}
// Data size validation for privacy limits
export function validateDataSizeLimits(data) {
    const dataString = JSON.stringify(data);
    const sizeInBytes = new TextEncoder().encode(dataString).length;
    // Limits based on privacy requirements
    const MAX_EVENT_SIZE = 2048; // 2KB per event
    const MAX_BATCH_SIZE = 102400; // 100KB per batch
    if (sizeInBytes > MAX_BATCH_SIZE) {
        console.warn(`Data size exceeds batch limit: ${sizeInBytes} bytes > ${MAX_BATCH_SIZE} bytes`);
        return false;
    }
    return true;
}
// Content length validation for privacy
export function validateContentLengthLimits(content, type) {
    const limits = {
        title: 200,
        excerpt: 500,
    };
    const limit = limits[type];
    if (content.length > limit) {
        console.warn(`Content length exceeds ${type} limit: ${content.length} > ${limit}`);
        return false;
    }
    return true;
}
//# sourceMappingURL=validation.js.map