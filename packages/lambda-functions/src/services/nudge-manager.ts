import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { logger } from '../utils/logger';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME || 'MindfulBrowse';

const MAX_NUDGES_PER_DAY = 3;
const MIN_NUDGE_INTERVAL_MS = 300000; // 5 minutes (for testing)

interface UserProfile {
  PK: string;
  SK: string;
  userId: string;
  nudge_count_today: number;
  last_nudge_timestamp: number;
  nudge_reset_date: string; // YYYY-MM-DD (UTC)
}

export async function checkNudgeEligibility(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      // No profile exists, user is eligible
      return true;
    }

    // Check if we need to reset the daily counter (new day)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (profile.nudge_reset_date !== today) {
      // New day, reset counter
      await resetNudgeCounter(userId, today);
      return true;
    }

    // Check daily limit
    if (profile.nudge_count_today >= MAX_NUDGES_PER_DAY) {
      logger.info('Nudge limit reached for user', { userId });
      return false;
    }

    // Check time interval
    const now = Date.now();
    const timeSinceLastNudge = now - profile.last_nudge_timestamp;
    if (timeSinceLastNudge < MIN_NUDGE_INTERVAL_MS) {
      logger.info('Nudge interval not met for user', { userId, timeSinceLastNudge });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error checking nudge eligibility', { error, userId });
    // Default to not eligible on error
    return false;
  }
}

export async function updateNudgeCounter(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const now = Date.now();

  try {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE#metadata',
      },
      UpdateExpression:
        'SET nudge_count_today = if_not_exists(nudge_count_today, :zero) + :inc, last_nudge_timestamp = :timestamp, nudge_reset_date = :date, userId = :userId',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':inc': 1,
        ':timestamp': now,
        ':date': today,
        ':userId': userId,
      },
    });

    await dynamoClient.send(command);
    logger.info('Updated nudge counter', { userId, today });
  } catch (error) {
    logger.error('Error updating nudge counter', { error, userId });
    throw error;
  }
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE#metadata',
      },
    });

    const response = await dynamoClient.send(command);
    return response.Item as UserProfile | null;
  } catch (error) {
    logger.error('Error getting user profile', { error, userId });
    return null;
  }
}

async function resetNudgeCounter(userId: string, today: string): Promise<void> {
  try {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE#metadata',
      },
      UpdateExpression:
        'SET nudge_count_today = :zero, nudge_reset_date = :date, userId = :userId',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':date': today,
        ':userId': userId,
      },
    });

    await dynamoClient.send(command);
    logger.info('Reset nudge counter for new day', { userId, today });
  } catch (error) {
    logger.error('Error resetting nudge counter', { error, userId });
    throw error;
  }
}
