/**
 * Constants and configuration values for Mindful Browse platform
 * Centralized location for all system-wide constants
 */

// Wellbeing Score Constants
export const WELLBEING_SCORES = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  DEFAULT_SCORE: 50,
  SCORE_NAMES: [
    'informationOverload',
    'negativeContentBias', 
    'emotionalLoadScore',
    'doomscrollIndex',
    'cognitiveDiversityScore',
    'mindfulnessGapScore',
  ] as const,
} as const;

// Data Collection Limits (Privacy Requirements)
export const DATA_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_EXCERPT_LENGTH: 500,
  MAX_TOPIC_HINTS: 10,
  MAX_BATCH_SIZE: 100,
  MAX_EVENT_SIZE_BYTES: 2048,
  MAX_BATCH_SIZE_BYTES: 102400, // 100KB
  MAX_DOMAIN_LENGTH: 253,
} as const;

// Data Retention Settings
export const DATA_RETENTION = {
  MIN_RETENTION_DAYS: 1,
  MAX_RETENTION_DAYS: 365,
  DEFAULT_RETENTION_DAYS: 90,
  BASELINE_CALCULATION_MIN_DAYS: 7,
  INSIGHT_EXPIRY_DAYS: 30,
} as const;

// Sentiment Analysis Constants
export const SENTIMENT = {
  CLASSIFICATIONS: ['positive', 'neutral', 'negative'] as const,
  CONFIDENCE_THRESHOLD: 0.7,
  BATCH_SIZE: 25, // Amazon Comprehend batch limit
} as const;

// Topic Classification Constants
export const TOPICS = {
  CATEGORIES: [
    'politics',
    'violence', 
    'finance',
    'health',
    'technology',
    'entertainment',
    'sports',
    'science',
    'education',
    'lifestyle',
  ] as const,
  MAX_CATEGORIES_PER_ITEM: 5,
} as const;

// Emotional Tone Buckets
export const EMOTIONAL_TONES = {
  BUCKETS: ['anxiety-inducing', 'neutral', 'uplifting'] as const,
} as const;

// API Configuration
export const API = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,
  DEFAULT_TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  EXPONENTIAL_BACKOFF_MULTIPLIER: 2,
} as const;

// DynamoDB Configuration
export const DYNAMODB = {
  TABLE_NAME: 'mindful-browse-data',
  GSI1_NAME: 'GSI1',
  PARTITION_KEY: 'PK',
  SORT_KEY: 'SK',
  GSI1_PARTITION_KEY: 'GSI1PK',
  GSI1_SORT_KEY: 'GSI1SK',
  TTL_ATTRIBUTE: 'TTL',
} as const;

// DynamoDB Key Patterns
export const DYNAMODB_KEYS = {
  USER_PROFILE: (userId: string) => ({
    PK: `USER#${userId}`,
    SK: 'PROFILE',
  }),
  DAILY_METRICS: (userId: string, date: string) => ({
    PK: `USER#${userId}`,
    SK: `METRICS#${date}`,
  }),
  INSIGHT: (userId: string, date: string, insightId: string) => ({
    PK: `USER#${userId}`,
    SK: `INSIGHT#${date}#${insightId}`,
  }),
} as const;

// Browser Extension Constants
export const BROWSER_EXTENSION = {
  MANIFEST_VERSION: 3,
  SUPPORTED_BROWSERS: ['chrome', 'firefox', 'safari', 'edge'] as const,
  CONTENT_SCRIPT_TIMEOUT_MS: 5000,
  BACKGROUND_PROCESSING_INTERVAL_MS: 30000,
  OFFLINE_QUEUE_MAX_SIZE: 1000,
  SYNC_INTERVAL_MS: 300000, // 5 minutes
} as const;

// Privacy Settings
export const PRIVACY = {
  LEVELS: ['minimal', 'standard', 'detailed'] as const,
  INSIGHT_FREQUENCIES: ['daily', 'weekly', 'never'] as const,
  DELETION_GRACE_PERIOD_DAYS: 30,
  ANONYMIZATION_DELAY_HOURS: 24,
} as const;

// Performance Thresholds
export const PERFORMANCE = {
  MAX_DASHBOARD_LOAD_TIME_MS: 2000,
  MAX_METRIC_CALCULATION_TIME_MS: 5000,
  MAX_API_RESPONSE_TIME_MS: 500,
  MAX_BROWSER_EXTENSION_OVERHEAD_MS: 50,
} as const;

// AWS Service Configuration
export const AWS = {
  REGIONS: {
    PRIMARY: 'us-east-1',
    SECONDARY: 'us-west-2',
  },
  COMPREHEND: {
    MAX_BATCH_SIZE: 25,
    MAX_TEXT_LENGTH: 5000,
    MIN_CONFIDENCE: 0.5,
  },
  S3: {
    BACKUP_BUCKET_PREFIX: 'mindful-browse-backups',
    ENCRYPTION_ALGORITHM: 'AES256',
  },
  LAMBDA: {
    TIMEOUT_SECONDS: 300,
    MEMORY_MB: 512,
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PRIVACY_VIOLATION: 'PRIVACY_VIOLATION',
  DATA_SIZE_EXCEEDED: 'DATA_SIZE_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Time Constants
export const TIME = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365,
} as const;

// Regular Expressions
export const REGEX = {
  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,
  ISO_DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DOMAIN: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
} as const;

// Feature Flags (for gradual rollout)
export const FEATURE_FLAGS = {
  ENABLE_BEDROCK_INSIGHTS: false,
  ENABLE_S3_BACKUPS: false,
  ENABLE_ADVANCED_ANALYTICS: false,
  ENABLE_CROSS_BROWSER_SYNC: false,
} as const;

// Environment-specific constants
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

// Export type for wellbeing score names
export type WellbeingScoreName = typeof WELLBEING_SCORES.SCORE_NAMES[number];
export type SentimentClassification = typeof SENTIMENT.CLASSIFICATIONS[number];
export type TopicCategory = typeof TOPICS.CATEGORIES[number];
export type EmotionalTone = typeof EMOTIONAL_TONES.BUCKETS[number];
export type PrivacyLevel = typeof PRIVACY.LEVELS[number];
export type InsightFrequency = typeof PRIVACY.INSIGHT_FREQUENCIES[number];
export type SupportedBrowser = typeof BROWSER_EXTENSION.SUPPORTED_BROWSERS[number];