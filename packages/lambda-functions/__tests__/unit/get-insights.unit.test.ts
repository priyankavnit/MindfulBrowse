import { StoredEvent, InsightsResponse } from '@mindful-browse/shared';

// Mock the getInsights handler module
jest.mock('../../src/services/dynamodb');
jest.mock('../../src/utils/logger');

// Import after mocking
import { getInsights } from '../../src/handlers/get-insights';
import { queryEvents } from '../../src/services/dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

const mockQueryEvents = queryEvents as jest.MockedFunction<typeof queryEvents>;

describe('calculateInsights', () => {
  // Helper function to test insights calculation through the handler
  const calculateInsightsViaHandler = async (events: StoredEvent[]): Promise<InsightsResponse> => {
    mockQueryEvents.mockResolvedValue(events);

    const mockEvent = {
      httpMethod: 'GET',
      path: '/insights',
      headers: {},
      body: null,
    } as APIGatewayProxyEvent;

    const result = await getInsights(mockEvent, 'test-user');
    return JSON.parse(result.body);
  };

  function createMockEvent(overrides: Partial<StoredEvent> = {}): StoredEvent {
    return {
      PK: 'USER#test-user',
      SK: `EVENT#${Date.now()}`,
      userId: 'test-user',
      timestamp: Date.now(),
      domain: 'example.com',
      title: 'Example Page',
      duration_seconds: 60,
      scroll_count: 10,
      avg_scroll_velocity: 100,
      sentiment: 'neutral',
      category: 'other',
      doomscroll_flag: false,
      ...overrides,
    };
  }

  it('should return zeros for empty events array', async () => {
    const result = await calculateInsightsViaHandler([]);

    expect(result.total_time_seconds).toBe(0);
    expect(result.sentiment_distribution.positive).toBe(0);
    expect(result.sentiment_distribution.neutral).toBe(0);
    expect(result.sentiment_distribution.negative).toBe(0);
    expect(result.category_distribution.news).toBe(0);
    expect(result.doomscroll_sessions).toBe(0);
  });

  it('should calculate total time correctly', async () => {
    const events = [
      createMockEvent({ duration_seconds: 100 }),
      createMockEvent({ duration_seconds: 200 }),
      createMockEvent({ duration_seconds: 300 }),
    ];

    const result = await calculateInsightsViaHandler(events);

    expect(result.total_time_seconds).toBe(600);
  });

  it('should calculate sentiment distribution correctly', async () => {
    const events = [
      createMockEvent({ sentiment: 'positive' }),
      createMockEvent({ sentiment: 'positive' }),
      createMockEvent({ sentiment: 'neutral' }),
      createMockEvent({ sentiment: 'negative' }),
    ];

    const result = await calculateInsightsViaHandler(events);

    expect(result.sentiment_distribution.positive).toBe(0.5);
    expect(result.sentiment_distribution.neutral).toBe(0.25);
    expect(result.sentiment_distribution.negative).toBe(0.25);
  });

  it('should calculate category distribution correctly', async () => {
    const events = [
      createMockEvent({ category: 'news' }),
      createMockEvent({ category: 'news' }),
      createMockEvent({ category: 'social' }),
      createMockEvent({ category: 'entertainment' }),
    ];

    const result = await calculateInsightsViaHandler(events);

    expect(result.category_distribution.news).toBe(0.5);
    expect(result.category_distribution.social).toBe(0.25);
    expect(result.category_distribution.entertainment).toBe(0.25);
    expect(result.category_distribution.education).toBe(0);
    expect(result.category_distribution.other).toBe(0);
  });

  it('should ensure percentages sum to 1.0', async () => {
    const events = [
      createMockEvent({ sentiment: 'positive', category: 'news' }),
      createMockEvent({ sentiment: 'neutral', category: 'social' }),
      createMockEvent({ sentiment: 'negative', category: 'entertainment' }),
    ];

    const result = await calculateInsightsViaHandler(events);

    const sentimentSum =
      result.sentiment_distribution.positive +
      result.sentiment_distribution.neutral +
      result.sentiment_distribution.negative;

    const categorySum =
      result.category_distribution.news +
      result.category_distribution.social +
      result.category_distribution.entertainment +
      result.category_distribution.education +
      result.category_distribution.other;

    expect(sentimentSum).toBeCloseTo(1.0);
    expect(categorySum).toBeCloseTo(1.0);
  });

  it('should count doomscroll sessions correctly', async () => {
    const baseTime = Date.now();
    const events = [
      createMockEvent({ timestamp: baseTime, doomscroll_flag: true }),
      createMockEvent({ timestamp: baseTime + 60000, doomscroll_flag: true }), // 1 min later
      createMockEvent({ timestamp: baseTime + 400000, doomscroll_flag: false }), // 6.6 min later (new session)
      createMockEvent({ timestamp: baseTime + 450000, doomscroll_flag: true }), // 7.5 min later
    ];

    const result = await calculateInsightsViaHandler(events);

    // Should have 2 sessions: first session has doomscroll, second session has doomscroll
    expect(result.doomscroll_sessions).toBe(2);
  });

  it('should not count sessions without doomscroll flag', async () => {
    const baseTime = Date.now();
    const events = [
      createMockEvent({ timestamp: baseTime, doomscroll_flag: false }),
      createMockEvent({ timestamp: baseTime + 60000, doomscroll_flag: false }),
    ];

    const result = await calculateInsightsViaHandler(events);

    expect(result.doomscroll_sessions).toBe(0);
  });
});
