import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BrowsingEvent, StoredEvent } from '@mindful-browse/shared';
import { validateBrowsingEvent } from '../utils/validation';
import { classifyContent, generateReflectionPrompt, NudgeResponse } from '../services/bedrock';
import { detectDoomscroll } from '../services/doomscroll-detector';
import { checkNudgeEligibility, updateNudgeCounter } from '../services/nudge-manager';
import { storeEvent, queryEvents } from '../services/dynamodb';
import { logger } from '../utils/logger';

const SHORT_DURATION_THRESHOLD = 5; // seconds
const RECENT_EVENTS_WINDOW_MS = 1800000; // 30 minutes

export async function processEvent(
  event: APIGatewayProxyEvent,
  userId: string
): Promise<APIGatewayProxyResult> {
  try {
    // Parse and validate input
    const body = JSON.parse(event.body || '{}');
    const browsingEvent: BrowsingEvent = validateBrowsingEvent(body);

    logger.info('Processing browsing event', {
      userId,
      domain: browsingEvent.domain,
      duration: browsingEvent.duration_seconds,
    });

    // Check short duration safeguard
    let sentiment: 'positive' | 'neutral' | 'negative';
    let category: 'news' | 'social' | 'entertainment' | 'education' | 'other';

    if (browsingEvent.duration_seconds < SHORT_DURATION_THRESHOLD) {
      // Skip Bedrock for short events
      sentiment = 'neutral';
      category = 'other';
      logger.info('Skipping Bedrock classification for short duration event', {
        userId,
        duration: browsingEvent.duration_seconds,
      });
    } else {
      // Classify content with Bedrock
      const classification = await classifyContent(
        browsingEvent.domain,
        browsingEvent.title,
        browsingEvent.url
      );
      sentiment = classification.sentiment;
      category = classification.category;
    }

    // Create stored event (without doomscroll_flag yet)
    const storedEvent: StoredEvent = {
      PK: `USER#${userId}`,
      SK: `EVENT#${browsingEvent.timestamp}`,
      userId,
      timestamp: browsingEvent.timestamp,
      domain: browsingEvent.domain,
      url: browsingEvent.url || browsingEvent.domain, // Use URL if available, fallback to domain
      title: browsingEvent.title,
      duration_seconds: browsingEvent.duration_seconds,
      scroll_count: browsingEvent.scroll_count,
      avg_scroll_velocity: browsingEvent.avg_scroll_velocity,
      sentiment,
      category,
      doomscroll_flag: false, // Will be updated below
    };

    // Query recent events for doomscroll detection
    const recentEventsStart = Date.now() - RECENT_EVENTS_WINDOW_MS;
    const recentEvents = await queryEvents(userId, recentEventsStart);

    // Detect doomscroll
    const isDoomscroll = await detectDoomscroll(recentEvents, storedEvent);
    storedEvent.doomscroll_flag = isDoomscroll;

    logger.info('Doomscroll detection result', {
      userId,
      isDoomscroll,
      recentEventsCount: recentEvents.length,
    });

    // Generate nudge if doomscroll detected
    let nudge: NudgeResponse | undefined;

    if (isDoomscroll) {
      // Check nudge eligibility
      const isEligible = await checkNudgeEligibility(userId);

      if (isEligible) {
        // Calculate session duration in minutes (include current event)
        const sessionDuration = Math.round(
          (recentEvents.reduce((sum, e) => sum + e.duration_seconds, 0) + 
           storedEvent.duration_seconds) / 60
        );

        // Generate reflection prompt
        nudge = await generateReflectionPrompt(sessionDuration);

        // Update nudge counter
        await updateNudgeCounter(userId);

        logger.info('Nudge generated for user', {
          userId,
          sessionDuration,
        });
      } else {
        logger.info('User not eligible for nudge', { userId });
      }
    }

    // Store event in DynamoDB
    await storeEvent(storedEvent);

    // Return response
    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: nudge ? JSON.stringify({ nudge }) : '',
    };

    return response;
  } catch (error) {
    logger.error('Error processing event', { error, userId });

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
