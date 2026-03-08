import { BrowsingEvent, NudgeResponse } from '@mindful-browse/shared';

export class ApiClient {
  private apiUrl: string = '';
  
  constructor() {
    // Load API URL from storage
    chrome.storage.sync.get(['apiUrl'], (result) => {
      this.apiUrl = result.apiUrl || '';
    });
  }
  
  async sendEvent(event: BrowsingEvent): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        console.warn('No auth token found');
        return false;
      }
      
      if (!this.apiUrl) {
        console.warn('No API URL configured');
        return false;
      }
      
      const response = await fetch(`${this.apiUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        console.warn('Authentication failed - token may be expired');
        await this.clearAuthToken();
        return false;
      }
      
      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        return false;
      }
      
      // Check if response has nudge
      const text = await response.text();
      if (text) {
        const data = JSON.parse(text);
        if (data.nudge) {
          this.showNudge(data.nudge);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error sending event:', error);
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
