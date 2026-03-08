/**
 * Constants and configuration values for Mindful Browse platform
 * Centralized location for all system-wide constants
 */
export declare const WELLBEING_SCORES: {
    readonly MIN_SCORE: 0;
    readonly MAX_SCORE: 100;
    readonly DEFAULT_SCORE: 50;
    readonly SCORE_NAMES: readonly ["informationOverload", "negativeContentBias", "emotionalLoadScore", "doomscrollIndex", "cognitiveDiversityScore", "mindfulnessGapScore"];
};
export declare const DATA_LIMITS: {
    readonly MAX_TITLE_LENGTH: 200;
    readonly MAX_EXCERPT_LENGTH: 500;
    readonly MAX_TOPIC_HINTS: 10;
    readonly MAX_BATCH_SIZE: 100;
    readonly MAX_EVENT_SIZE_BYTES: 2048;
    readonly MAX_BATCH_SIZE_BYTES: 102400;
    readonly MAX_DOMAIN_LENGTH: 253;
};
export declare const DATA_RETENTION: {
    readonly MIN_RETENTION_DAYS: 1;
    readonly MAX_RETENTION_DAYS: 365;
    readonly DEFAULT_RETENTION_DAYS: 90;
    readonly BASELINE_CALCULATION_MIN_DAYS: 7;
    readonly INSIGHT_EXPIRY_DAYS: 30;
};
export declare const SENTIMENT: {
    readonly CLASSIFICATIONS: readonly ["positive", "neutral", "negative"];
    readonly CONFIDENCE_THRESHOLD: 0.7;
    readonly BATCH_SIZE: 25;
};
export declare const TOPICS: {
    readonly CATEGORIES: readonly ["politics", "violence", "finance", "health", "technology", "entertainment", "sports", "science", "education", "lifestyle"];
    readonly MAX_CATEGORIES_PER_ITEM: 5;
};
export declare const EMOTIONAL_TONES: {
    readonly BUCKETS: readonly ["anxiety-inducing", "neutral", "uplifting"];
};
export declare const API: {
    readonly MAX_REQUESTS_PER_MINUTE: 60;
    readonly MAX_REQUESTS_PER_HOUR: 1000;
    readonly DEFAULT_TIMEOUT_MS: 30000;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY_MS: 1000;
    readonly EXPONENTIAL_BACKOFF_MULTIPLIER: 2;
};
export declare const DYNAMODB: {
    readonly TABLE_NAME: "mindful-browse-data";
    readonly GSI1_NAME: "GSI1";
    readonly PARTITION_KEY: "PK";
    readonly SORT_KEY: "SK";
    readonly GSI1_PARTITION_KEY: "GSI1PK";
    readonly GSI1_SORT_KEY: "GSI1SK";
    readonly TTL_ATTRIBUTE: "TTL";
};
export declare const DYNAMODB_KEYS: {
    readonly USER_PROFILE: (userId: string) => {
        PK: string;
        SK: string;
    };
    readonly DAILY_METRICS: (userId: string, date: string) => {
        PK: string;
        SK: string;
    };
    readonly INSIGHT: (userId: string, date: string, insightId: string) => {
        PK: string;
        SK: string;
    };
};
export declare const BROWSER_EXTENSION: {
    readonly MANIFEST_VERSION: 3;
    readonly SUPPORTED_BROWSERS: readonly ["chrome", "firefox", "safari", "edge"];
    readonly CONTENT_SCRIPT_TIMEOUT_MS: 5000;
    readonly BACKGROUND_PROCESSING_INTERVAL_MS: 30000;
    readonly OFFLINE_QUEUE_MAX_SIZE: 1000;
    readonly SYNC_INTERVAL_MS: 300000;
};
export declare const PRIVACY: {
    readonly LEVELS: readonly ["minimal", "standard", "detailed"];
    readonly INSIGHT_FREQUENCIES: readonly ["daily", "weekly", "never"];
    readonly DELETION_GRACE_PERIOD_DAYS: 30;
    readonly ANONYMIZATION_DELAY_HOURS: 24;
};
export declare const PERFORMANCE: {
    readonly MAX_DASHBOARD_LOAD_TIME_MS: 2000;
    readonly MAX_METRIC_CALCULATION_TIME_MS: 5000;
    readonly MAX_API_RESPONSE_TIME_MS: 500;
    readonly MAX_BROWSER_EXTENSION_OVERHEAD_MS: 50;
};
export declare const AWS: {
    readonly REGIONS: {
        readonly PRIMARY: "us-east-1";
        readonly SECONDARY: "us-west-2";
    };
    readonly COMPREHEND: {
        readonly MAX_BATCH_SIZE: 25;
        readonly MAX_TEXT_LENGTH: 5000;
        readonly MIN_CONFIDENCE: 0.5;
    };
    readonly S3: {
        readonly BACKUP_BUCKET_PREFIX: "mindful-browse-backups";
        readonly ENCRYPTION_ALGORITHM: "AES256";
    };
    readonly LAMBDA: {
        readonly TIMEOUT_SECONDS: 300;
        readonly MEMORY_MB: 512;
    };
};
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly PRIVACY_VIOLATION: "PRIVACY_VIOLATION";
    readonly DATA_SIZE_EXCEEDED: "DATA_SIZE_EXCEEDED";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED";
    readonly AUTHORIZATION_FAILED: "AUTHORIZATION_FAILED";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
    readonly DATA_NOT_FOUND: "DATA_NOT_FOUND";
    readonly PROCESSING_FAILED: "PROCESSING_FAILED";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const TIME: {
    readonly MILLISECONDS_PER_SECOND: 1000;
    readonly SECONDS_PER_MINUTE: 60;
    readonly MINUTES_PER_HOUR: 60;
    readonly HOURS_PER_DAY: 24;
    readonly DAYS_PER_WEEK: 7;
    readonly DAYS_PER_MONTH: 30;
    readonly DAYS_PER_YEAR: 365;
};
export declare const REGEX: {
    readonly ISO_DATE: RegExp;
    readonly ISO_DATETIME: RegExp;
    readonly UUID: RegExp;
    readonly EMAIL: RegExp;
    readonly DOMAIN: RegExp;
};
export declare const FEATURE_FLAGS: {
    readonly ENABLE_BEDROCK_INSIGHTS: false;
    readonly ENABLE_S3_BACKUPS: false;
    readonly ENABLE_ADVANCED_ANALYTICS: false;
    readonly ENABLE_CROSS_BROWSER_SYNC: false;
};
export declare const ENVIRONMENT: {
    readonly DEVELOPMENT: "development";
    readonly STAGING: "staging";
    readonly PRODUCTION: "production";
};
export type WellbeingScoreName = typeof WELLBEING_SCORES.SCORE_NAMES[number];
export type SentimentClassification = typeof SENTIMENT.CLASSIFICATIONS[number];
export type TopicCategory = typeof TOPICS.CATEGORIES[number];
export type EmotionalTone = typeof EMOTIONAL_TONES.BUCKETS[number];
export type PrivacyLevel = typeof PRIVACY.LEVELS[number];
export type InsightFrequency = typeof PRIVACY.INSIGHT_FREQUENCIES[number];
export type SupportedBrowser = typeof BROWSER_EXTENSION.SUPPORTED_BROWSERS[number];
//# sourceMappingURL=constants.d.ts.map