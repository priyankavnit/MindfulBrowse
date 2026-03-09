"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const process_event_1 = require("./handlers/process-event");
const get_insights_1 = require("./handlers/get-insights");
const logger_1 = require("./utils/logger");
const handler = async (event) => {
    logger_1.logger.info('Received request', {
        method: event.httpMethod,
        path: event.path,
    });
    try {
        // Extract userId from Cognito authorizer context
        const userId = event.requestContext.authorizer?.claims?.sub ||
            event.requestContext.authorizer?.claims?.['cognito:username'];
        if (!userId) {
            logger_1.logger.error('No userId found in request context');
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        }
        // Route based on HTTP method and path
        if (event.httpMethod === 'POST' && event.path === '/events') {
            return await (0, process_event_1.processEvent)(event, userId);
        }
        else if (event.httpMethod === 'GET' && event.path === '/insights') {
            return await (0, get_insights_1.getInsights)(event, userId);
        }
        else {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Not found' }),
            };
        }
    }
    catch (error) {
        logger_1.logger.error('Unhandled error', { error });
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map