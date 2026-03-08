# Implementation Plan: MVP Prototype

## Overview

This plan implements a serverless digital wellbeing platform using AWS services. The implementation follows a bottom-up approach: shared utilities first, then infrastructure, backend services, browser extension, and finally the web dashboard. Each task builds incrementally with testing integrated throughout.

## Tasks

- [x] 1. Set up monorepo structure and shared package
  - [x] 1.1 Initialize npm workspace structure
    - Create root package.json with workspace configuration
    - Set up TypeScript configuration for monorepo
    - Configure ESLint and Prettier for code quality
    - _Requirements: Infrastructure foundation_
  
  - [x] 1.2 Create shared types package
    - Create packages/shared directory structure
    - Define TypeScript interfaces for BrowsingEvent, StoredEvent, Classification, InsightsResponse
    - Define TypeScript interfaces for ScrollMetrics, EventQueue, UserProfile, NudgeResponse
    - Export all types from index.ts
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.2, 3.3, 6.4, 7.8_
  
  - [ ]* 1.3 Write unit tests for shared types
    - Test type validation and structure
    - Test edge cases for data models
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement AWS infrastructure with CDK
  - [x] 2.1 Set up AWS CDK project
    - Create packages/infrastructure directory
    - Initialize CDK app with TypeScript
    - Configure CDK context and environment variables
    - _Requirements: Infrastructure foundation_
  
  - [x] 2.2 Define DynamoDB table
    - Create MindfulBrowse table with PK (USER#userId) and SK (EVENT#timestamp or PROFILE#metadata)
    - Enable encryption at rest with AWS-managed keys
    - Configure on-demand billing mode
    - Add GSI if needed for query patterns
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 2.3 Define Cognito User Pool
    - Create Cognito User Pool for authentication
    - Configure email/password authentication
    - Set token expiration (1 hour access, 30 days refresh)
    - Create User Pool Client for Dashboard and Extension
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [x] 2.4 Define Lambda function resources
    - Create Lambda function for event processing
    - Configure Node.js 18+ runtime with 512 MB memory
    - Set 10-second timeout
    - Add IAM role with DynamoDB, Bedrock, CloudWatch permissions
    - Configure environment variables (LOG_LEVEL, TABLE_NAME, BEDROCK_MODEL_ID)
    - _Requirements: 3.1, 4.1, 6.1, 10.5_
  
  - [x] 2.5 Define API Gateway
    - Create REST API with CORS configuration
    - Define POST /events endpoint with Cognito authorizer
    - Define GET /insights endpoint with Cognito authorizer
    - Configure CloudWatch logging for access logs
    - _Requirements: 2.3, 2.4, 2.5, 10.3_
  
  - [x] 2.6 Define S3 bucket and CloudFront distribution
    - Create S3 bucket for Dashboard static hosting
    - Enable encryption at rest
    - Create CloudFront distribution with HTTPS
    - Configure cache invalidation policy
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 2.7 Add CloudWatch log groups
    - Create log group for Lambda function
    - Create log group for API Gateway
    - Set 7-day retention policy
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 3. Checkpoint - Review infrastructure configuration
  - Ensure all CDK stacks are syntactically correct
  - Verify IAM permissions are properly scoped
  - Ask the user if questions arise

- [-] 4. Implement Lambda event processing function
  - [x] 4.1 Create Lambda handler entry point
    - Set up Lambda handler function with API Gateway event parsing
    - Extract userId from Cognito authentication context
    - Route requests to processEvent or getInsights based on HTTP method
    - Implement error handling and CloudWatch logging
    - _Requirements: 2.5, 10.1, 10.2_
  
  - [x] 4.2 Implement input validation
    - Create validateBrowsingEvent function
    - Validate domain, title, timestamp, duration_seconds, scroll_count, avg_scroll_velocity
    - Throw descriptive errors for invalid inputs
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 4.3 Write unit tests for input validation
    - Test valid inputs pass validation
    - Test invalid inputs throw errors
    - Test edge cases (empty strings, negative numbers, future timestamps)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 4.4 Implement Bedrock classification
    - Create classifyContent function that calls Claude 3 Haiku
    - Format prompt with domain and title
    - Parse JSON response for sentiment and category
    - Implement 5-second timeout with Promise.race
    - Return fallback classification (neutral/other) on timeout or error
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1_
  
  - [ ]* 4.5 Write unit tests for Bedrock classification
    - Test successful classification parsing
    - Test timeout fallback behavior
    - Test error handling with invalid responses
    - Mock Bedrock client for isolated testing
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  
  - [x] 4.6 Implement short duration safeguard
    - Skip Bedrock invocation if duration_seconds < 5
    - Use neutral sentiment and other category for short events
    - Log skipped classification to CloudWatch
    - _Requirements: 4.1, 4.2, 10.1_
  
  - [x] 4.7 Implement doomscroll detection logic
    - Create groupIntoSessions function to group events by 5-minute gaps
    - Create isDoomscrollSession function checking duration > 900s, negative ratio > 0.6, news category > 0.5
    - Create checkHighScrollActivity function (avg velocity > 500 or avg scroll count > 20)
    - Create checkDomainRepetition function (> 70% same domain or > 10 events)
    - Create detectDoomscroll function that queries recent events and applies detection logic
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 4.8 Write unit tests for doomscroll detection
    - Test session grouping with various time gaps
    - Test doomscroll detection with positive and negative cases
    - Test scroll activity detection thresholds
    - Test domain repetition detection thresholds
    - Test edge cases (single event, empty sessions, boundary values)
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 4.9 Implement nudge eligibility checking
    - Create checkNudgeEligibility function
    - Query user profile from DynamoDB (PK=USER#userId, SK=PROFILE#metadata)
    - Check if nudge_count_today < 3
    - Check if (now - last_nudge_timestamp) >= 1800000 (30 minutes)
    - Check if nudge_reset_date needs updating (new day)
    - _Requirements: Nudge frequency limits from design_
  
  - [x] 4.10 Implement nudge generation with Bedrock
    - Create generateReflectionPrompt function that calls Claude 3 Sonnet
    - Format prompt with session duration
    - Parse JSON response for prompt and choices
    - Return NudgeResponse object
    - _Requirements: Nudge generation from design_
  
  - [x] 4.11 Implement nudge counter updates
    - Create updateNudgeCounter function
    - Increment nudge_count_today in user profile
    - Update last_nudge_timestamp to current time
    - Handle profile creation if it doesn't exist
    - _Requirements: Nudge frequency limits from design_
  
  - [x] 4.12 Implement DynamoDB storage with retry
    - Create storeEvent function with exponential backoff retry logic
    - Retry up to 3 times with delays: 100ms, 200ms, 400ms
    - Log errors to CloudWatch on each retry
    - Throw error after exhausting retries
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 11.5, 11.6_
  
  - [ ]* 4.13 Write unit tests for DynamoDB storage
    - Test successful storage
    - Test retry logic with transient failures
    - Test error logging after retry exhaustion
    - Mock DynamoDB client for isolated testing
    - _Requirements: 6.1, 6.5, 11.5, 11.6_
  
  - [x] 4.14 Implement complete event processing flow
    - Create processEvent function that orchestrates all steps
    - Validate input → classify content → detect doomscroll → check nudge eligibility → generate nudge → store event → update counter
    - Return response with optional nudge
    - Handle errors at each step with appropriate logging
    - _Requirements: 2.1, 3.1, 3.4, 4.1, 4.2, 4.3, 5.3, 6.1_
  
  - [ ]* 4.15 Write integration tests for event processing
    - Test complete flow from API Gateway event to DynamoDB storage
    - Test flow with doomscroll detection and nudge generation
    - Test flow with nudge limit reached (no nudge returned)
    - Use LocalStack for DynamoDB and mock Bedrock
    - _Requirements: 2.1, 3.1, 5.3, 6.1_

- [ ] 5. Implement Lambda insights retrieval function
  - [x] 5.1 Implement DynamoDB query for recent events
    - Create queryEvents function that queries by PK and SK range
    - Calculate 24-hour timestamp range (now - 86400000 to now)
    - Return array of StoredEvent objects
    - _Requirements: 7.3_
  
  - [x] 5.2 Implement insights calculation
    - Create calculateInsights function
    - Calculate total_time_seconds (sum of duration_seconds)
    - Calculate sentiment_distribution (percentage of each sentiment)
    - Calculate category_distribution (percentage of each category)
    - Count unique doomscroll sessions
    - Return InsightsResponse object
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8_
  
  - [ ]* 5.3 Write unit tests for insights calculation
    - Test calculation with various event distributions
    - Test edge cases (no events, single event, all same sentiment)
    - Test percentage calculations sum to 1.0
    - Test doomscroll session counting
    - _Requirements: 7.4, 7.5, 7.6, 7.7_
  
  - [x] 5.4 Implement getInsights handler
    - Extract userId from authentication context
    - Query events from DynamoDB
    - Calculate insights
    - Return JSON response
    - Handle errors with CloudWatch logging
    - _Requirements: 7.1, 7.2, 7.3, 7.8, 10.1_
  
  - [ ]* 5.5 Write integration tests for insights retrieval
    - Test complete flow from API Gateway to insights response
    - Test with various event data scenarios
    - Use LocalStack for DynamoDB
    - _Requirements: 7.1, 7.2, 7.3, 7.8_

- [x] 6. Checkpoint - Ensure Lambda tests pass
  - Run all unit and integration tests for Lambda functions
  - Verify test coverage meets 70% minimum
  - Ask the user if questions arise

- [ ] 7. Implement browser extension
  - [x] 7.1 Set up extension project structure
    - Create packages/browser-extension directory
    - Create manifest.json with required permissions (tabs, storage, activeTab)
    - Set up Webpack configuration for bundling
    - Configure TypeScript for extension development
    - _Requirements: Infrastructure foundation_
  
  - [x] 7.2 Implement tab activity tracking
    - Listen to chrome.tabs.onActivated for tab switches
    - Listen to chrome.tabs.onUpdated for page navigation
    - Listen to chrome.windows.onFocusChanged for window focus
    - Track current page start time, domain, title
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [x] 7.3 Implement scroll tracking
    - Inject content script to track scroll events
    - Calculate pixels scrolled and scroll event count
    - Send scroll data to background script via chrome.runtime.sendMessage
    - Update scrollMetrics in background script
    - _Requirements: Scroll tracking from design_
  
  - [x] 7.4 Implement duration calculation
    - Calculate duration on page leave or tab switch
    - Calculate average scroll velocity (pixels / duration)
    - Create BrowsingEvent object with all metadata
    - _Requirements: 1.4, 12.1, 12.2, 12.3_
  
  - [x] 7.5 Implement privacy filters
    - Create shouldTrackUrl function
    - Filter out chrome://, about://, edge://, firefox://, chrome-extension://, moz-extension://, file:// URLs
    - Only track HTTPS and HTTP URLs
    - _Requirements: 1.6, 1.7, 1.8, 1.9, 1.10_
  
  - [ ]* 7.6 Write unit tests for privacy filters
    - Test all excluded URL patterns
    - Test valid URL patterns
    - _Requirements: 1.10_
  
  - [x] 7.7 Implement event transmission
    - Create sendEvent function that POSTs to API Gateway
    - Include authentication token in Authorization header
    - Handle successful responses (200 OK)
    - Handle authentication failures (401) by prompting re-login
    - Handle server errors (500) by queueing event
    - _Requirements: 2.1, 2.2, 2.4, 11.4_
  
  - [x] 7.8 Implement local event queue
    - Create EventQueue class with enqueue, dequeue, size, flush methods
    - Store queue in chrome.storage.local
    - Limit queue size to 100 events
    - Drop oldest events when queue is full
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 7.9 Write unit tests for event queue
    - Test enqueue and dequeue operations
    - Test queue size limit enforcement
    - Test queue persistence to storage
    - _Requirements: 11.1, 11.2_
  
  - [x] 7.10 Implement queue flushing
    - Create flushQueue function that transmits queued events
    - Retry every 5 minutes with setInterval
    - Remove events from queue on successful transmission
    - Stop flushing on first failure
    - _Requirements: 11.3_
  
  - [x] 7.11 Implement periodic event transmission
    - Send event every 60 seconds for long page views
    - Reset timer and scroll metrics after each transmission
    - _Requirements: 12.1_
  
  - [x] 7.12 Implement authentication token management
    - Retrieve token from chrome.storage.sync on extension startup
    - Display message if no token exists
    - Clear invalid tokens on 401 responses
    - _Requirements: 9.3, 9.4, 9.5_
  
  - [ ]* 7.13 Write integration tests for extension
    - Test complete event capture and transmission flow
    - Test queue behavior with API unavailable
    - Mock chrome APIs for testing
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 11.1, 11.3_

- [ ] 8. Implement web dashboard
  - [x] 8.1 Set up React project with Vite
    - Create packages/web-dashboard directory
    - Initialize Vite project with React and TypeScript
    - Configure build output for S3 deployment
    - Set up routing with React Router
    - _Requirements: Infrastructure foundation_
  
  - [-] 8.2 Implement Cognito authentication flow
    - Create authentication context with React Context API
    - Implement redirect to Cognito Hosted UI for login
    - Handle OAuth callback and token extraction
    - Store token in localStorage
    - Implement logout functionality
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 8.3 Implement API client for insights
    - Create fetchInsights function that calls GET /insights
    - Include authentication token in Authorization header
    - Handle 401 responses by redirecting to login
    - Handle 500 errors with user-friendly messages
    - _Requirements: 7.1, 7.2, 9.5_
  
  - [x] 8.4 Implement insights display components
    - Create TotalTimeDisplay component (convert seconds to hours:minutes)
    - Create SentimentDistribution component (pie or bar chart)
    - Create CategoryDistribution component (pie or bar chart)
    - Create DoomscrollAlert component (highlighted count if > 0)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 8.5 Implement dashboard layout and state management
    - Create Dashboard component with loading and error states
    - Fetch insights on component mount
    - Implement manual refresh button
    - Implement auto-refresh every 60 seconds
    - Display last refresh timestamp
    - _Requirements: 8.5, 8.6_
  
  - [ ]* 8.6 Write unit tests for dashboard components
    - Test component rendering with mock data
    - Test loading and error states
    - Test time conversion logic
    - Test percentage display formatting
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 8.7 Implement responsive styling
    - Add CSS for mobile and desktop layouts
    - Ensure charts are readable on small screens
    - Add loading spinners and error messages
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 9. Checkpoint - Test end-to-end flow locally
  - Deploy infrastructure to AWS (dev environment)
  - Build and load browser extension locally
  - Build and deploy dashboard to S3/CloudFront
  - Test complete flow: browse pages → view insights in dashboard
  - Ask the user if questions arise

- [x] 10. Add deployment automation
  - [x] 10.1 Create deployment scripts
    - Create script to deploy CDK stacks
    - Create script to build and upload dashboard to S3
    - Create script to invalidate CloudFront cache
    - Create script to package extension for distribution
    - _Requirements: Infrastructure foundation_
  
  - [x] 10.2 Add environment configuration
    - Create .env files for dev, staging, prod environments
    - Configure API Gateway URLs for each environment
    - Configure Cognito User Pool IDs for each environment
    - _Requirements: Infrastructure foundation_
  
  - [x] 10.3 Document deployment process
    - Create README with setup instructions
    - Document AWS prerequisites and permissions
    - Document local development setup
    - Document testing procedures
    - _Requirements: Infrastructure foundation_

- [x] 11. Final checkpoint - Complete system validation
  - Run all unit and integration tests across all packages
  - Verify test coverage meets 70% minimum
  - Test complete user journey: install extension → browse → view dashboard
  - Verify all requirements are implemented
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Testing is integrated throughout to catch issues early
- The implementation follows a bottom-up approach: shared code → infrastructure → backend → frontend
- LocalStack is used for integration testing to avoid AWS costs during development
- All code uses TypeScript for type safety and better developer experience
