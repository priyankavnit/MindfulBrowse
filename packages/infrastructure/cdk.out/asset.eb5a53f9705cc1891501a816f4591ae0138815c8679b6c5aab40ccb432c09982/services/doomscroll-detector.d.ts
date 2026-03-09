import { StoredEvent } from '@mindful-browse/shared';
export declare function groupIntoSessions(events: StoredEvent[]): StoredEvent[][];
export declare function isDoomscrollSession(session: StoredEvent[]): boolean;
export declare function checkHighScrollActivity(session: StoredEvent[]): boolean;
export declare function checkDoomscrollCategory(session: StoredEvent[]): boolean;
export declare function checkDomainRepetition(session: StoredEvent[]): boolean;
export declare function detectDoomscroll(recentEvents: StoredEvent[], currentEvent: StoredEvent): Promise<boolean>;
//# sourceMappingURL=doomscroll-detector.d.ts.map