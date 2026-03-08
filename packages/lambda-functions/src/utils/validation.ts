import { BrowsingEvent } from '@mindful-browse/shared';

export function validateBrowsingEvent(event: any): BrowsingEvent {
  // Validate domain
  if (!event.domain || typeof event.domain !== 'string') {
    throw new Error('Invalid domain: must be a non-empty string');
  }
  if (event.domain.length > 253) {
    throw new Error('Invalid domain: exceeds maximum length of 253 characters');
  }

  // Validate title
  if (!event.title || typeof event.title !== 'string') {
    throw new Error('Invalid title: must be a non-empty string');
  }
  if (event.title.length > 500) {
    throw new Error('Invalid title: exceeds maximum length of 500 characters');
  }

  // Validate timestamp
  if (!event.timestamp || typeof event.timestamp !== 'number') {
    throw new Error('Invalid timestamp: must be a number');
  }
  if (event.timestamp < 0) {
    throw new Error('Invalid timestamp: must be positive');
  }
  if (event.timestamp > Date.now()) {
    throw new Error('Invalid timestamp: cannot be in the future');
  }

  // Validate duration_seconds
  if (event.duration_seconds === undefined || typeof event.duration_seconds !== 'number') {
    throw new Error('Invalid duration_seconds: must be a number');
  }
  if (event.duration_seconds < 0) {
    throw new Error('Invalid duration_seconds: must be non-negative');
  }
  if (event.duration_seconds > 86400) {
    throw new Error('Invalid duration_seconds: exceeds maximum of 86400 (24 hours)');
  }

  // Validate scroll_count
  if (event.scroll_count === undefined || typeof event.scroll_count !== 'number') {
    throw new Error('Invalid scroll_count: must be a number');
  }
  if (event.scroll_count < 0) {
    throw new Error('Invalid scroll_count: must be non-negative');
  }

  // Validate avg_scroll_velocity
  if (event.avg_scroll_velocity === undefined || typeof event.avg_scroll_velocity !== 'number') {
    throw new Error('Invalid avg_scroll_velocity: must be a number');
  }
  if (event.avg_scroll_velocity < 0) {
    throw new Error('Invalid avg_scroll_velocity: must be non-negative');
  }

  return event as BrowsingEvent;
}
