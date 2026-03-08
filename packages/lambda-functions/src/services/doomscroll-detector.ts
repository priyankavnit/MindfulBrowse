import { StoredEvent } from '@mindful-browse/shared';

const SESSION_GAP_MS = 300000; // 5 minutes
const MIN_DOOMSCROLL_DURATION = 900; // 15 minutes in seconds
const NEGATIVE_RATIO_THRESHOLD = 0.6;
const NEWS_RATIO_THRESHOLD = 0.5;
const HIGH_SCROLL_VELOCITY_THRESHOLD = 500; // pixels per second
const HIGH_SCROLL_COUNT_THRESHOLD = 20; // per event
const DOMAIN_REPETITION_RATIO_THRESHOLD = 0.7;
const DOMAIN_REPETITION_COUNT_THRESHOLD = 10;

export function groupIntoSessions(events: StoredEvent[]): StoredEvent[][] {
  if (events.length === 0) {
    return [];
  }

  const sessions: StoredEvent[][] = [];
  let currentSession: StoredEvent[] = [events[0]];

  for (let i = 1; i < events.length; i++) {
    const lastEvent = currentSession[currentSession.length - 1];
    const timeDiff = events[i].timestamp - lastEvent.timestamp;

    if (timeDiff < SESSION_GAP_MS) {
      currentSession.push(events[i]);
    } else {
      sessions.push(currentSession);
      currentSession = [events[i]];
    }
  }

  if (currentSession.length > 0) {
    sessions.push(currentSession);
  }

  return sessions;
}

export function isDoomscrollSession(session: StoredEvent[]): boolean {
  if (session.length === 0) {
    return false;
  }

  // Calculate total duration
  const totalDuration = session.reduce(
    (sum, event) => sum + event.duration_seconds,
    0
  );

  // Must exceed 15 minutes (900 seconds)
  if (totalDuration <= MIN_DOOMSCROLL_DURATION) {
    return false;
  }

  // Calculate negative content ratio
  const negativeEvents = session.filter((e) => e.sentiment === 'negative');
  const negativeRatio = negativeEvents.length / session.length;

  // Must exceed 60% negative content
  if (negativeRatio <= NEGATIVE_RATIO_THRESHOLD) {
    return false;
  }

  // Must be primarily news content
  const newsEvents = session.filter((e) => e.category === 'news');
  const newsRatio = newsEvents.length / session.length;

  // Majority must be news
  if (newsRatio <= NEWS_RATIO_THRESHOLD) {
    return false;
  }

  // Check behavioral signals
  const hasHighScrollActivity = checkHighScrollActivity(session);
  const hasDomainRepetition = checkDomainRepetition(session);

  // Doomscroll detected if sentiment/category criteria met AND (high scroll activity OR domain repetition)
  return hasHighScrollActivity || hasDomainRepetition;
}

export function checkHighScrollActivity(session: StoredEvent[]): boolean {
  if (session.length === 0) {
    return false;
  }

  // Calculate average scroll velocity across session
  const totalVelocity = session.reduce(
    (sum, e) => sum + e.avg_scroll_velocity,
    0
  );
  const avgVelocity = totalVelocity / session.length;

  // Calculate average scroll count per event
  const totalScrolls = session.reduce((sum, e) => sum + e.scroll_count, 0);
  const avgScrollCount = totalScrolls / session.length;

  // High scroll activity indicators:
  // - Average scroll velocity > 500 pixels/second (rapid scanning)
  // - OR average scroll count > 20 per event (infinite scrolling)
  return (
    avgVelocity > HIGH_SCROLL_VELOCITY_THRESHOLD ||
    avgScrollCount > HIGH_SCROLL_COUNT_THRESHOLD
  );
}

export function checkDomainRepetition(session: StoredEvent[]): boolean {
  if (session.length === 0) {
    return false;
  }

  // Count occurrences of each domain
  const domainFrequency: Record<string, number> = {};

  for (const event of session) {
    domainFrequency[event.domain] = (domainFrequency[event.domain] || 0) + 1;
  }

  // Find the most frequent domain
  let maxCount = 0;
  for (const count of Object.values(domainFrequency)) {
    if (count > maxCount) {
      maxCount = count;
    }
  }

  // Calculate dominant domain ratio
  const dominantRatio = maxCount / session.length;

  // Domain repetition is high when:
  // - More than 70% of events from same domain
  // - OR more than 10 events from same domain
  return (
    dominantRatio > DOMAIN_REPETITION_RATIO_THRESHOLD ||
    maxCount > DOMAIN_REPETITION_COUNT_THRESHOLD
  );
}

export async function detectDoomscroll(
  recentEvents: StoredEvent[],
  currentEvent: StoredEvent
): Promise<boolean> {
  // Add current event to recent events
  const allEvents = [...recentEvents, currentEvent];

  // Sort by timestamp
  allEvents.sort((a, b) => a.timestamp - b.timestamp);

  // Group into sessions
  const sessions = groupIntoSessions(allEvents);

  if (sessions.length === 0) {
    return false;
  }

  // Check if current event's session is doomscroll
  const currentSession = sessions[sessions.length - 1];
  return isDoomscrollSession(currentSession);
}
