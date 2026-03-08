/**
 * Browsing event captured by the browser extension and sent to the API
 */
export interface BrowsingEvent {
    domain: string;
    title: string;
    timestamp: number;
    duration_seconds: number;
    scroll_count: number;
    avg_scroll_velocity: number;
}
/**
 * Scroll metrics tracked by the browser extension
 */
export interface ScrollMetrics {
    totalPixelsScrolled: number;
    scrollEventCount: number;
    startTime: number;
    lastScrollTime: number;
}
/**
 * Event queue interface for offline storage
 */
export interface EventQueue {
    enqueue(event: BrowsingEvent): void;
    dequeue(): BrowsingEvent | null;
    size(): number;
    flush(): Promise<void>;
}
//# sourceMappingURL=browsing-event.d.ts.map