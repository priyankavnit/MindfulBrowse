import { StoredEvent } from '@mindful-browse/shared';

const SESSION_GAP_MS = 300000; // 5 minutes
const MIN_DOOMSCROLL_DURATION = 720; // 12 minutes in seconds
const HIGH_SCROLL_VELOCITY_THRESHOLD = 700; // pixels per second
const HIGH_SCROLL_COUNT_THRESHOLD = 30; // per event
const DOMAIN_REPETITION_RATIO_THRESHOLD = 0.7; // 70%
const DOOMSCROLL_CATEGORIES = ['social', 'news', 'entertainment'];

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

  // Must be at least 12 minutes (720 seconds)
  if (totalDuration < MIN_DOOMSCROLL_DURATION) {
    return false;
  }

  // Check behavioral signals (scroll activity)
  const hasHighScrollActivity = checkHighScrollActivity(session);
  if (!hasHighScrollActivity) {
    return false;
  }

  // Check category OR domain repetition
  const hasDoomscrollCategory = checkDoomscrollCategory(session);
  const hasDomainRepetition = checkDomainRepetition(session);

  // Doomscroll detected if: duration >= 12min AND high scroll activity AND (doomscroll category OR domain repetition)
  return hasDoomscrollCategory || hasDomainRepetition;
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

  // High scroll activity indicators (any one triggers):
  // - Average scroll velocity >= 700 pixels/second (rapid scanning)
  // - OR average scroll count >= 30 per event (frequent scrolling)
  return (
    avgVelocity >= HIGH_SCROLL_VELOCITY_THRESHOLD ||
    avgScrollCount >= HIGH_SCROLL_COUNT_THRESHOLD
  );
}

export function checkDoomscrollCategory(session: StoredEvent[]): boolean {
  if (session.length === 0) {
    return false;
  }

  // Check if majority of events are in doomscroll categories (social, news, entertainment)
  const doomscrollCategoryEvents = session.filter((e) =>
    DOOMSCROLL_CATEGORIES.includes(e.category)
  );

  // At least 50% of events should be in doomscroll categories
  return doomscrollCategoryEvents.length >= session.length * 0.5;
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

  // Domain repetition is high when >= 70% of events from same domain
  return dominantRatio >= DOMAIN_REPETITION_RATIO_THRESHOLD;
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
