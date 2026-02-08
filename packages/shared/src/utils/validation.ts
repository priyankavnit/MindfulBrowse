import { z } from 'zod';
import {
  BrowsingEventSchema,
  ProcessingEventSchema,
  DailyMetricsSchema,
  UserProfileSchema,
  WellbeingScoresSchema,
  InsightSchema,
} from '../types';

/**
 * Validation utility functions for Mindful Browse data models
 * Provides runtime validation and type guards for all core data structures
 */

// Type guard functions
export function isBrowsingEvent(data: unknown): data is z.infer<typeof BrowsingEventSchema> {
  return BrowsingEventSchema.safeParse(data).success;
}

export function isProcessingEvent(data: unknown): data is z.infer<typeof ProcessingEventSchema> {
  return ProcessingEventSchema.safeParse(data).success;
}

export function isDailyMetrics(data: unknown): data is z.infer<typeof DailyMetricsSchema> {
  return DailyMetricsSchema.safeParse(data).success;
}

export function isUserProfile(data: unknown): data is z.infer<typeof UserProfileSchema> {
  return UserProfileSchema.safeParse(data).success;
}

export function isWellbeingScores(data: unknown): data is z.infer<typeof WellbeingScoresSchema> {
  return WellbeingScoresSchema.safeParse(data).success;
}

export function isInsight(data: unknown): data is z.infer<typeof InsightSchema> {
  return InsightSchema.safeParse(data).success;
}

// Validation functions that throw on invalid data
export function validateBrowsingEvent(data: unknown): z.infer<typeof BrowsingEventSchema> {
  return BrowsingEventSchema.parse(data);
}

export function validateProcessingEvent(data: unknown): z.infer<typeof ProcessingEventSchema> {
  return ProcessingEventSchema.parse(data);
}

export function validateDailyMetrics(data: unknown): z.infer<typeof DailyMetricsSchema> {
  return DailyMetricsSchema.parse(data);
}

export function validateUserProfile(data: unknown): z.infer<typeof UserProfileSchema> {
  return UserProfileSchema.parse(data);
}

export function validateWellbeingScores(data: unknown): z.infer<typeof WellbeingScoresSchema> {
  return WellbeingScoresSchema.parse(data);
}

export function validateInsight(data: unknown): z.infer<typeof InsightSchema> {
  return InsightSchema.parse(data);
}

// Safe validation functions that return results with error information
export function safeValidateBrowsingEvent(data: unknown) {
  return BrowsingEventSchema.safeParse(data);
}

export function safeValidateProcessingEvent(data: unknown) {
  return ProcessingEventSchema.safeParse(data);
}

export function safeValidateDailyMetrics(data: unknown) {
  return DailyMetricsSchema.safeParse(data);
}

export function safeValidateUserProfile(data: unknown) {
  return UserProfileSchema.safeParse(data);
}

export function safeValidateWellbeingScores(data: unknown) {
  return WellbeingScoresSchema.safeParse(data);
}

export function safeValidateInsight(data: unknown) {
  return InsightSchema.safeParse(data);
}

// Batch validation utilities
export function validateBrowsingEventBatch(data: unknown[]): z.infer<typeof BrowsingEventSchema>[] {
  return data.map(validateBrowsingEvent);
}

export function safeValidateBrowsingEventBatch(data: unknown[]) {
  return data.map(safeValidateBrowsingEvent);
}

// Privacy validation helpers
export function validatePrivacyCompliance(data: any): boolean {
  // Check that no sensitive data is present
  const sensitiveFields = ['password', 'credentials', 'fullContent', 'privateMessages'];
  
  function checkObject(obj: any, path = ''): boolean {
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
export function validateDataSizeLimits(data: any): boolean {
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
export function validateContentLengthLimits(content: string, type: 'title' | 'excerpt'): boolean {
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