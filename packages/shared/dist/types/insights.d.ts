/**
 * Insights response returned to the dashboard
 */
export interface InsightsResponse {
    total_time_seconds: number;
    sentiment_distribution: {
        positive: number;
        neutral: number;
        negative: number;
    };
    category_distribution: {
        news: number;
        social: number;
        entertainment: number;
        education: number;
        other: number;
    };
    doomscroll_sessions: number;
}
//# sourceMappingURL=insights.d.ts.map