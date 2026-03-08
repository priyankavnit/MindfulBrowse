"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeEvent = storeEvent;
exports.queryEvents = queryEvents;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const logger_1 = require("../utils/logger");
const dynamoClient = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME || 'MindfulBrowse';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 100;
async function storeEvent(event) {
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const command = new lib_dynamodb_1.PutCommand({
                TableName: TABLE_NAME,
                Item: event,
            });
            await dynamoClient.send(command);
            logger_1.logger.info('Event stored successfully', {
                userId: event.userId,
                timestamp: event.timestamp,
            });
            return;
        }
        catch (error) {
            lastError = error;
            logger_1.logger.warn(`DynamoDB storage attempt ${attempt} failed`, {
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
    logger_1.logger.error('DynamoDB storage failed after all retries', {
        error: lastError,
        userId: event.userId,
        timestamp: event.timestamp,
    });
    throw lastError;
}
async function queryEvents(userId, startTimestamp, endTimestamp) {
    try {
        const command = new lib_dynamodb_1.QueryCommand({
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
        return (response.Items || []);
    }
    catch (error) {
        logger_1.logger.error('Error querying events from DynamoDB', { error, userId });
        throw error;
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=dynamodb.js.map