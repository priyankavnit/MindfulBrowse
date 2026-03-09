import { BrowsingEvent, ScrollMetrics } from '@mindful-browse/shared';
import { EventQueue } from './services/event-queue';
import { ApiClient } from './services/api-client';
import { shouldTrackUrl } from './utils/privacy-filters';

// Current page tracking
let currentPageStart: number | null = null;
let currentUrl: string | null = null;
let currentDomain: string | null = null;
let currentTitle: string | null = null;
let currentTabId: number | null = null;
let isUserIdle: boolean = false;
let scrollMetrics: ScrollMetrics = {
  totalPixelsScrolled: 0,
  scrollEventCount: 0,
  startTime: 0,
  lastScrollTime: 0,
};

// Services
const eventQueue = new EventQueue();
const apiClient = new ApiClient();

// Set idle detection threshold (15 seconds)
chrome.idle.setDetectionInterval(15);

console.log('[Background] Mindful Browse extension initialized');

// Initialize extension - track current tab on startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Background] Extension installed/updated');
  await initializeTracking();
});

// Also initialize on startup (when service worker wakes up)
chrome.runtime.onStartup.addListener(async () => {
  console.log('[Background] Browser started');
  await initializeTracking();
});

// Initialize tracking for current active tab
async function initializeTracking() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      console.log('[Background] Initializing tracking for current tab:', tab.url);
      await handleTabChange(tab);
    }
  } catch (error) {
    console.error('[Background] Error initializing tracking:', error);
  }
}

// Listen for idle state changes
chrome.idle.onStateChanged.addListener((newState) => {
  console.log('[Background] Idle state changed:', newState);
  
  if (newState === 'idle' || newState === 'locked') {
    // User went idle or locked computer
    isUserIdle = true;
    console.log('[Background] User is now idle/locked - stopping timer');
    
    // Send event for time spent before going idle
    sendCurrentPageEvent().then(() => {
      console.log('[Background] Event sent before idle');
    });
  } else if (newState === 'active') {
    // User returned
    isUserIdle = false;
    console.log('[Background] User is now active - resuming tracking');
    
    // Resume tracking current tab
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab) {
        handleTabChange(tab);
      }
    });
  }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('[Background] Tab activated:', activeInfo.tabId);
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await handleTabChange(tab);
});

// Listen for tab updates (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    console.log('[Background] Tab updated:', tab.url);
    handleTabChange(tab);
  }
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus - send event for current page
    console.log('[Background] Window lost focus');
    await sendCurrentPageEvent();
  } else {
    // Window gained focus - get active tab
    console.log('[Background] Window gained focus');
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      await handleTabChange(tab);
    }
  }
});

// Listen for scroll events from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCROLL_EVENT') {
    scrollMetrics.totalPixelsScrolled += message.pixelsScrolled;
    scrollMetrics.scrollEventCount += 1;
    scrollMetrics.lastScrollTime = message.timestamp;
  }
  
  if (message.type === 'GET_AUTH_TOKEN') {
    chrome.storage.sync.get(['authToken'], (result) => {
      sendResponse({ token: result.authToken });
    });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'LOGIN_SUCCESS') {
    console.log('[Background] User logged in - auth token updated');
    // ApiClient will automatically pick up the new token from storage
  }
});

async function handleTabChange(tab: chrome.tabs.Tab) {
  // Don't track if user is idle
  if (isUserIdle) {
    console.log('[Background] User is idle - not tracking tab change');
    return;
  }
  
  // Send event for previous page
  await sendCurrentPageEvent();
  
  // Check if we should track this URL
  if (!tab.url || !shouldTrackUrl(tab.url)) {
    console.log('[Background] URL not tracked:', tab.url);
    currentPageStart = null;
    currentUrl = null;
    currentDomain = null;
    currentTitle = null;
    currentTabId = null;
    return;
  }
  
  // Start tracking new page
  const url = new URL(tab.url);
  currentPageStart = Date.now();
  currentUrl = tab.url; // Store full URL
  currentDomain = url.hostname;
  currentTitle = tab.title || 'Untitled';
  currentTabId = tab.id || null;
  
  console.log('[Background] Started tracking:', {
    url: currentUrl,
    domain: currentDomain,
    title: currentTitle
  });
  
  // Reset scroll metrics
  scrollMetrics = {
    totalPixelsScrolled: 0,
    scrollEventCount: 0,
    startTime: Date.now(),
    lastScrollTime: 0,
  };
  
  // Attach scroll listener to new page
  if (currentTabId) {
    attachScrollListener(currentTabId);
  }
}

function attachScrollListener(tabId: number) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      let lastScrollY = window.scrollY;
      
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const pixelsScrolled = Math.abs(currentScrollY - lastScrollY);
        
        // Send scroll data to background script
        chrome.runtime.sendMessage({
          type: 'SCROLL_EVENT',
          pixelsScrolled,
          timestamp: Date.now(),
        });
        
        lastScrollY = currentScrollY;
      }, { passive: true });
    },
  }).catch((error) => {
    // Ignore errors (e.g., on chrome:// pages)
    console.debug('[Background] Could not attach scroll listener:', error);
  });
}

async function sendCurrentPageEvent() {
  if (currentPageStart === null || currentDomain === null || currentUrl === null) {
    return;
  }
  
  const duration = Math.floor((Date.now() - currentPageStart) / 1000);
  
  // Don't send events with 0 duration
  if (duration === 0) {
    console.log('[Background] Duration is 0 - not sending event');
    return;
  }
  
  const avgScrollVelocity = calculateAvgScrollVelocity(scrollMetrics, duration);
  
  const event: BrowsingEvent = {
    domain: currentDomain,
    url: currentUrl, // Include full URL
    title: currentTitle || 'Untitled',
    timestamp: currentPageStart,
    duration_seconds: duration,
    scroll_count: scrollMetrics.scrollEventCount,
    avg_scroll_velocity: avgScrollVelocity,
  };
  
  console.log('[Background] Sending event:', {
    url: event.url,
    domain: event.domain,
    duration: event.duration_seconds,
    timestamp: new Date(event.timestamp).toISOString()
  });
  
  // Try to send event
  const success = await apiClient.sendEvent(event);
  
  if (!success) {
    console.log('[Background] Failed to send event - queuing for retry');
    // Queue for retry if failed
    await eventQueue.enqueue(event);
  }
  
  // Reset tracking
  currentPageStart = null;
  currentUrl = null;
  currentDomain = null;
  currentTitle = null;
}

function calculateAvgScrollVelocity(metrics: ScrollMetrics, durationSec: number): number {
  if (durationSec === 0 || metrics.totalPixelsScrolled === 0) {
    return 0;
  }
  return Math.round(metrics.totalPixelsScrolled / durationSec);
}
