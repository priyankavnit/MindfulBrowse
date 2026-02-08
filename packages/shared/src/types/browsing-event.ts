import { z } from 'zod';

// Browsing Event Schema - captures minimal metadata for privacy
export const BrowsingEventSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string(),
  timestamp: z.number().int().positive(),
  domain: z.string().min(1).max(253), // Valid domain length
  pageTitle: z.string().max(200), // Limit title length for privacy
  excerpt: z.string().max(500).optional(), // Short excerpt only
  sessionId: z.string().uuid(),
  url: z.string().url().optional(), // Optional, may be excluded for privacy
});

export type BrowsingEvent = z.infer<typeof BrowsingEventSchema>;

// Local Sentiment Data - processed in browser before transmission
export const LocalSentimentDataSchema = z.object({
  eventId: z.string().uuid(),
  preliminaryTone: z.enum(['positive', 'neutral', 'negative']),
  topicHints: z.array(z.string()).max(10), // Limit topic hints
  confidenceScore: z.number().min(0).max(1).optional(),
});

export type LocalSentimentData = z.infer<typeof LocalSentimentDataSchema>;

// Processing Event - internal use for Lambda functions
export const ProcessingEventSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string(),
  timestamp: z.number().int().positive(),
  domain: z.string(),
  pageTitle: z.string(),
  excerpt: z.string().optional(),
  derivedSentiment: z.object({
    score: z.number().min(-1).max(1),
    magnitude: z.number().min(0).max(1),
    classification: z.enum(['positive', 'neutral', 'negative']),
  }).optional(),
  topicClassification: z.object({
    categories: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }).optional(),
});

export type ProcessingEvent = z.infer<typeof ProcessingEventSchema>;

// Batch Processing Request
export const BatchProcessingRequestSchema = z.object({
  userId: z.string(),
  events: z.array(BrowsingEventSchema).min(1).max(100), // Batch size limits
  processingOptions: z.object({
    enableSentiment: z.boolean().default(true),
    enableTopicClassification: z.boolean().default(true),
    enableInsightGeneration: z.boolean().default(false),
  }),
});

export type BatchProcessingRequest = z.infer<typeof BatchProcessingRequestSchema>;