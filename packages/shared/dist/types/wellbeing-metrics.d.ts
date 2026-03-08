import { z } from 'zod';
export declare const WellbeingScoresSchema: z.ZodObject<{
    informationOverload: z.ZodNumber;
    negativeContentBias: z.ZodNumber;
    emotionalLoadScore: z.ZodNumber;
    doomscrollIndex: z.ZodNumber;
    cognitiveDiversityScore: z.ZodNumber;
    mindfulnessGapScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    informationOverload: number;
    negativeContentBias: number;
    emotionalLoadScore: number;
    doomscrollIndex: number;
    cognitiveDiversityScore: number;
    mindfulnessGapScore: number;
}, {
    informationOverload: number;
    negativeContentBias: number;
    emotionalLoadScore: number;
    doomscrollIndex: number;
    cognitiveDiversityScore: number;
    mindfulnessGapScore: number;
}>;
export type WellbeingScores = z.infer<typeof WellbeingScoresSchema>;
export declare const SessionSummarySchema: z.ZodObject<{
    totalSessions: z.ZodNumber;
    totalTimeMinutes: z.ZodNumber;
    uniqueDomains: z.ZodNumber;
    topTopics: z.ZodArray<z.ZodString, "many">;
    averageSessionLength: z.ZodNumber;
    peakBrowsingHour: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    totalSessions: number;
    totalTimeMinutes: number;
    uniqueDomains: number;
    topTopics: string[];
    averageSessionLength: number;
    peakBrowsingHour?: number | undefined;
}, {
    totalSessions: number;
    totalTimeMinutes: number;
    uniqueDomains: number;
    topTopics: string[];
    averageSessionLength: number;
    peakBrowsingHour?: number | undefined;
}>;
export type SessionSummary = z.infer<typeof SessionSummarySchema>;
export declare const SentimentBreakdownSchema: z.ZodObject<{
    positiveCount: z.ZodNumber;
    neutralCount: z.ZodNumber;
    negativeCount: z.ZodNumber;
    positivePercentage: z.ZodNumber;
    neutralPercentage: z.ZodNumber;
    negativePercentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
}, {
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
}>;
export type SentimentBreakdown = z.infer<typeof SentimentBreakdownSchema>;
export declare const DailyMetricsSchema: z.ZodObject<{
    PK: z.ZodString;
    SK: z.ZodString;
    userId: z.ZodString;
    date: z.ZodString;
    wellbeingScores: z.ZodObject<{
        informationOverload: z.ZodNumber;
        negativeContentBias: z.ZodNumber;
        emotionalLoadScore: z.ZodNumber;
        doomscrollIndex: z.ZodNumber;
        cognitiveDiversityScore: z.ZodNumber;
        mindfulnessGapScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        informationOverload: number;
        negativeContentBias: number;
        emotionalLoadScore: number;
        doomscrollIndex: number;
        cognitiveDiversityScore: number;
        mindfulnessGapScore: number;
    }, {
        informationOverload: number;
        negativeContentBias: number;
        emotionalLoadScore: number;
        doomscrollIndex: number;
        cognitiveDiversityScore: number;
        mindfulnessGapScore: number;
    }>;
    sessionSummary: z.ZodObject<{
        totalSessions: z.ZodNumber;
        totalTimeMinutes: z.ZodNumber;
        uniqueDomains: z.ZodNumber;
        topTopics: z.ZodArray<z.ZodString, "many">;
        averageSessionLength: z.ZodNumber;
        peakBrowsingHour: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        totalSessions: number;
        totalTimeMinutes: number;
        uniqueDomains: number;
        topTopics: string[];
        averageSessionLength: number;
        peakBrowsingHour?: number | undefined;
    }, {
        totalSessions: number;
        totalTimeMinutes: number;
        uniqueDomains: number;
        topTopics: string[];
        averageSessionLength: number;
        peakBrowsingHour?: number | undefined;
    }>;
    sentimentBreakdown: z.ZodObject<{
        positiveCount: z.ZodNumber;
        neutralCount: z.ZodNumber;
        negativeCount: z.ZodNumber;
        positivePercentage: z.ZodNumber;
        neutralPercentage: z.ZodNumber;
        negativePercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        positiveCount: number;
        neutralCount: number;
        negativeCount: number;
        positivePercentage: number;
        neutralPercentage: number;
        negativePercentage: number;
    }, {
        positiveCount: number;
        neutralCount: number;
        negativeCount: number;
        positivePercentage: number;
        neutralPercentage: number;
        negativePercentage: number;
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    TTL: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    PK: string;
    SK: string;
    userId: string;
    date: string;
    wellbeingScores: {
        informationOverload: number;
        negativeContentBias: number;
        emotionalLoadScore: number;
        doomscrollIndex: number;
        cognitiveDiversityScore: number;
        mindfulnessGapScore: number;
    };
    sessionSummary: {
        totalSessions: number;
        totalTimeMinutes: number;
        uniqueDomains: number;
        topTopics: string[];
        averageSessionLength: number;
        peakBrowsingHour?: number | undefined;
    };
    sentimentBreakdown: {
        positiveCount: number;
        neutralCount: number;
        negativeCount: number;
        positivePercentage: number;
        neutralPercentage: number;
        negativePercentage: number;
    };
    createdAt: string;
    updatedAt: string;
    TTL?: number | undefined;
}, {
    PK: string;
    SK: string;
    userId: string;
    date: string;
    wellbeingScores: {
        informationOverload: number;
        negativeContentBias: number;
        emotionalLoadScore: number;
        doomscrollIndex: number;
        cognitiveDiversityScore: number;
        mindfulnessGapScore: number;
    };
    sessionSummary: {
        totalSessions: number;
        totalTimeMinutes: number;
        uniqueDomains: number;
        topTopics: string[];
        averageSessionLength: number;
        peakBrowsingHour?: number | undefined;
    };
    sentimentBreakdown: {
        positiveCount: number;
        neutralCount: number;
        negativeCount: number;
        positivePercentage: number;
        neutralPercentage: number;
        negativePercentage: number;
    };
    createdAt: string;
    updatedAt: string;
    TTL?: number | undefined;
}>;
export type DailyMetrics = z.infer<typeof DailyMetricsSchema>;
export declare const WellbeingBaselineSchema: z.ZodObject<{
    averageSessionLength: z.ZodNumber;
    typicalBrowsingHours: z.ZodArray<z.ZodNumber, "many">;
    preferredTopics: z.ZodArray<z.ZodString, "many">;
    baselineScores: z.ZodObject<{
        informationOverload: z.ZodNumber;
        negativeContentBias: z.ZodNumber;
        emotionalLoadScore: z.ZodNumber;
        doomscrollIndex: z.ZodNumber;
        cognitiveDiversityScore: z.ZodNumber;
        mindfulnessGapScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        informationOverload: number;
        negativeContentBias: number;
        emotionalLoadScore: number;
        doomscrollIndex: number;
        cognitiveDiversityScore: number;
        mindfulnessGapScore: number;
    }, {
        informationOverload: number;
        negativeContentBias: number;
        emotionalLoadScore: number;
        doomscrollIndex: number;
        cognitiveDiversityScore: number;
        mindfulnessGapScore: number;
    }>;
    calculatedAt: z.ZodString;
    sampleSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    averageSessionLength: number;
    typicalBrowsingHours: number[];
    preferredTopics: string[];
    baselineScores: {
        informationOverload: number;
        negativeContentBias: number;
        emotionalLoadScore: number;
        doomscrollIndex: number;
        cognitiveDiversityScore: number;
        mindfulnessGapScore: number;
    };
    calculatedAt: string;
    sampleSize: number;
}, {
    averageSessionLength: number;
    typicalBrowsingHours: number[];
    preferredTopics: string[];
    baselineScores: {
        informationOverload: number;
        negativeContentBias: number;
        emotionalLoadScore: number;
        doomscrollIndex: number;
        cognitiveDiversityScore: number;
        mindfulnessGapScore: number;
    };
    calculatedAt: string;
    sampleSize: number;
}>;
export type WellbeingBaseline = z.infer<typeof WellbeingBaselineSchema>;
export declare const TrendDataSchema: z.ZodObject<{
    date: z.ZodString;
    value: z.ZodNumber;
    change: z.ZodOptional<z.ZodNumber>;
    trend: z.ZodOptional<z.ZodEnum<["improving", "stable", "declining"]>>;
}, "strip", z.ZodTypeAny, {
    value: number;
    date: string;
    change?: number | undefined;
    trend?: "improving" | "stable" | "declining" | undefined;
}, {
    value: number;
    date: string;
    change?: number | undefined;
    trend?: "improving" | "stable" | "declining" | undefined;
}>;
export type TrendData = z.infer<typeof TrendDataSchema>;
export declare const TimeSeriesDataSchema: z.ZodObject<{
    metricName: z.ZodString;
    data: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["improving", "stable", "declining"]>>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        date: string;
        change?: number | undefined;
        trend?: "improving" | "stable" | "declining" | undefined;
    }, {
        value: number;
        date: string;
        change?: number | undefined;
        trend?: "improving" | "stable" | "declining" | undefined;
    }>, "many">;
    period: z.ZodEnum<["daily", "weekly", "monthly"]>;
    startDate: z.ZodString;
    endDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    metricName: string;
    data: {
        value: number;
        date: string;
        change?: number | undefined;
        trend?: "improving" | "stable" | "declining" | undefined;
    }[];
    period: "daily" | "weekly" | "monthly";
    startDate: string;
    endDate: string;
}, {
    metricName: string;
    data: {
        value: number;
        date: string;
        change?: number | undefined;
        trend?: "improving" | "stable" | "declining" | undefined;
    }[];
    period: "daily" | "weekly" | "monthly";
    startDate: string;
    endDate: string;
}>;
export type TimeSeriesData = z.infer<typeof TimeSeriesDataSchema>;
//# sourceMappingURL=wellbeing-metrics.d.ts.map