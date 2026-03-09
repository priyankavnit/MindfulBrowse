import { StoredEvent } from '@mindful-browse/shared';
export declare function storeEvent(event: StoredEvent): Promise<void>;
export declare function queryEvents(userId: string, startTimestamp: number, endTimestamp?: number): Promise<StoredEvent[]>;
//# sourceMappingURL=dynamodb.d.ts.map