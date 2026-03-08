# Design Document: MVP Prototype

## Overview

The MVP Prototype is a serverless digital wellbeing platform that provides users with awareness of their browsing patterns through minimal data collection and AI-powered analysis. The system consists of three main components:

1. **Browser Extension**: Captures browsing metadata (domain, title, duration) and transmits events to the backend
2. **Serverless Backend**: Processes events using AWS Lambda, classifies content using Amazon Bedrock, and stores results in DynamoDB
3. **Web Dashboard**: Displays aggregated insights through a React-based single-page application hosted on S3/CloudFront

The architecture prioritizes simplicity, low operational cost, and rapid development by leveraging fully managed AWS services. Privacy is maintained by collecting only metadata (never full content) and encrypting all data at rest and in transit.

## Architecture

### High-Level Architecture

```
┌─────────────────────┐
│ Browser Extension   │
│ (WebExtensions API) │
└──────────┬──────────┘
           │ HTTPS + Auth Token
           ▼
┌─────────────────────┐
│   API Gateway       │
│   (REST API)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│  Lambda Function    │─────▶│ Amazon Bedrock   │
│  (Event Processor)  │      │ (Claude Model)   │
└──────────┬──────────┘      └──────────────────┘
           │
           ▼
┌─────────────────────┐
│    DynamoDB         │
│ (MindfulBrowse)     │
└─────────────────────┘

┌─────────────────────┐
│   Web Dashboard     │
│   (React SPA)       │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────┐
│  CloudFront + S3    │
│  (Static Hosting)   │
└─────────────────────┘

┌─────────────────────┐
│  Amazon Cognito     │
│  (Authentication)   │
└─────────────────────┘
```


### Data Flow

1. **Event Capture**: Browser extension monitors tab activity and captures metadata on page navigation
2. **Event Transmission**: Extension sends browsing events to API Gateway with Cognito authentication token
3. **Authentication**: API Gateway validates token with Cognito before forwarding to Lambda
4. **AI Classification**: Lambda invokes Bedrock to classify sentiment (positive/neutral/negative) and category (news/social/entertainment/education/other)
5. **Doomscroll Detection**: Lambda analyzes session patterns to detect prolonged negative content consumption
6. **Storage**: Lambda stores enriched event data in DynamoDB with encryption at rest
7. **Insights Retrieval**: Dashboard queries API Gateway for aggregated metrics from the past 24 hours
8. **Visualization**: Dashboard displays browsing time, sentiment distribution, category breakdown, and doomscroll alerts

## Components and Interfaces

### Browser Extension Component

**Technology**: JavaScript/TypeScript with WebExtensions API

