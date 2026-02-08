import { z } from 'zod';

// Wellbeing Score Schema - all scores are 0-100 scale
export const WellbeingScoresSchema = z.object({
  informationOverload: z.number().min(0).max(100),
  negativeContentBias: z.number().min(0).max(100),
  emotionalLoadScore: z.number().min(0).max(100),
  doomscrollIndex: z.number().min(0).max(100),
  cognitiveDiversityScore: z.number().min(0).max(100),
  mindfulnessGapScore: z.number().min(0).max(100),
});

export type WellbeingScores = z.infer<typeof WellbeingScoresSchema>;

// Session Summary Schema
export const SessionSummarySchema = z.object({
  totalSessions: z.number().int().min(0),
  totalTimeMinutes: z.number().min(0),
  uniqueDomains: z.number().int().min(0),
  topTopics: z.array(z.string()).max(10),
  averageSessionLength: z.number().min(0),
  peakBrowsingHour: z.number().int().min(0).max(23).optional(),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

// Sentiment Breakdown Schema
export const SentimentBreakdownSchema = z.object({
  positiveCount: z.number().int().min(0),
  neutralCount: z.number().int().min(0),
  negativeCount: z.number().int().min(0),
  positivePercentage: z.number().min(0).max(100),
  neutralPercentage: z.number().min(0).max(100),
  negativePercentage: z.number().min(0).max(100),
});

export type SentimentBreakdown = z.infer<typeof SentimentBreakdownSchema>;

// Daily Metrics Schema - main data structure stored in DynamoDB
export const DailyMetricsSchema = z.object({
  PK: z.string(), // USER#${userId}
  SK: z.string(), // METRICS#${date}
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date format
  wellbeingScores: WellbeingScoresSchema,
  sessionSummary: SessionSummarySchema,
  sentimentBreakdown: SentimentBreakdownSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  TTL: z.number().int().positive().optional(), // Unix timestamp for auto-deletion
});

export type DailyMetrics = z.infer<typeof DailyMetricsSchema>;

// Wellbeing Baseline Schema - user's typical patterns
export const WellbeingBaselineSchema = z.object({
  averageSessionLength: z.number().min(0),
  typicalBrowsingHours: z.array(z.number().int().min(0).max(23)),
  preferredTopics: z.array(z.string()),
  baselineScores: WellbeingScoresSchema,
  calculatedAt: z.string().datetime(),
  sampleSize: z.number().int().min(1), // Number of days used for baseline
});

export type WellbeingBaseline = z.infer<typeof WellbeingBaselineSchema>;

// Trend Data Schema - for time-series analysis
export const TrendDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number(),
  change: z.number().optional(), // Change from previous period
  trend: z.enum(['improving', 'stable', 'declining']).optional(),
});

export type TrendData = z.infer<typeof TrendDataSchema>;

// Time Series Data Schema
export const TimeSeriesDataSchema = z.object({
  metricName: z.string(),
  data: z.array(TrendDataSchema),
  period: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type TimeSeriesData = z.infer<typeof TimeSeriesDataSchema>;