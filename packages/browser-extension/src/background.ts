import { BrowsingEvent, ScrollMetrics } from '@mindful-browse/shared';
import { EventQueue } from './services/event-queue';
import { ApiClient } from './services/api-client';
import { shouldTrackUrl } from './utils/privacy-filters';

// Current page tracking
let currentPageStart: number | null = null;
let currentDomain: string | null = null;
let currentTitle: string | null = null;
let currentTabId: number | null = null;
let scrollMetrics: ScrollMetrics = {
  totalPixelsScrolled: 0,
  scrollEventCount: 0,
  startTime: 0,
  lastScrollTime: 0,
};

// Services
const eventQueue = new EventQueue();
const apiClient = new ApiClient();

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Mindful Browse extension installed');
  
  // Start queue flushing interval (every 5 minutes)
  setInterval(() => {
    eventQueue.flush(apiClient);
  }, 300000);
  
  // Start periodic event transmission (every 60 seconds)
  setInterval(() => {
    sendPeriodicEvent();
  }, 60000);
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

// Listen for tab updates (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    handleTabChange(tab);
  }
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus - send event for current page
    await sendCurrentPageEvent();
  } else {
    // Window gained focus - get active tab
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      handleTabChange(tab);
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
});

async function handleTabChange(tab: chrome.tabs.Tab) {
  // Send event for previous page
  await sendCurrentPageEvent();
  
  // Check if we should track this URL
  if (!tab.url || !shouldTrackUrl(tab.url)) {
    currentPageStart = null;
    currentDomain = null;
    currentTitle = null;
    currentTabId = null;
    return;
  }
  
  // Start tracking new page
  currentPageStart = Date.now();
  currentDomain = new URL(tab.url).hostname;
  currentTitle = tab.title || 'Untitled';
  currentTabId = tab.id || null;
  
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
    console.debug('Could not attach scroll listener:', error);
  });
}

async function sendCurrentPageEvent() {
  if (currentPageStart === null || currentDomain === null) {
    return;
  }
  
  const duration = Math.floor((Date.now() - currentPageStart) / 1000);
  
  // Don't send events with 0 duration
  if (duration === 0) {
    return;
  }
  
  const avgScrollVelocity = calculateAvgScrollVelocity(scrollMetrics, duration);
  
  const event: BrowsingEvent = {
    domain: currentDomain,
    title: currentTitle || 'Untitled',
    timestamp: currentPageStart,
    duration_seconds: duration,
    scroll_count: scrollMetrics.scrollEventCount,
    avg_scroll_velocity: avgScrollVelocity,
  };
  
  // Try to send event
  const success = await apiClient.sendEvent(event);
  
  if (!success) {
    // Queue for retry if failed
    await eventQueue.enqueue(event);
  }
}

function sendPeriodicEvent() {
  if (currentPageStart !== null) {
    const duration = Math.floor((Date.now() - currentPageStart) / 1000);
    
    // Only send if duration >= 60 seconds
    if (duration >= 60) {
      sendCurrentPageEvent().then(() => {
        // Reset timer and scroll metrics for next interval
        currentPageStart = Date.now();
        scrollMetrics = {
          totalPixelsScrolled: 0,
          scrollEventCount: 0,
          startTime: Date.now(),
          lastScrollTime: 0,
        };
      });
    }
  }
}

function calculateAvgScrollVelocity(metrics: ScrollMetrics, durationSec: number): number {
  if (durationSec === 0 || metrics.totalPixelsScrolled === 0) {
    return 0;
  }
  return Math.round(metrics.totalPixelsScrolled / durationSec);
}