**Responsibilities**:
- Monitor active tab navigation events
- Track page view duration (only when tab is active and window is focused)
- Capture metadata: domain, page title, timestamp
- Track behavioral signals: scroll velocity, scroll count, shallow reading indicators
- Queue events locally when API is unavailable (max 100 events)
- Transmit events to API Gateway with authentication token
- Exclude sensitive pages (chrome://, passwords, credentials)

**Behavioral Signal Tracking**:

1. **Scroll Velocity**: Measures how fast a user scrolls through content
   - Calculated as: `scroll_velocity = pixels_scrolled / time_elapsed`
   - Normal reading: 50-200 pixels/second
   - Rapid scanning: > 500 pixels/second
   - Tracked per page and averaged

2. **Scroll Count**: Counts scroll events during browsing session
   - High scroll counts (> 20 in 2 minutes) indicate infinite scrolling behavior
   - Tracked per page view

3. **Shallow Reading Detection**: Identifies headline scanning vs deep reading
   - Indicators: high scroll velocity + low time between scrolls + large scroll distances
   - Calculated entirely in browser without AI calls

**Key Interfaces**:
```typescript
interface BrowsingEvent {
  domain: string;
  title: string;
  timestamp: number; // Unix timestamp in milliseconds
  duration_seconds: number;
  scroll_count: number; // Number of scroll events
  avg_scroll_velocity: number; // Average pixels per second
}

interface ScrollMetrics {
  totalPixelsScrolled: number;
  scrollEventCount: number;
  startTime: number;
  lastScrollTime: number;
}

interface EventQueue {
  enqueue(event: BrowsingEvent): void;
  dequeue(): BrowsingEvent | null;
  size(): number;
  flush(): Promise<void>;
}
```

**Event Transmission Logic**:
- Send event immediately when user switches tabs or leaves page
- Send event every 60 seconds for long page views
- Retry failed transmissions from local queue when API becomes available
- Include Cognito authentication token in Authorization header


### API Gateway Component

**Technology**: Amazon API Gateway (REST API)

**Responsibilities**:
- Expose REST endpoints for event ingestion and insights retrieval
- Validate authentication tokens with Cognito
- Forward authenticated requests to Lambda
- Return appropriate HTTP status codes
- Log request metadata to CloudWatch
- Protected by AWS Shield Standard for DDoS mitigation

**DDoS Protection**:

The system relies on AWS managed protections.

- API Gateway is protected by AWS Shield Standard which mitigates common network and transport layer DDoS attacks automatically
- No additional DDoS configuration is required for the MVP

**API Endpoints**:

**POST /events**
- Purpose: Receive browsing events from extension
- Authentication: Required (Cognito token)
- Request Body:
```json
{
  "domain": "example.com",
  "title": "Example Page Title",
  "timestamp": 1704067200000,
  "duration_seconds": 45,
  "scroll_count": 25,
  "avg_scroll_velocity": 620
}
```
- Response: 200 OK with optional reflection prompt:
```json
{
  "nudge": {
    "prompt": "You've been reading heavy news. What feels right?",
    "choices": [
      "Take a 5-minute break",
      "Switch to lighter content", 
      "Continue mindfully"
    ]
  }
}
```
Or 200 OK (empty body if no doomscroll detected or nudge limit reached) or 401 Unauthorized or 500 Internal Server Error

**GET /insights**
- Purpose: Retrieve aggregated browsing metrics
- Authentication: Required (Cognito token)
- Query Parameters: None (defaults to past 24 hours)
- Response: 200 OK with JSON body:
```json
{
  "total_time_seconds": 7200,
  "sentiment_distribution": {
    "positive": 0.35,
    "neutral": 0.45,
    "negative": 0.20
  },
  "category_distribution": {
    "news": 0.30,
    "social": 0.25,
    "entertainment": 0.20,
    "education": 0.15,
    "other": 0.10
  },
  "doomscroll_sessions": 2
}
```


### Lambda Function Component

**Technology**: AWS Lambda with Node.js 18+ runtime

**Responsibilities**:
- Process incoming browsing events from API Gateway
- Invoke Amazon Bedrock (Claude 3 Haiku) for sentiment and category classification
- Detect doomscrolling patterns across browsing sessions
- Generate personalized nudges using Bedrock (Claude 3 Sonnet) when doomscrolling detected
- Store enriched events in DynamoDB
- Query DynamoDB and calculate aggregated insights
- Handle errors with retry logic and logging

**Event Processing Flow**:
1. Receive event from API Gateway
2. Extract userId from authentication context
3. Check if duration_seconds >= 5 (skip Bedrock if less than 5 seconds, use neutral/other)
4. Call Bedrock (Claude 3 Haiku) with domain and title for classification (if duration >= 5 seconds)
5. Apply 5-second timeout to Bedrock call (fallback to neutral/other)
6. Analyze recent events to detect doomscroll sessions (check duration, sentiment, category, scroll activity, domain repetition)
7. If doomscroll detected, check nudge eligibility (max 3/day, min 30 min between nudges)
8. If eligible, call Bedrock (Claude 3 Sonnet) to generate reflection prompt with choices
9. Store event with classification results and optional nudge in DynamoDB
10. Update nudge counter and timestamp in DynamoDB
11. Return success/error response with nudge message (if generated)

**Insights Calculation Flow**:
1. Receive insights request from API Gateway
2. Extract userId from authentication context
3. Query DynamoDB for events from past 24 hours
4. Calculate total browsing time (sum of duration_seconds)
5. Calculate sentiment distribution (percentage of each sentiment)
6. Calculate category distribution (percentage of each category)
7. Count events with doomscroll_flag = true
8. Return aggregated metrics as JSON

**Key Functions**:
```typescript
async function processEvent(event: BrowsingEvent, userId: string): Promise<{ nudge?: NudgeResponse }>
async function classifyContent(domain: string, title: string): Promise<Classification>
async function detectDoomscroll(userId: string, currentEvent: StoredEvent): Promise<boolean>
async function checkNudgeEligibility(userId: string): Promise<boolean>
async function generateReflectionPrompt(duration: number): Promise<NudgeResponse>
async function updateNudgeCounter(userId: string): Promise<void>
async function storeEvent(event: StoredEvent): Promise<void>
async function getInsights(userId: string): Promise<InsightsResponse>

interface NudgeResponse {
  prompt: string;
  choices: string[];
}
```

**Error Handling**:
- Short duration safeguard: Skip Bedrock for events with duration_seconds < 5, use neutral/other
- Bedrock timeout: Default to neutral sentiment and other category
- DynamoDB failure: Retry up to 3 times with exponential backoff (100ms, 200ms, 400ms)
- All errors logged to CloudWatch with error details


### Amazon Bedrock Component

**Technology**: Amazon Bedrock with Claude 3 models

**Responsibilities**:
- Classify content sentiment based on domain and page title (using Claude 3 Haiku)
- Classify content category based on domain and page title (using Claude 3 Haiku)
- Generate personalized nudges when doomscrolling is detected (using Claude 3 Sonnet)
- Return classification results within 5 seconds

**Classification Invocation Pattern (Claude 3 Haiku)**:
```typescript
const prompt = `Analyze this web page and classify it:
Domain: ${domain}
Title: ${title}

Respond with JSON only:
{
  "sentiment": "positive" | "neutral" | "negative",
  "category": "news" | "social" | "entertainment" | "education" | "other"
}`;

const response = await bedrockClient.invokeModel({
  modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  body: JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: prompt
    }]
  })
});
```

**Nudge Generation Pattern (Claude 3 Sonnet)**:
```typescript
const prompt = `The user has been doomscrolling for ${duration} minutes, consuming primarily negative news content.

Generate a gentle reflection prompt with 2-3 actionable choices. Format as JSON:
{
  "prompt": "Short reflection question (max 80 chars)",
  "choices": [
    "Take a 5-minute break",
    "Switch to lighter content",
    "Continue mindfully"
  ]
}

Keep it non-judgmental and supportive. Example:
{
  "prompt": "You've been reading heavy news. What feels right?",
  "choices": ["Take a break", "Read something uplifting", "Keep going"]
}

Generate one reflection prompt:`;

const response = await bedrockClient.invokeModel({
  modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
  body: JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 150,
    messages: [{
      role: "user",
      content: prompt
    }]
  })
});
```

**Nudge Frequency Limits**:
- Maximum 3 nudges per day per user
- Minimum 30 minutes between nudges
- Tracked in DynamoDB user profile table
- Reset daily at midnight UTC

**Classification Logic**:
- Sentiment: Analyze emotional tone of content based on domain reputation and title keywords (Claude 3 Haiku)
- Category: Classify based on domain type and title content (Claude 3 Haiku)
- Nudge Generation: Create reflection prompts with actionable choices when doomscrolling detected (Claude 3 Sonnet)
- Nudge Eligibility: Check user profile for daily limit (3/day) and time gap (30 min minimum)
- Timeout: 5 seconds (Lambda enforces timeout and uses fallback)
- Timeout: 5 seconds (Lambda enforces timeout and uses fallback)

**Cost Optimization**:
- Skip Bedrock invocation for events with duration < 5 seconds (reduces unnecessary API calls)
- Use Claude 3 Haiku for classification (most cost-effective model)
- Use Claude 3 Sonnet only for nudge generation when doomscroll_flag = true
- Invoke only once per browsing event during initial processing
- Never re-invoke for the same event
- Store classification results in DynamoDB for future queries


### DynamoDB Component

**Technology**: Amazon DynamoDB with on-demand pricing

**Table Name**: MindfulBrowse

**Key Schema**:
- Partition Key (PK): `USER#${userId}` (String)
- Sort Key (SK): `EVENT#${timestamp}` or `PROFILE#metadata` (String)

**Event Record Attributes**:
```typescript
interface StoredEvent {
  PK: string;              // USER#abc123
  SK: string;              // EVENT#1704067200000
  userId: string;          // abc123
  timestamp: number;       // 1704067200000
  domain: string;          // example.com
  title: string;           // Example Page Title
  duration_seconds: number; // 45
  scroll_count: number;    // Number of scroll events
  avg_scroll_velocity: number; // Average pixels per second
  sentiment: string;       // positive | neutral | negative
  category: string;        // news | social | entertainment | education | other
  doomscroll_flag: boolean; // true | false
}
```

**User Profile Record Attributes** (for nudge tracking):
```typescript
interface UserProfile {
  PK: string;              // USER#abc123
  SK: string;              // PROFILE#metadata
  userId: string;          // abc123
  nudge_count_today: number; // 0-3
  last_nudge_timestamp: number; // Unix timestamp in milliseconds
  nudge_reset_date: string; // YYYY-MM-DD (UTC)
}
```

**Access Patterns**:
1. Store new event: `PutItem` with PK and SK = EVENT#timestamp
2. Query user events: `Query` with PK = USER#userId and SK between timestamps
3. Get recent events for doomscroll detection: `Query` with PK and SK > (now - 30 minutes)
4. Get user profile for nudge eligibility: `GetItem` with PK = USER#userId and SK = PROFILE#metadata
5. Update nudge counter: `UpdateItem` with PK = USER#userId and SK = PROFILE#metadata

**Indexes**: None required (partition key + sort key sufficient for all queries)

**Encryption**: Enabled at rest using AWS-managed keys

**Capacity Mode**: On-demand (auto-scales with request volume)


### Web Dashboard Component

**Technology**: React 18+ with TypeScript, hosted on S3, distributed via CloudFront

**Responsibilities**:
- Authenticate users via Cognito
- Fetch insights from API Gateway
- Display browsing metrics with visual representations
- Auto-refresh insights every 60 seconds
- Handle authentication token expiration

**Key Features**:
- Total daily browsing time (hours and minutes)
- Sentiment distribution (pie chart or bar chart)
- Category distribution (pie chart or bar chart)
- Doomscroll alert count (highlighted if > 0)
- Manual refresh button
- Logout functionality

**State Management**:
```typescript
interface DashboardState {
  isAuthenticated: boolean;
  authToken: string | null;
  insights: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  lastRefresh: number;
}
```

**API Integration**:
```typescript
async function fetchInsights(authToken: string): Promise<InsightsResponse> {
  const response = await fetch('https://api.example.com/insights', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (response.status === 401) {
    // Redirect to Cognito login
    redirectToLogin();
  }
  
  return response.json();
}
```

**Hosting**:
- Static files built with Vite and uploaded to S3 bucket
- CloudFront distribution serves content with HTTPS
- Cache invalidation triggered on deployment
- CloudFront serves cached content within 200ms globally


### Amazon Cognito Component

**Technology**: Amazon Cognito User Pools

**Responsibilities**:
- Manage user registration and authentication
- Issue JWT authentication tokens
- Validate tokens for API requests
- Handle token refresh and expiration

**User Flow**:
1. User accesses Dashboard
2. Dashboard redirects to Cognito Hosted UI for login
3. User authenticates with email/password
4. Cognito issues JWT token and redirects back to Dashboard
5. Dashboard stores token in secure storage
6. Browser Extension retrieves token for API requests
7. API Gateway validates token on each request

**Token Storage**:
- Dashboard: Browser localStorage (with secure flag)
- Extension: Chrome storage API (sync storage for cross-device)

**Token Expiration**:
- Access tokens expire after 1 hour
- Refresh tokens valid for 30 days
- Dashboard automatically redirects to login on 401 responses


### CloudWatch Component

**Technology**: Amazon CloudWatch Logs

**Responsibilities**:
- Collect logs from Lambda functions
- Collect access logs from API Gateway
- Store logs for debugging and monitoring
- Support configurable log levels

**Log Groups**:
- `/aws/lambda/mindful-browse-event-processor`: Lambda function logs
- `/aws/apigateway/mindful-browse-api`: API Gateway access logs

**Log Levels**:
- ERROR: System failures, exceptions, retry exhaustion
- WARN: Bedrock timeouts, fallback classifications
- INFO: Event processing, insights calculations
- DEBUG: Detailed request/response data (development only)

**Environment Variable**: `LOG_LEVEL` controls verbosity (ERROR | WARN | INFO | DEBUG)

**Retention**: 7 days for MVP (configurable for production)


## Data Models

### Browsing Event (Extension → API)

```typescript
interface BrowsingEvent {
  domain: string;          // example.com
  title: string;           // Page title from document.title
  timestamp: number;       // Unix timestamp in milliseconds
  duration_seconds: number; // Time spent on page (integer)
  scroll_count: number;    // Number of scroll events
  avg_scroll_velocity: number; // Average pixels per second
}
```

**Validation Rules**:
- domain: Non-empty string, max 253 characters
- title: Non-empty string, max 500 characters
- timestamp: Positive integer, not in future
- duration_seconds: Non-negative integer, max 86400 (24 hours)
- scroll_count: Non-negative integer
- avg_scroll_velocity: Non-negative number (pixels/second)

### Classification Result (Bedrock → Lambda)

```typescript
interface Classification {
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'news' | 'social' | 'entertainment' | 'education' | 'other';
}
```

### Stored Event (Lambda → DynamoDB)

```typescript
interface StoredEvent {
  PK: string;              // USER#${userId}
  SK: string;              // EVENT#${timestamp}
  userId: string;          // Cognito user ID
  timestamp: number;       // Unix timestamp in milliseconds
  domain: string;          // example.com
  title: string;           // Page title
  duration_seconds: number; // Time spent on page
  scroll_count: number;    // Number of scroll events
  avg_scroll_velocity: number; // Average pixels per second
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'news' | 'social' | 'entertainment' | 'education' | 'other';
  doomscroll_flag: boolean; // true if part of doomscroll session
}
```

### Insights Response (Lambda → Dashboard)

```typescript
interface InsightsResponse {
  total_time_seconds: number;
  sentiment_distribution: {
    positive: number;   // Percentage (0.0 to 1.0)
    neutral: number;
    negative: number;
  };
  category_distribution: {
    news: number;       // Percentage (0.0 to 1.0)
    social: number;
    entertainment: number;
    education: number;
    other: number;
  };
  doomscroll_sessions: number; // Count of sessions with doomscroll_flag
}
```

**Calculation Rules**:
- Percentages sum to 1.0 (or 0.0 if no events)
- total_time_seconds is sum of all duration_seconds
- doomscroll_sessions counts unique sessions (not individual events)


## Browser Extension Workflow

### Initialization

1. Extension loads and checks for authentication token in chrome.storage
2. If no token exists, display message prompting user to log in via Dashboard
3. If token exists, initialize event tracking

### Event Tracking

1. Listen to `chrome.tabs.onActivated` for tab switches
2. Listen to `chrome.tabs.onUpdated` for page navigation
3. Listen to `chrome.windows.onFocusChanged` for window focus changes
4. Track current page start time when page loads
5. Calculate duration when user leaves page or switches tabs

### Duration Calculation

```typescript
let currentPageStart: number | null = null;
let currentDomain: string | null = null;
let currentTitle: string | null = null;
let scrollMetrics: ScrollMetrics = {
  totalPixelsScrolled: 0,
  scrollEventCount: 0,
  startTime: 0,
  lastScrollTime: 0
};

function onPageLoad(tab: chrome.tabs.Tab) {
  if (currentPageStart !== null) {
    // Send event for previous page
    const duration = Math.floor((Date.now() - currentPageStart) / 1000);
    const avgScrollVelocity = calculateAvgScrollVelocity(scrollMetrics, duration);
    
    sendEvent({
      domain: currentDomain!,
      title: currentTitle!,
      timestamp: currentPageStart,
      duration_seconds: duration,
      scroll_count: scrollMetrics.scrollEventCount,
      avg_scroll_velocity: avgScrollVelocity
    });
  }
  
  // Start tracking new page
  currentPageStart = Date.now();
  currentDomain = new URL(tab.url!).hostname;
  currentTitle = tab.title || 'Untitled';
  
  // Reset scroll metrics
  scrollMetrics = {
    totalPixelsScrolled: 0,
    scrollEventCount: 0,
    startTime: Date.now(),
    lastScrollTime: 0
  };
  
  // Attach scroll listener
  attachScrollListener(tab.id!);
}

function calculateAvgScrollVelocity(metrics: ScrollMetrics, durationSec: number): number {
  if (durationSec === 0 || metrics.totalPixelsScrolled === 0) {
    return 0;
  }
  return Math.round(metrics.totalPixelsScrolled / durationSec);
}
```

### Scroll Tracking Implementation

```typescript
function attachScrollListener(tabId: number) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      let lastScrollY = window.scrollY;
      let lastScrollTime = Date.now();
      
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        const pixelsScrolled = Math.abs(currentScrollY - lastScrollY);
        
        // Send scroll data to background script
        chrome.runtime.sendMessage({
          type: 'SCROLL_EVENT',
          pixelsScrolled,
          timestamp: currentTime
        });
        
        lastScrollY = currentScrollY;
        lastScrollTime = currentTime;
      }, { passive: true });
    }
  });
}

// In background script - handle scroll events
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SCROLL_EVENT') {
    scrollMetrics.totalPixelsScrolled += message.pixelsScrolled;
    scrollMetrics.scrollEventCount += 1;
    scrollMetrics.lastScrollTime = message.timestamp;
  }
});
```

### Long Page View Handling

```typescript
// Send event every 60 seconds for long page views
setInterval(() => {
  if (currentPageStart !== null) {
    const duration = Math.floor((Date.now() - currentPageStart) / 1000);
    if (duration >= 60) {
      const avgScrollVelocity = calculateAvgScrollVelocity(scrollMetrics, duration);
      
      sendEvent({
        domain: currentDomain!,
        title: currentTitle!,
        timestamp: currentPageStart,
        duration_seconds: duration,
        scroll_count: scrollMetrics.scrollEventCount,
        avg_scroll_velocity: avgScrollVelocity
      });
      
      // Reset timer and scroll metrics for next interval
      currentPageStart = Date.now();
      scrollMetrics = {
        totalPixelsScrolled: 0,
        scrollEventCount: 0,
        startTime: Date.now(),
        lastScrollTime: 0
      };
    }
  }
}, 60000);
```

### Event Transmission

```typescript
async function sendEvent(event: BrowsingEvent) {
  const token = await getAuthToken();
  
  try {
    const response = await fetch('https://api.example.com/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(event)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    // Queue event for retry
    await queueEvent(event);
  }
}
```

### Local Queue Management

```typescript
const MAX_QUEUE_SIZE = 100;

async function queueEvent(event: BrowsingEvent) {
  const queue = await chrome.storage.local.get('eventQueue') || [];
  
  if (queue.length < MAX_QUEUE_SIZE) {
    queue.push(event);
    await chrome.storage.local.set({ eventQueue: queue });
  } else {
    console.warn('Event queue full, dropping event');
  }
}

async function flushQueue() {
  const queue = await chrome.storage.local.get('eventQueue') || [];
  
  for (const event of queue) {
    try {
      await sendEvent(event);
      // Remove from queue on success
      queue.shift();
      await chrome.storage.local.set({ eventQueue: queue });
    } catch (error) {
      // Stop flushing on first failure
      break;
    }
  }
}

// Attempt to flush queue every 5 minutes
setInterval(flushQueue, 300000);
```

### Privacy Filters

```typescript
function shouldTrackUrl(url: string): boolean {
  // Exclude internal browser pages
  if (url.startsWith('chrome://')) return false;
  if (url.startsWith('about:')) return false;
  if (url.startsWith('edge://')) return false;
  if (url.startsWith('firefox://')) return false;
  
  // Exclude extension pages
  if (url.startsWith('chrome-extension://')) return false;
  if (url.startsWith('moz-extension://')) return false;
  
  // Exclude local files
  if (url.startsWith('file://')) return false;
  
  return true;
}
```


## Doomscroll Detection Algorithm

### Session Definition

A browsing session consists of consecutive events where the time gap between events is less than 5 minutes (300 seconds).

### Behavioral Signals for Doomscrolling

The algorithm uses multiple behavioral signals to detect doomscrolling patterns:

1. **Scroll Activity**: High scroll velocity (> 500 px/s) or high scroll count (> 20 per event) indicates rapid headline scanning
2. **Domain Repetition**: Repeatedly consuming content from the same domain (> 70% of events or > 10 events from same domain) indicates obsessive news consumption
3. **Sentiment Pattern**: High ratio of negative content (> 60%) combined with news category
4. **Session Duration**: Extended browsing sessions (> 15 minutes)

A session is flagged as doomscrolling when sentiment/category/duration criteria are met AND at least one behavioral signal (scroll activity OR domain repetition) is detected.

```typescript
function groupIntoSessions(events: StoredEvent[]): StoredEvent[][] {
  const sessions: StoredEvent[][] = [];
  let currentSession: StoredEvent[] = [];
  
  for (let i = 0; i < events.length; i++) {
    if (currentSession.length === 0) {
      currentSession.push(events[i]);
    } else {
      const lastEvent = currentSession[currentSession.length - 1];
      const timeDiff = events[i].timestamp - lastEvent.timestamp;
      
      if (timeDiff < 300000) { // 5 minutes in milliseconds
        currentSession.push(events[i]);
      } else {
        sessions.push(currentSession);
        currentSession = [events[i]];
      }
    }
  }
  
  if (currentSession.length > 0) {
    sessions.push(currentSession);
  }
  
  return sessions;
}
```

### Doomscroll Detection Logic

```typescript
function isDoomscrollSession(session: StoredEvent[]): boolean {
  // Calculate total duration
  const totalDuration = session.reduce((sum, event) => sum + event.duration_seconds, 0);
  
  // Must exceed 15 minutes (900 seconds)
  if (totalDuration <= 900) {
    return false;
  }
  
  // Calculate negative content ratio
  const negativeEvents = session.filter(e => e.sentiment === 'negative');
  const negativeRatio = negativeEvents.length / session.length;
  
  // Must exceed 60% negative content
  if (negativeRatio <= 0.6) {
    return false;
  }
  
  // Must be primarily news content
  const newsEvents = session.filter(e => e.category === 'news');
  const newsRatio = newsEvents.length / session.length;
  
  // Majority must be news
  if (newsRatio <= 0.5) {
    return false;
  }
  
  // Check behavioral signals
  const hasHighScrollActivity = checkHighScrollActivity(session);
  const hasDomainRepetition = checkDomainRepetition(session);
  
  // Doomscroll detected if sentiment/category criteria met AND (high scroll activity OR domain repetition)
  return hasHighScrollActivity || hasDomainRepetition;
}

function checkHighScrollActivity(session: StoredEvent[]): boolean {
  // Calculate average scroll velocity across session
  const totalVelocity = session.reduce((sum, e) => sum + e.avg_scroll_velocity, 0);
  const avgVelocity = totalVelocity / session.length;
  
  // Calculate average scroll count per event
  const totalScrolls = session.reduce((sum, e) => sum + e.scroll_count, 0);
  const avgScrollCount = totalScrolls / session.length;
  
  // High scroll activity indicators:
  // - Average scroll velocity > 500 pixels/second (rapid scanning)
  // - OR average scroll count > 20 per event (infinite scrolling)
  return avgVelocity > 500 || avgScrollCount > 20;
}

function checkDomainRepetition(session: StoredEvent[]): boolean {
  // Count occurrences of each domain
  const domainFrequency: Record<string, number> = {};
  
  for (const event of session) {
    domainFrequency[event.domain] = (domainFrequency[event.domain] || 0) + 1;
  }
  
  // Find the most frequent domain
  let maxCount = 0;
  let dominantDomain = '';
  
  for (const [domain, count] of Object.entries(domainFrequency)) {
    if (count > maxCount) {
      maxCount = count;
      dominantDomain = domain;
    }
  }
  
  // Calculate dominant domain ratio
  const dominantRatio = maxCount / session.length;
  
  // Domain repetition is high when:
  // - More than 70% of events from same domain
  // - OR more than 10 events from same domain
  return dominantRatio > 0.7 || maxCount > 10;
}
```

### Applying Doomscroll Flag

When processing a new event, Lambda queries recent events (past 30 minutes) to determine if the current event is part of a doomscroll session:

```typescript
async function detectDoomscroll(userId: string, currentEvent: StoredEvent): Promise<boolean> {
  // Query events from past 30 minutes
  const thirtyMinutesAgo = Date.now() - 1800000;
  const recentEvents = await queryEvents(userId, thirtyMinutesAgo);
  
  // Add current event
  recentEvents.push(currentEvent);
  
  // Group into sessions
  const sessions = groupIntoSessions(recentEvents);
  
  // Check if current event's session is doomscroll
  const currentSession = sessions[sessions.length - 1];
  return isDoomscrollSession(currentSession);
}
```


## Privacy Design

### Data Minimization

The system collects only the minimum data necessary for functionality:

**Collected**:
- Domain name (e.g., "example.com")
- Page title (from document.title)
- Timestamp (when page was viewed)
- Duration (time spent on page)

**Never Collected**:
- Full page content or HTML
- User input or form data
- Passwords or credentials
- Personal messages or emails
- Cookies or tracking data
- IP addresses (beyond AWS standard logging)
- Browsing history beyond 24 hours for insights

### Data Encryption

**In Transit**:
- All API communication uses HTTPS/TLS 1.2+
- Browser Extension → API Gateway: TLS encrypted
- API Gateway → Lambda: AWS internal encryption
- Lambda → Bedrock: AWS internal encryption
- Lambda → DynamoDB: AWS internal encryption

**At Rest**:
- DynamoDB: Encryption at rest using AWS-managed keys
- CloudWatch Logs: Encrypted using AWS-managed keys
- S3 (Dashboard): Encryption at rest using AWS-managed keys

### User Control

**Data Access**:
- Users can only access their own data (enforced by Cognito userId)
- API Gateway validates authentication on every request
- DynamoDB queries filtered by userId partition key

**Data Deletion**:
- Users can delete their account and all associated data
- Deletion removes all events from DynamoDB
- Deletion is permanent and immediate

### Privacy-Preserving AI Analysis

**Bedrock Processing**:
- Only domain and title sent to Bedrock (never full content)
- Bedrock does not store input data (per AWS Bedrock privacy policy)
- Classification results stored locally in DynamoDB
- No data shared with third parties

### Compliance Considerations

**GDPR**:
- Right to access: Users can view all their data via Dashboard
- Right to deletion: Users can delete their account
- Data minimization: Only essential data collected
- Purpose limitation: Data used only for stated purpose

**CCPA**:
- Transparency: Privacy policy explains data collection
- Opt-out: Users can stop using extension at any time
- No sale of data: Data never sold or shared with third parties


## Error Handling

### Browser Extension Error Handling

**Network Failures**:
- Queue events locally (max 100 events)
- Retry from queue every 5 minutes
- Log errors to console for debugging

**Authentication Failures**:
- Display message prompting user to log in via Dashboard
- Clear invalid token from storage
- Stop event tracking until re-authenticated

**Storage Quota Exceeded**:
- Drop oldest queued events to make room
- Log warning to console

### Lambda Function Error Handling

**Bedrock Timeout**:
```typescript
try {
  const classification = await Promise.race([
    classifyContent(domain, title),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
  ]);
} catch (error) {
  // Fallback to neutral/other
  classification = { sentiment: 'neutral', category: 'other' };
  console.warn('Bedrock timeout, using fallback classification');
}
```

**DynamoDB Failures**:
```typescript
async function storeEventWithRetry(event: StoredEvent, maxRetries = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await dynamoClient.putItem(event);
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('DynamoDB storage failed after retries', error);
        throw error;
      }
      // Exponential backoff: 100ms, 200ms, 400ms
      await sleep(100 * Math.pow(2, attempt - 1));
    }
  }
}
```

**Invalid Input**:
```typescript
function validateBrowsingEvent(event: any): BrowsingEvent {
  if (!event.domain || typeof event.domain !== 'string') {
    throw new Error('Invalid domain');
  }
  if (!event.title || typeof event.title !== 'string') {
    throw new Error('Invalid title');
  }
  if (!event.timestamp || typeof event.timestamp !== 'number') {
    throw new Error('Invalid timestamp');
  }
  if (event.duration_seconds === undefined || typeof event.duration_seconds !== 'number') {
    throw new Error('Invalid duration');
  }
  return event as BrowsingEvent;
}
```

### API Gateway Error Responses

**401 Unauthorized**:
- Returned when Cognito token is invalid or expired
- Dashboard redirects to login
- Extension prompts user to re-authenticate

**500 Internal Server Error**:
- Returned when Lambda function fails
- Extension queues event for retry
- Dashboard displays error message


## Scalability Notes

### Serverless Auto-Scaling

**Lambda**:
- Automatically scales with request volume
- Concurrent execution limit: 1000 (default AWS account limit)
- Cold start latency: ~500ms for Node.js runtime
- Warm execution: ~50ms average

**DynamoDB**:
- On-demand pricing mode scales automatically
- No capacity planning required
- Handles up to 40,000 read/write requests per second per table
- Single-digit millisecond latency

**API Gateway**:
- Automatically scales with request volume
- Default limit: 10,000 requests per second
- Protected by AWS Shield Standard for DDoS mitigation
- Can be increased via AWS support

### Cost Optimization

**Lambda**:
- Pay per request and execution time
- Estimated cost: $0.20 per 1 million requests
- Memory: 512 MB (sufficient for event processing)
- Timeout: 10 seconds (Bedrock call + DynamoDB operations)

**Bedrock**:
- Pay per token processed
- Estimated cost: $0.003 per 1,000 input tokens
- Average event: ~50 tokens (domain + title)
- Cost per event: ~$0.00015

**DynamoDB**:
- On-demand pricing: $1.25 per million write requests
- $0.25 per million read requests
- Storage: $0.25 per GB-month
- Estimated cost for 1,000 users: ~$10/month

**CloudFront + S3**:
- S3 storage: $0.023 per GB-month
- CloudFront data transfer: $0.085 per GB
- Dashboard size: ~5 MB
- Estimated cost: ~$1/month for 1,000 users

### Performance Targets

**Browser Extension**:
- Event capture: <10ms overhead per page navigation
- Event transmission: <100ms (async, non-blocking)
- Queue flush: <5 seconds for 100 events

**API Gateway + Lambda**:
- Event processing: <2 seconds end-to-end (including Bedrock)
- Insights query: <500ms for 24 hours of data
- P99 latency: <3 seconds

**Dashboard**:
- Initial load: <2 seconds (CloudFront cached)
- Insights refresh: <1 second
- Auto-refresh interval: 60 seconds

### Monitoring and Alerts

**CloudWatch Metrics**:
- Lambda invocation count
- Lambda error rate
- Lambda duration (P50, P99)
- DynamoDB throttled requests
- API Gateway 4xx/5xx errors

**Recommended Alarms**:
- Lambda error rate > 5% for 5 minutes
- DynamoDB throttled requests > 10 for 5 minutes
- API Gateway 5xx errors > 10 for 5 minutes
- Bedrock timeout rate > 20% for 5 minutes


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Complete Event Metadata Capture

For any page navigation event, the browser extension should capture all required metadata fields: domain name, page title, and timestamp.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Duration Calculation Accuracy

For any page view with entry time T1 and exit time T2, the calculated duration_seconds should equal floor((T2 - T1) / 1000).

**Validates: Requirements 1.4**

### Property 3: Active Tab Tracking Only

For any browsing event, the event should only be generated when the tab is active and the browser window is focused.

**Validates: Requirements 1.5, 12.3**

### Property 4: Privacy Data Exclusion

For any captured browsing event, the event data should never contain full page content, passwords, personal messages, or credentials.

**Validates: Requirements 1.6, 1.7, 1.8, 1.9**

### Property 5: Internal Page Filtering

For any URL starting with chrome://, about://, edge://, firefox://, chrome-extension://, moz-extension://, or file://, the browser extension should not generate a browsing event.

**Validates: Requirements 1.10**

### Property 6: Event Transmission with Authentication

For any captured browsing event, when transmitted to the API Gateway, the request should include a valid authentication token in the Authorization header.

**Validates: Requirements 2.1, 2.2**

### Property 7: Authentication Validation

For any incoming API request, the API Gateway should validate the authentication token with Cognito before forwarding to Lambda.

**Validates: Requirements 2.3, 2.5**

### Property 8: Authentication Failure Response

For any API request with an invalid or expired authentication token, the API Gateway should return HTTP status code 401.

**Validates: Requirements 2.4**

### Property 9: Bedrock Classification Invocation

For any browsing event received by Lambda, the Lambda function should invoke Bedrock exactly once with the domain and page title.

**Validates: Requirements 3.1, 4.1, 4.2**

### Property 10: Sentiment Classification Format

For any Bedrock classification result, the sentiment field should be exactly one of: "positive", "neutral", or "negative".

**Validates: Requirements 3.2**

### Property 11: Category Classification Format

For any Bedrock classification result, the category field should be exactly one of: "news", "social", "entertainment", "education", or "other".

**Validates: Requirements 3.3**

### Property 12: Event Enrichment

For any browsing event processed by Lambda, the stored event in DynamoDB should include both sentiment and category fields from the classification result.

**Validates: Requirements 3.4, 4.3**

### Property 13: Bedrock Timeout Fallback

For any Bedrock invocation that exceeds 5 seconds, the Lambda function should classify the event with sentiment="neutral" and category="other".

**Validates: Requirements 3.5**

### Property 14: No Bedrock Calls During Insights Retrieval

For any insights query request, the Lambda function should retrieve data from DynamoDB without invoking Bedrock.

**Validates: Requirements 4.4, 4.5**

### Property 15: Session Grouping by Time Gap

For any sequence of browsing events sorted by timestamp, events should be grouped into the same session if and only if the time gap between consecutive events is less than 300 seconds (5 minutes).

**Validates: Requirements 5.1, 5.2**

### Property 16: Doomscroll Detection Criteria

For any browsing session, the session should be marked with doomscroll_flag=true if and only if: (1) total duration exceeds 900 seconds, AND (2) negative sentiment ratio exceeds 0.6, AND (3) the majority category is "news".

**Validates: Requirements 5.3**

### Property 17: DynamoDB Key Format

For any event stored in DynamoDB, the partition key should have format "USER#{userId}" and the sort key should have format "EVENT#{timestamp}".

**Validates: Requirements 6.2, 6.3**

### Property 18: Complete Event Storage

For any processed browsing event, the stored DynamoDB record should include all required attributes: userId, timestamp, domain, duration_seconds, sentiment, category, and doomscroll_flag.

**Validates: Requirements 6.1, 6.4**

### Property 19: Storage Failure Logging

For any DynamoDB storage operation that fails, the Lambda function should write an error log entry to CloudWatch.

**Validates: Requirements 6.5**

### Property 20: 24-Hour Insights Query Scope

For any insights request at time T, the Lambda function should query only events with timestamps between (T - 86400000) and T.

**Validates: Requirements 7.3**

### Property 21: Total Time Calculation

For any set of browsing events, the calculated total_time_seconds should equal the sum of all duration_seconds values.

**Validates: Requirements 7.4**

### Property 22: Distribution Percentage Calculation

For any set of browsing events, the sentiment distribution and category distribution percentages should each sum to 1.0 (or 0.0 if no events exist).

**Validates: Requirements 7.5, 7.6**

### Property 23: Doomscroll Session Count

For any set of browsing events, the doomscroll_sessions count should equal the number of unique sessions where doomscroll_flag=true.

**Validates: Requirements 7.7**

### Property 24: Insights JSON Response Format

For any insights calculation, the Lambda function should return a valid JSON object containing: total_time_seconds, sentiment_distribution, category_distribution, and doomscroll_sessions.

**Validates: Requirements 7.8**

### Property 25: Time Display Conversion

For any total_time_seconds value, the Dashboard should display the time correctly converted to hours and minutes format.

**Validates: Requirements 8.1**

### Property 26: Distribution Display

For any insights response, the Dashboard should display both sentiment and category distributions as percentage breakdowns.

**Validates: Requirements 8.2, 8.3**

### Property 27: Doomscroll Alert Display

For any insights response where doomscroll_sessions > 0, the Dashboard should display the doomscroll alert count.

**Validates: Requirements 8.4**

### Property 28: Unauthenticated Access Redirect

For any Dashboard access attempt without a valid authentication token, the Dashboard should redirect to the Cognito login page.

**Validates: Requirements 9.1**

### Property 29: Token Issuance

For any successful authentication with Cognito, the service should issue a JWT authentication token.

**Validates: Requirements 9.2**

### Property 30: Secure Token Storage

For any authentication token received by the Dashboard, the token should be stored in browser localStorage.

**Validates: Requirements 9.3**

### Property 31: Extension Token Retrieval

For any browser extension startup, the extension should retrieve the authentication token from Chrome storage API.

**Validates: Requirements 9.4**

### Property 32: Token Expiration Handling

For any API request that returns HTTP 401, the Dashboard should redirect the user to Cognito login.

**Validates: Requirements 9.5**

### Property 33: Event Processing Logging

For any browsing event processed by Lambda, the function should write a log entry to CloudWatch.

**Validates: Requirements 10.1**

### Property 34: Error Logging

For any error encountered by Lambda or API Gateway, the system should write error details to CloudWatch.

**Validates: Requirements 10.2, 10.3, 10.4**

### Property 35: Configurable Log Verbosity

For any log level setting via LOG_LEVEL environment variable, the system should respect the configured verbosity (ERROR, WARN, INFO, or DEBUG).

**Validates: Requirements 10.5, 10.6**

### Property 36: Offline Event Queueing

For any browsing event when the API Gateway is unavailable, the browser extension should store the event in local browser storage up to a maximum of 100 events.

**Validates: Requirements 11.1, 11.2**

### Property 37: Queue Flushing on Reconnection

For any queued events when the API Gateway becomes available, the browser extension should transmit all queued events in order.

**Validates: Requirements 11.3**

### Property 38: Lambda Failure Response

For any Lambda function processing failure, the API Gateway should return HTTP status code 500.

**Validates: Requirements 11.4**

### Property 39: DynamoDB Retry with Exponential Backoff

For any DynamoDB operation failure, the Lambda function should retry up to 3 times with exponential backoff delays (100ms, 200ms, 400ms).

**Validates: Requirements 11.5**

### Property 40: Retry Exhaustion Logging

For any DynamoDB operation where all 3 retry attempts fail, the Lambda function should log the failure to CloudWatch.

**Validates: Requirements 11.6**

### Property 41: Periodic Event Transmission

For any page view exceeding 60 seconds, the browser extension should transmit a browsing event every 60 seconds.

**Validates: Requirements 12.1**

### Property 42: Immediate Transmission on Navigation

For any tab switch or page navigation event, the browser extension should immediately transmit the browsing event without waiting for the 60-second interval.

**Validates: Requirements 12.2**


## Testing Strategy

### Testing Approach for MVP

The MVP Prototype uses a focused testing strategy with unit tests and integration tests to ensure core functionality works correctly while keeping development velocity high.

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and component behavior in isolation
- **Integration Tests**: Verify end-to-end flows and interactions between components

### Unit Testing Framework

**Library**: Jest with ts-jest for TypeScript support

**Test Organization**:
- Browser Extension: `packages/browser-extension/__tests__/unit/`
- Lambda Functions: `packages/lambda-functions/__tests__/unit/`
- Web Dashboard: `packages/web-dashboard/__tests__/unit/`
- Shared Utilities: `packages/shared/__tests__/unit/`

**Unit Test Focus Areas**:
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, maximum limits)
- Error conditions (network failures, invalid tokens, timeouts)
- Integration points (API contracts, data format conversions)
- UI component rendering and user interactions

