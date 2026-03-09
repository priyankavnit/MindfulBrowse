"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsights = getInsights;
const dynamodb_1 = require("../services/dynamodb");
const logger_1 = require("../utils/logger");
const INSIGHTS_WINDOW_MS = 86400000; // 24 hours
async function getInsights(event, userId) {
    try {
        logger_1.logger.info('Retrieving insights for user', { userId });
        // Query events from past 24 hours
        const now = Date.now();
        const startTimestamp = now - INSIGHTS_WINDOW_MS;
        const events = await (0, dynamodb_1.queryEvents)(userId, startTimestamp, now);
        logger_1.logger.info('Retrieved events for insights', {
            userId,
            eventCount: events.length,
        });
        // Calculate insights
        const insights = calculateInsights(events);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(insights),
        };
    }
    catch (error) {
        logger_1.logger.error('Error retrieving insights', { error, userId });
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
function calculateInsights(events) {
    if (events.length === 0) {
        return {
            total_time_seconds: 0,
            sentiment_distribution: {
                positive: 0,
                neutral: 0,
                negative: 0,
            },
            category_distribution: {
                news: 0,
                social: 0,
                entertainment: 0,
                education: 0,
                other: 0,
            },
            doomscroll_sessions: 0,
        };
    }
    // Calculate total time
    const total_time_seconds = events.reduce((sum, event) => sum + event.duration_seconds, 0);
    // Calculate sentiment distribution
    const sentimentCounts = {
        positive: 0,
        neutral: 0,
        negative: 0,
    };
    for (const event of events) {
        if (event.sentiment in sentimentCounts) {
            sentimentCounts[event.sentiment]++;
        }
    }
    const sentiment_distribution = {
        positive: sentimentCounts.positive / events.length,
        neutral: sentimentCounts.neutral / events.length,
        negative: sentimentCounts.negative / events.length,
    };
    // Calculate category distribution
    const categoryCounts = {
        news: 0,
        social: 0,
        entertainment: 0,
        education: 0,
        other: 0,
    };
    for (const event of events) {
        if (event.category in categoryCounts) {
            categoryCounts[event.category]++;
        }
    }
    const category_distribution = {
        news: categoryCounts.news / events.length,
        social: categoryCounts.social / events.length,
        entertainment: categoryCounts.entertainment / events.length,
        education: categoryCounts.education / events.length,
        other: categoryCounts.other / events.length,
    };
    // Count doomscroll sessions
    const doomscroll_sessions = countDoomscrollSessions(events);
    return {
        total_time_seconds,
        sentiment_distribution,
        category_distribution,
        doomscroll_sessions,
    };
}
function countDoomscrollSessions(events) {
    // Group events by session (5-minute gaps)
    const SESSION_GAP_MS = 300000;
    const sessions = [];
    let currentSession = [];
    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
    for (const event of sortedEvents) {
        if (currentSession.length === 0) {
            currentSession.push(event);
        }
        else {
            const lastEvent = currentSession[currentSession.length - 1];
            const timeDiff = event.timestamp - lastEvent.timestamp;
            if (timeDiff < SESSION_GAP_MS) {
                currentSession.push(event);
            }
            else {
                sessions.push(currentSession);
                currentSession = [event];
            }
        }
    }
    if (currentSession.length > 0) {
        sessions.push(currentSession);
    }
    // Count sessions with at least one doomscroll event
    let doomscrollCount = 0;
    for (const session of sessions) {
        if (session.some((event) => event.doomscroll_flag)) {
            doomscrollCount++;
        }
    }
    return doomscrollCount;
}
//# sourceMappingURL=get-insights.js.map