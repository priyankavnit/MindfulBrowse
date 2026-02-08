import { z } from 'zod';
import { WellbeingBaselineSchema } from './wellbeing-metrics';

// Privacy Settings Schema
export const PrivacySettingsSchema = z.object({
  dataRetentionDays: z.number().int().min(1).max(365).default(90),
  enableBackups: z.boolean().default(false),
  insightFrequency: z.enum(['daily', 'weekly', 'never']).default('weekly'),
  privacyLevel: z.enum(['minimal', 'standard', 'detailed']).default('standard'),
  allowAnalytics: z.boolean().default(false),
  shareAggregatedData: z.boolean().default(false),
});

export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;

// User Preferences Schema
export const UserPreferencesSchema = z.object({
  timezone: z.string().default('UTC'),
  language: z.string().length(2).default('en'), // ISO 639-1 language codes
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  notifications: z.object({
    dailyInsights: z.boolean().default(true),
    weeklyReports: z.boolean().default(true),
    wellbeingAlerts: z.boolean().default(false),
  }).default({}),
  dashboard: z.object({
    defaultTimeRange: z.enum(['7d', '30d', '90d']).default('30d'),
    showTrends: z.boolean().default(true),
    showComparisons: z.boolean().default(false),
  }).default({}),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// User Profile Schema - main user data structure
export const UserProfileSchema = z.object({
  PK: z.string(), // USER#${userId}
  SK: z.string().literal('PROFILE'),
  userId: z.string(),
  email: z.string().email(),
  preferences: UserPreferencesSchema.default({}),
  privacySettings: PrivacySettingsSchema.default({}),
  baselineMetrics: WellbeingBaselineSchema.optional(),
  onboardingCompleted: z.boolean().default(false),
  extensionInstalled: z.boolean().default(false),
  lastActiveAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  TTL: z.number().int().positive().optional(), // For account deletion
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// User Registration Schema
export const UserRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  preferences: UserPreferencesSchema.partial().optional(),
  privacySettings: PrivacySettingsSchema.partial().optional(),
  acceptedTerms: z.boolean().refine(val => val === true, {
    message: 'Terms and conditions must be accepted',
  }),
  acceptedPrivacyPolicy: z.boolean().refine(val => val === true, {
    message: 'Privacy policy must be accepted',
  }),
});

export type UserRegistration = z.infer<typeof UserRegistrationSchema>;

// User Update Schema
export const UserUpdateSchema = z.object({
  preferences: UserPreferencesSchema.partial().optional(),
  privacySettings: PrivacySettingsSchema.partial().optional(),
  onboardingCompleted: z.boolean().optional(),
  extensionInstalled: z.boolean().optional(),
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;

// Account Deletion Request Schema
export const AccountDeletionRequestSchema = z.object({
  userId: z.string(),
  reason: z.enum([
    'privacy_concerns',
    'not_useful',
    'technical_issues',
    'switching_services',
    'other'
  ]).optional(),
  feedback: z.string().max(500).optional(),
  deleteImmediately: z.boolean().default(false), // vs scheduled deletion
});

export type AccountDeletionRequest = z.infer<typeof AccountDeletionRequestSchema>;