### Integration Testing

**Framework**: Jest with LocalStack for AWS service mocking

**Test Organization**:
- End-to-end flows: `packages/lambda-functions/__tests__/integration/`
- API Gateway + Lambda: Test complete request/response cycles
- Lambda + DynamoDB: Test data persistence and retrieval
- Lambda + Bedrock: Test AI classification (mocked in LocalStack)

**Integration Test Scenarios**:
- Complete event ingestion flow (API → Lambda → Bedrock → DynamoDB)
- Complete insights retrieval flow (API → Lambda → DynamoDB → Response)
- Authentication flow (Cognito token validation)
- Error handling flows (retries, fallbacks, logging)

### Test Coverage Targets

**Minimum Coverage**:
- Unit tests: 70% code coverage (focused on critical logic)
- Integration tests: All critical paths covered

**Critical Paths**:
1. Event capture → transmission → processing → storage
2. Insights query → calculation → response
3. Authentication → token validation → authorized access
4. Error scenarios → retry logic → fallback behavior

### Testing Best Practices

**Unit Test Design**:
- Keep tests focused on single behaviors
- Use descriptive test names that explain the scenario
- Mock external dependencies (Bedrock, DynamoDB, Cognito)
- Test both success and failure paths
- Focus on edge cases and boundary conditions

**Integration Test Design**:
- Test complete request/response cycles
- Verify data flows between components
- Use LocalStack for AWS service mocking
- Test error handling and retry logic

### Mock Data Helpers

**For Unit Tests**:
```typescript
// Mock browsing event factory
function createMockBrowsingEvent(overrides = {}) {
  return {
    domain: 'example.com',
    title: 'Example Page',
    timestamp: Date.now(),
    duration_seconds: 60,
    ...overrides
  };
}

// Mock stored event factory
function createMockStoredEvent(overrides = {}) {
  return {
    PK: 'USER#test-user-123',
    SK: `EVENT#${Date.now()}`,
    userId: 'test-user-123',
    timestamp: Date.now(),
    domain: 'example.com',
    title: 'Example Page',
    duration_seconds: 60,
    sentiment: 'neutral',
    category: 'other',
    doomscroll_flag: false,
    ...overrides
  };
}

// Mock classification result factory
function createMockClassification(overrides = {}) {
  return {
    sentiment: 'neutral',
    category: 'other',
    ...overrides
  };
}
```

### Continuous Integration

**Test Execution**:
- Run all tests on every pull request
- Run integration tests against LocalStack
- Fail build on any test failure or significant coverage drop

**Test Commands**:
```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```
