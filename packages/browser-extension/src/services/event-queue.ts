import { BrowsingEvent } from '@mindful-browse/shared';
import { ApiClient } from './api-client';

const MAX_QUEUE_SIZE = 100;
const STORAGE_KEY = 'eventQueue';

export class EventQueue {
  async enqueue(event: BrowsingEvent): Promise<void> {
    const queue = await this.getQueue();
    
    if (queue.length >= MAX_QUEUE_SIZE) {
      console.warn('Event queue full, dropping oldest event');
      queue.shift(); // Remove oldest event
    }
    
    queue.push(event);
    await this.saveQueue(queue);
  }
  
  async dequeue(): Promise<BrowsingEvent | null> {
    const queue = await this.getQueue();
    
    if (queue.length === 0) {
      return null;
    }
    
    const event = queue.shift();
    await this.saveQueue(queue);
    
    return event || null;
  }
  
  async size(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }
  
  async flush(apiClient: ApiClient): Promise<void> {
    const queue = await this.getQueue();
    
    if (queue.length === 0) {
      return;
    }
    
    console.log(`Flushing ${queue.length} queued events`);
    
    // Try to send each event
    for (let i = 0; i < queue.length; i++) {
      const event = queue[i];
      const success = await apiClient.sendEvent(event);
      
      if (success) {
        // Remove from queue
        queue.splice(i, 1);
        i--; // Adjust index after removal
        await this.saveQueue(queue);
      } else {
        // Stop flushing on first failure
        console.log('Queue flush stopped - API unavailable');
        break;
      }
    }
  }
  
  private async getQueue(): Promise<BrowsingEvent[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || []);
      });
    });
  }
  
  private async saveQueue(queue: BrowsingEvent[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: queue }, () => {
        resolve();
      });
    });
  }
}
