import { z } from 'zod';

// Insight Type Schema
export const InsightTypeSchema = z.enum([
  'trend_alert',
  'pattern_recognition',
  'recommendation',
  'milestone',
  'warning',
  'tip',
]);

export type InsightType = z.infer<typeof InsightTypeSchema>;

// Insight Priority Schema
export const InsightPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export type InsightPriority = z.infer<typeof InsightPrioritySchema>;

// Insight Action Schema
export const InsightActionSchema = z.object({
  type: z.enum(['link', 'setting', 'feature', 'external']),
  label: z.string(),
  url: z.string().url().optional(),
  settingPath: z.string().optional(),
  featureId: z.string().optional(),
});

export type InsightAction = z.infer<typeof InsightActionSchema>;

// Base Insight Schema
export const InsightSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: InsightTypeSchema,
  priority: InsightPrioritySchema,
  title: z.string().max(100),
  description: z.string().max(500),
  detailedExplanation: z.string().max(1000).optional(),
  relatedMetrics: z.array(z.string()).optional(), // Metric names that triggered this insight
  dataPoints: z.record(z.union([z.string(), z.number()])).optional(), // Supporting data
  actions: z.array(InsightActionSchema).optional(),
  isRead: z.boolean().default(false),
  isDismissed: z.boolean().default(false),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export type Insight = z.infer<typeof InsightSchema>;

// Stored Insight Schema - for DynamoDB
export const StoredInsightSchema = z.object({
  PK: z.string(), // USER#${userId}
  SK: z.string(), // INSIGHT#${date}#${insightId}
  GSI1PK: z.string().optional(), // For cross-user analytics
  GSI1SK: z.string().optional(),
  ...InsightSchema.shape,
  TTL: z.number().int().positive().optional(),
});

export type StoredInsight = z.infer<typeof StoredInsightSchema>;

// Insight Generation Request Schema
export const InsightGenerationRequestSchema = z.object({
  userId: z.string(),
  timeRange: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  includeTypes: z.array(InsightTypeSchema).optional(),
  maxInsights: z.number().int().min(1).max(20).default(10),
  forceRegeneration: z.boolean().default(false),
});

export type InsightGenerationRequest = z.infer<typeof InsightGenerationRequestSchema>;

// Insight Response Schema
export const InsightResponseSchema = z.object({
  insights: z.array(InsightSchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
  nextToken: z.string().optional(),
  generatedAt: z.string().datetime(),
});

export type InsightResponse = z.infer<typeof InsightResponseSchema>;

// Recommendation Schema - specific type of insight
export const RecommendationSchema = InsightSchema.extend({
  type: z.literal('recommendation'),
  category: z.enum([
    'content_curation',
    'time_management',
    'mindful_browsing',
    'digital_wellness',
    'break_suggestions',
  ]),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  estimatedImpact: z.enum(['low', 'medium', 'high']),
  implementationTime: z.string().optional(), // e.g., "5 minutes", "1 week"
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// Pattern Recognition Schema
export const PatternRecognitionSchema = InsightSchema.extend({
  type: z.literal('pattern_recognition'),
  pattern: z.object({
    name: z.string(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'irregular']),
    strength: z.number().min(0).max(1), // Confidence in pattern
    trend: z.enum(['increasing', 'decreasing', 'stable']),
  }),
  historicalData: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    value: z.number(),
  })).optional(),
});

export type PatternRecognition = z.infer<typeof PatternRecognitionSchema>;