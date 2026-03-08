import { z } from 'zod';
export declare const PrivacySettingsSchema: z.ZodObject<{
    dataRetentionDays: z.ZodDefault<z.ZodNumber>;
    enableBackups: z.ZodDefault<z.ZodBoolean>;
    insightFrequency: z.ZodDefault<z.ZodEnum<["daily", "weekly", "never"]>>;
    privacyLevel: z.ZodDefault<z.ZodEnum<["minimal", "standard", "detailed"]>>;
    allowAnalytics: z.ZodDefault<z.ZodBoolean>;
    shareAggregatedData: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dataRetentionDays: number;
    enableBackups: boolean;
    insightFrequency: "never" | "daily" | "weekly";
    privacyLevel: "minimal" | "standard" | "detailed";
    allowAnalytics: boolean;
    shareAggregatedData: boolean;
}, {
    dataRetentionDays?: number | undefined;
    enableBackups?: boolean | undefined;
    insightFrequency?: "never" | "daily" | "weekly" | undefined;
    privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
    allowAnalytics?: boolean | undefined;
    shareAggregatedData?: boolean | undefined;
}>;
export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;
export declare const UserPreferencesSchema: z.ZodObject<{
    timezone: z.ZodDefault<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
    notifications: z.ZodDefault<z.ZodObject<{
        dailyInsights: z.ZodDefault<z.ZodBoolean>;
        weeklyReports: z.ZodDefault<z.ZodBoolean>;
        wellbeingAlerts: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        dailyInsights: boolean;
        weeklyReports: boolean;
        wellbeingAlerts: boolean;
    }, {
        dailyInsights?: boolean | undefined;
        weeklyReports?: boolean | undefined;
        wellbeingAlerts?: boolean | undefined;
    }>>;
    dashboard: z.ZodDefault<z.ZodObject<{
        defaultTimeRange: z.ZodDefault<z.ZodEnum<["7d", "30d", "90d"]>>;
        showTrends: z.ZodDefault<z.ZodBoolean>;
        showComparisons: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        defaultTimeRange: "7d" | "30d" | "90d";
        showTrends: boolean;
        showComparisons: boolean;
    }, {
        defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
        showTrends?: boolean | undefined;
        showComparisons?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    timezone: string;
    language: string;
    theme: "light" | "dark" | "auto";
    notifications: {
        dailyInsights: boolean;
        weeklyReports: boolean;
        wellbeingAlerts: boolean;
    };
    dashboard: {
        defaultTimeRange: "7d" | "30d" | "90d";
        showTrends: boolean;
        showComparisons: boolean;
    };
}, {
    timezone?: string | undefined;
    language?: string | undefined;
    theme?: "light" | "dark" | "auto" | undefined;
    notifications?: {
        dailyInsights?: boolean | undefined;
        weeklyReports?: boolean | undefined;
        wellbeingAlerts?: boolean | undefined;
    } | undefined;
    dashboard?: {
        defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
        showTrends?: boolean | undefined;
        showComparisons?: boolean | undefined;
    } | undefined;
}>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export declare const UserProfileSchema: z.ZodObject<{
    PK: z.ZodString;
    SK: z.ZodLiteral<"PROFILE">;
    userId: z.ZodString;
    email: z.ZodString;
    preferences: z.ZodDefault<z.ZodObject<{
        timezone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
        notifications: z.ZodDefault<z.ZodObject<{
            dailyInsights: z.ZodDefault<z.ZodBoolean>;
            weeklyReports: z.ZodDefault<z.ZodBoolean>;
            wellbeingAlerts: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        }, {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        }>>;
        dashboard: z.ZodDefault<z.ZodObject<{
            defaultTimeRange: z.ZodDefault<z.ZodEnum<["7d", "30d", "90d"]>>;
            showTrends: z.ZodDefault<z.ZodBoolean>;
            showComparisons: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        }, {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        language: string;
        theme: "light" | "dark" | "auto";
        notifications: {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        };
        dashboard: {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        };
    }, {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        } | undefined;
        dashboard?: {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        } | undefined;
    }>>;
    privacySettings: z.ZodDefault<z.ZodObject<{
        dataRetentionDays: z.ZodDefault<z.ZodNumber>;
        enableBackups: z.ZodDefault<z.ZodBoolean>;
        insightFrequency: z.ZodDefault<z.ZodEnum<["daily", "weekly", "never"]>>;
        privacyLevel: z.ZodDefault<z.ZodEnum<["minimal", "standard", "detailed"]>>;
        allowAnalytics: z.ZodDefault<z.ZodBoolean>;
        shareAggregatedData: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        dataRetentionDays: number;
        enableBackups: boolean;
        insightFrequency: "never" | "daily" | "weekly";
        privacyLevel: "minimal" | "standard" | "detailed";
        allowAnalytics: boolean;
        shareAggregatedData: boolean;
    }, {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    }>>;
    baselineMetrics: z.ZodOptional<z.ZodObject<{
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
    }>>;
    onboardingCompleted: z.ZodDefault<z.ZodBoolean>;
    extensionInstalled: z.ZodDefault<z.ZodBoolean>;
    lastActiveAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    TTL: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    PK: string;
    SK: "PROFILE";
    userId: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    preferences: {
        timezone: string;
        language: string;
        theme: "light" | "dark" | "auto";
        notifications: {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        };
        dashboard: {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        };
    };
    privacySettings: {
        dataRetentionDays: number;
        enableBackups: boolean;
        insightFrequency: "never" | "daily" | "weekly";
        privacyLevel: "minimal" | "standard" | "detailed";
        allowAnalytics: boolean;
        shareAggregatedData: boolean;
    };
    onboardingCompleted: boolean;
    extensionInstalled: boolean;
    TTL?: number | undefined;
    baselineMetrics?: {
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
    } | undefined;
    lastActiveAt?: string | undefined;
}, {
    PK: string;
    SK: "PROFILE";
    userId: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    TTL?: number | undefined;
    preferences?: {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        } | undefined;
        dashboard?: {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        } | undefined;
    } | undefined;
    privacySettings?: {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    } | undefined;
    baselineMetrics?: {
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
    } | undefined;
    onboardingCompleted?: boolean | undefined;
    extensionInstalled?: boolean | undefined;
    lastActiveAt?: string | undefined;
}>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export declare const UserRegistrationSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    preferences: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        language: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        theme: z.ZodOptional<z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>>;
        notifications: z.ZodOptional<z.ZodDefault<z.ZodObject<{
            dailyInsights: z.ZodDefault<z.ZodBoolean>;
            weeklyReports: z.ZodDefault<z.ZodBoolean>;
            wellbeingAlerts: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        }, {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        }>>>;
        dashboard: z.ZodOptional<z.ZodDefault<z.ZodObject<{
            defaultTimeRange: z.ZodDefault<z.ZodEnum<["7d", "30d", "90d"]>>;
            showTrends: z.ZodDefault<z.ZodBoolean>;
            showComparisons: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        }, {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        } | undefined;
        dashboard?: {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        } | undefined;
    }, {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        } | undefined;
        dashboard?: {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        } | undefined;
    }>>;
    privacySettings: z.ZodOptional<z.ZodObject<{
        dataRetentionDays: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        enableBackups: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        insightFrequency: z.ZodOptional<z.ZodDefault<z.ZodEnum<["daily", "weekly", "never"]>>>;
        privacyLevel: z.ZodOptional<z.ZodDefault<z.ZodEnum<["minimal", "standard", "detailed"]>>>;
        allowAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        shareAggregatedData: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    }, {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    }>>;
    acceptedTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    acceptedPrivacyPolicy: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
    preferences?: {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        } | undefined;
        dashboard?: {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        } | undefined;
    } | undefined;
    privacySettings?: {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    } | undefined;
}, {
    email: string;
    password: string;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
    preferences?: {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        } | undefined;
        dashboard?: {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        } | undefined;
    } | undefined;
    privacySettings?: {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    } | undefined;
}>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export declare const UserUpdateSchema: z.ZodObject<{
    preferences: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        language: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        theme: z.ZodOptional<z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>>;
        notifications: z.ZodOptional<z.ZodDefault<z.ZodObject<{
            dailyInsights: z.ZodDefault<z.ZodBoolean>;
            weeklyReports: z.ZodDefault<z.ZodBoolean>;
            wellbeingAlerts: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        }, {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        }>>>;
        dashboard: z.ZodOptional<z.ZodDefault<z.ZodObject<{
            defaultTimeRange: z.ZodDefault<z.ZodEnum<["7d", "30d", "90d"]>>;
            showTrends: z.ZodDefault<z.ZodBoolean>;
            showComparisons: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        }, {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        } | undefined;
        dashboard?: {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        } | undefined;
    }, {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        } | undefined;
        dashboard?: {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        } | undefined;
    }>>;
    privacySettings: z.ZodOptional<z.ZodObject<{
        dataRetentionDays: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        enableBackups: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        insightFrequency: z.ZodOptional<z.ZodDefault<z.ZodEnum<["daily", "weekly", "never"]>>>;
        privacyLevel: z.ZodOptional<z.ZodDefault<z.ZodEnum<["minimal", "standard", "detailed"]>>>;
        allowAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        shareAggregatedData: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    }, {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    }>>;
    onboardingCompleted: z.ZodOptional<z.ZodBoolean>;
    extensionInstalled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    preferences?: {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights: boolean;
            weeklyReports: boolean;
            wellbeingAlerts: boolean;
        } | undefined;
        dashboard?: {
            defaultTimeRange: "7d" | "30d" | "90d";
            showTrends: boolean;
            showComparisons: boolean;
        } | undefined;
    } | undefined;
    privacySettings?: {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    } | undefined;
    onboardingCompleted?: boolean | undefined;
    extensionInstalled?: boolean | undefined;
}, {
    preferences?: {
        timezone?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        notifications?: {
            dailyInsights?: boolean | undefined;
            weeklyReports?: boolean | undefined;
            wellbeingAlerts?: boolean | undefined;
        } | undefined;
        dashboard?: {
            defaultTimeRange?: "7d" | "30d" | "90d" | undefined;
            showTrends?: boolean | undefined;
            showComparisons?: boolean | undefined;
        } | undefined;
    } | undefined;
    privacySettings?: {
        dataRetentionDays?: number | undefined;
        enableBackups?: boolean | undefined;
        insightFrequency?: "never" | "daily" | "weekly" | undefined;
        privacyLevel?: "minimal" | "standard" | "detailed" | undefined;
        allowAnalytics?: boolean | undefined;
        shareAggregatedData?: boolean | undefined;
    } | undefined;
    onboardingCompleted?: boolean | undefined;
    extensionInstalled?: boolean | undefined;
}>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export declare const AccountDeletionRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    reason: z.ZodOptional<z.ZodEnum<["privacy_concerns", "not_useful", "technical_issues", "switching_services", "other"]>>;
    feedback: z.ZodOptional<z.ZodString>;
    deleteImmediately: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    deleteImmediately: boolean;
    reason?: "other" | "privacy_concerns" | "not_useful" | "technical_issues" | "switching_services" | undefined;
    feedback?: string | undefined;
}, {
    userId: string;
    reason?: "other" | "privacy_concerns" | "not_useful" | "technical_issues" | "switching_services" | undefined;
    feedback?: string | undefined;
    deleteImmediately?: boolean | undefined;
}>;
export type AccountDeletionRequest = z.infer<typeof AccountDeletionRequestSchema>;
//# sourceMappingURL=user-profile.d.ts.map