"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNudgeEligibility = checkNudgeEligibility;
exports.updateNudgeCounter = updateNudgeCounter;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const logger_1 = require("../utils/logger");
const dynamoClient = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME || 'MindfulBrowse';
const MAX_NUDGES_PER_DAY = 3;
const MIN_NUDGE_INTERVAL_MS = 1800000; // 30 minutes
async function checkNudgeEligibility(userId) {
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
            logger_1.logger.info('Nudge limit reached for user', { userId });
            return false;
        }
        // Check time interval
        const now = Date.now();
        const timeSinceLastNudge = now - profile.last_nudge_timestamp;
        if (timeSinceLastNudge < MIN_NUDGE_INTERVAL_MS) {
            logger_1.logger.info('Nudge interval not met for user', { userId, timeSinceLastNudge });
            return false;
        }
        return true;
    }
    catch (error) {
        logger_1.logger.error('Error checking nudge eligibility', { error, userId });
        // Default to not eligible on error
        return false;
    }
}
async function updateNudgeCounter(userId) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const now = Date.now();
    try {
        const command = new lib_dynamodb_1.UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE#metadata',
            },
            UpdateExpression: 'SET nudge_count_today = if_not_exists(nudge_count_today, :zero) + :inc, last_nudge_timestamp = :timestamp, nudge_reset_date = :date, userId = :userId',
            ExpressionAttributeValues: {
                ':zero': 0,
                ':inc': 1,
                ':timestamp': now,
                ':date': today,
                ':userId': userId,
            },
        });
        await dynamoClient.send(command);
        logger_1.logger.info('Updated nudge counter', { userId, today });
    }
    catch (error) {
        logger_1.logger.error('Error updating nudge counter', { error, userId });
        throw error;
    }
}
async function getUserProfile(userId) {
    try {
        const command = new lib_dynamodb_1.GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE#metadata',
            },
        });
        const response = await dynamoClient.send(command);
        return response.Item;
    }
    catch (error) {
        logger_1.logger.error('Error getting user profile', { error, userId });
        return null;
    }
}
async function resetNudgeCounter(userId, today) {
    try {
        const command = new lib_dynamodb_1.UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE#metadata',
            },
            UpdateExpression: 'SET nudge_count_today = :zero, nudge_reset_date = :date, userId = :userId',
            ExpressionAttributeValues: {
                ':zero': 0,
                ':date': today,
                ':userId': userId,
            },
        });
        await dynamoClient.send(command);
        logger_1.logger.info('Reset nudge counter for new day', { userId, today });
    }
    catch (error) {
        logger_1.logger.error('Error resetting nudge counter', { error, userId });
        throw error;
    }
}
//# sourceMappingURL=nudge-manager.js.map