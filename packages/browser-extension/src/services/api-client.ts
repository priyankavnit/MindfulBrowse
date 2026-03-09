import { BrowsingEvent, NudgeResponse } from '@mindful-browse/shared';
import { config } from '../config';

export class ApiClient {
  private apiUrl: string = config.apiUrl; // Use config as default
  
  constructor() {
    // Load API URL from storage (overrides config if set)
    chrome.storage.sync.get(['apiUrl'], (result) => {
      if (result.apiUrl) {
        this.apiUrl = result.apiUrl;
        console.log('[ApiClient] API URL loaded from storage:', this.apiUrl);
      } else {
        console.log('[ApiClient] Using default API URL from config:', this.apiUrl);
      }
    });
    
    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.apiUrl) {
        this.apiUrl = changes.apiUrl.newValue || config.apiUrl;
        console.log('[ApiClient] API URL updated:', this.apiUrl);
      }
    });
  }
  
  async sendEvent(event: BrowsingEvent): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        console.warn('[ApiClient] No auth token found - user needs to log in');
        return false;
      }
      
      if (!this.apiUrl) {
        console.error('[ApiClient] No API URL configured');
        return false;
      }
      
      console.log('[ApiClient] Sending event:', {
        url: event.url,
        domain: event.domain,
        duration: event.duration_seconds,
        timestamp: new Date(event.timestamp).toISOString()
      });
      
      const response = await fetch(`${this.apiUrl}events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });
      
      if (response.status === 401) {
        console.warn('[ApiClient] Authentication failed - token may be expired');
        await this.clearAuthToken();
        return false;
      }
      
      if (!response.ok) {
        console.error('[ApiClient] API error:', response.status, response.statusText);
        return false;
      }
      
      console.log('[ApiClient] Event sent successfully');
      
      // Check if response has nudge
      const text = await response.text();
      if (text) {
        const data = JSON.parse(text);
        if (data.nudge) {
          console.log('[ApiClient] Received nudge:', data.nudge.prompt);
          this.showNudge(data.nudge);
        }
      }
      
      return true;
    } catch (error) {
      console.error('[ApiClient] Error sending event:', error);
      return false;
    }
  }
  
  private async getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['authToken'], (result) => {
        resolve(result.authToken || null);
      });
    });
  }
  
  private async clearAuthToken(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(['authToken'], () => {
        resolve();
      });
    });
  }
  
  private showNudge(nudge: NudgeResponse) {
    // Show browser notification with nudge
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Mindful Browse',
      message: nudge.prompt,
      buttons: nudge.choices.slice(0, 2).map(choice => ({ title: choice })),
      priority: 1,
    });
  }
}
