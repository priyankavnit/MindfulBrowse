"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEvent = processEvent;
const validation_1 = require("../utils/validation");
const bedrock_1 = require("../services/bedrock");
const doomscroll_detector_1 = require("../services/doomscroll-detector");
const nudge_manager_1 = require("../services/nudge-manager");
const dynamodb_1 = require("../services/dynamodb");
const logger_1 = require("../utils/logger");
const SHORT_DURATION_THRESHOLD = 5; // seconds
const RECENT_EVENTS_WINDOW_MS = 1800000; // 30 minutes
async function processEvent(event, userId) {
    try {
        // Parse and validate input
        const body = JSON.parse(event.body || '{}');
        const browsingEvent = (0, validation_1.validateBrowsingEvent)(body);
        logger_1.logger.info('Processing browsing event', {
            userId,
            domain: browsingEvent.domain,
            duration: browsingEvent.duration_seconds,
        });
        // Check short duration safeguard
        let sentiment;
        let category;
        if (browsingEvent.duration_seconds < SHORT_DURATION_THRESHOLD) {
            // Skip Bedrock for short events
            sentiment = 'neutral';
            category = 'other';
            logger_1.logger.info('Skipping Bedrock classification for short duration event', {
                userId,
                duration: browsingEvent.duration_seconds,
            });
        }
        else {
            // Classify content with Bedrock
            const classification = await (0, bedrock_1.classifyContent)(browsingEvent.domain, browsingEvent.title);
            sentiment = classification.sentiment;
            category = classification.category;
        }
        // Create stored event (without doomscroll_flag yet)
        const storedEvent = {
            PK: `USER#${userId}`,
            SK: `EVENT#${browsingEvent.timestamp}`,
            userId,
            timestamp: browsingEvent.timestamp,
            domain: browsingEvent.domain,
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
        const recentEvents = await (0, dynamodb_1.queryEvents)(userId, recentEventsStart);
        // Detect doomscroll
        const isDoomscroll = await (0, doomscroll_detector_1.detectDoomscroll)(recentEvents, storedEvent);
        storedEvent.doomscroll_flag = isDoomscroll;
        logger_1.logger.info('Doomscroll detection result', {
            userId,
            isDoomscroll,
            recentEventsCount: recentEvents.length,
        });
        // Generate nudge if doomscroll detected
        let nudge;
        if (isDoomscroll) {
            // Check nudge eligibility
            const isEligible = await (0, nudge_manager_1.checkNudgeEligibility)(userId);
            if (isEligible) {
                // Calculate session duration in minutes
                const sessionDuration = Math.round(recentEvents.reduce((sum, e) => sum + e.duration_seconds, 0) / 60);
                // Generate reflection prompt
                nudge = await (0, bedrock_1.generateReflectionPrompt)(sessionDuration);
                // Update nudge counter
                await (0, nudge_manager_1.updateNudgeCounter)(userId);
                logger_1.logger.info('Nudge generated for user', {
                    userId,
                    sessionDuration,
                });
            }
            else {
                logger_1.logger.info('User not eligible for nudge', { userId });
            }
        }
        // Store event in DynamoDB
        await (0, dynamodb_1.storeEvent)(storedEvent);
        // Return response
        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: nudge ? JSON.stringify({ nudge }) : '',
        };
        return response;
    }
    catch (error) {
        logger_1.logger.error('Error processing event', { error, userId });
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
//# sourceMappingURL=process-event.js.map