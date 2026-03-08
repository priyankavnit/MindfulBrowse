import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { processEvent } from './handlers/process-event';
import { getInsights } from './handlers/get-insights';
import { logger } from './utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Received request', {
    method: event.httpMethod,
    path: event.path,
  });

  try {
    // Extract userId from Cognito authorizer context
    const userId =
      event.requestContext.authorizer?.claims?.sub ||
      event.requestContext.authorizer?.claims?.['cognito:username'];

    if (!userId) {
      logger.error('No userId found in request context');
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
      return await processEvent(event, userId);
    } else if (event.httpMethod === 'GET' && event.path === '/insights') {
      return await getInsights(event, userId);
    } else {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Not found' }),
      };
    }
  } catch (error) {
    logger.error('Unhandled error', { error });
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
