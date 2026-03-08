import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { StoredEvent } from '@mindful-browse/shared';
import { logger } from '../utils/logger';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME || 'MindfulBrowse';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 100;

export async function storeEvent(event: StoredEvent): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: event,
      });

      await dynamoClient.send(command);
      logger.info('Event stored successfully', {
        userId: event.userId,
        timestamp: event.timestamp,
      });
      return;
    } catch (error) {
      lastError = error as Error;
      logger.warn(`DynamoDB storage attempt ${attempt} failed`, {
        error,
        userId: event.userId,
        attempt,
      });

      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 100ms, 200ms, 400ms
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  logger.error('DynamoDB storage failed after all retries', {
    error: lastError,
    userId: event.userId,
    timestamp: event.timestamp,
  });
  throw lastError;
}

export async function queryEvents(
  userId: string,
  startTimestamp: number,
  endTimestamp?: number
): Promise<StoredEvent[]> {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: endTimestamp
        ? 'PK = :pk AND SK BETWEEN :startSk AND :endSk'
        : 'PK = :pk AND SK >= :startSk',
      ExpressionAttributeValues: endTimestamp
        ? {
            ':pk': `USER#${userId}`,
            ':startSk': `EVENT#${startTimestamp}`,
            ':endSk': `EVENT#${endTimestamp}`,
          }
        : {
            ':pk': `USER#${userId}`,
            ':startSk': `EVENT#${startTimestamp}`,
          },
    });

    const response = await dynamoClient.send(command);
    return (response.Items || []) as StoredEvent[];
  } catch (error) {
    logger.error('Error querying events from DynamoDB', { error, userId });
    throw error;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
