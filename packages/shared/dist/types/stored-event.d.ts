/**
 * Event stored in DynamoDB after processing
 */
export interface StoredEvent {
    PK: string;
    SK: string;
    userId: string;
    timestamp: number;
    domain: string;
    title: string;
    duration_seconds: number;
    scroll_count: number;
    avg_scroll_velocity: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    category: 'news' | 'social' | 'entertainment' | 'education' | 'other';
    doomscroll_flag: boolean;
}
/**
 * User profile for nudge tracking
 */
export interface UserProfile {
    PK: string;
    SK: string;
    userId: string;
    nudge_count_today: number;
    last_nudge_timestamp: number;
    nudge_reset_date: string;
}
//# sourceMappingURL=stored-event.d.ts.map