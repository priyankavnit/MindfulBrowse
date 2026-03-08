import { z } from 'zod';
import { BrowsingEventSchema, ProcessingEventSchema, DailyMetricsSchema, UserProfileSchema, WellbeingScoresSchema, InsightSchema } from '../types';
/**
 * Validation utility functions for Mindful Browse data models
 * Provides runtime validation and type guards for all core data structures
 */
export declare function isBrowsingEvent(data: unknown): data is z.infer<typeof BrowsingEventSchema>;
export declare function isProcessingEvent(data: unknown): data is z.infer<typeof ProcessingEventSchema>;
export declare function isDailyMetrics(data: unknown): data is z.infer<typeof DailyMetricsSchema>;
export declare function isUserProfile(data: unknown): data is z.infer<typeof UserProfileSchema>;
export declare function isWellbeingScores(data: unknown): data is z.infer<typeof WellbeingScoresSchema>;
export declare function isInsight(data: unknown): data is z.infer<typeof InsightSchema>;
export declare function validateBrowsingEvent(data: unknown): z.infer<typeof BrowsingEventSchema>;
export declare function validateProcessingEvent(data: unknown): z.infer<typeof ProcessingEventSchema>;
export declare function validateDailyMetrics(data: unknown): z.infer<typeof DailyMetricsSchema>;
export declare function validateUserProfile(data: unknown): z.infer<typeof UserProfileSchema>;
export declare function validateWellbeingScores(data: unknown): z.infer<typeof WellbeingScoresSchema>;
export declare function validateInsight(data: unknown): z.infer<typeof InsightSchema>;
export declare function safeValidateBrowsingEvent(data: unknown): any;
export declare function safeValidateProcessingEvent(data: unknown): any;
export declare function safeValidateDailyMetrics(data: unknown): any;
export declare function safeValidateUserProfile(data: unknown): any;
export declare function safeValidateWellbeingScores(data: unknown): any;
export declare function safeValidateInsight(data: unknown): any;
export declare function validateBrowsingEventBatch(data: unknown[]): z.infer<typeof BrowsingEventSchema>[];
export declare function safeValidateBrowsingEventBatch(data: unknown[]): any[];
export declare function validatePrivacyCompliance(data: any): boolean;
export declare function validateDataSizeLimits(data: any): boolean;
export declare function validateContentLengthLimits(content: string, type: 'title' | 'excerpt'): boolean;
//# sourceMappingURL=validation.d.ts.map