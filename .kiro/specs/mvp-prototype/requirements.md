# Requirements Document

## Introduction

The MVP Prototype is a simplified version of the Mindful Browse digital wellbeing platform. It provides users with awareness of their browsing patterns and emotional content consumption through minimal data collection, AI-powered sentiment analysis, and simple doomscrolling detection. The prototype focuses on core functionality using serverless AWS architecture to enable rapid development and low operational costs.

## Glossary

- **Browser_Extension**: The client-side component that captures browsing metadata from the user's web browser
- **API_Gateway**: AWS service that receives browsing events from the Browser_Extension
- **Lambda_Function**: AWS serverless compute service that processes browsing events
- **Bedrock_Service**: Amazon Bedrock AI service that classifies content sentiment and category
- **DynamoDB_Table**: AWS NoSQL database that stores browsing events and analysis results
- **Dashboard**: Web application that displays browsing insights to users
- **Browsing_Event**: A record containing domain, page_title, timestamp, and duration_seconds
- **Sentiment**: Classification of content as positive, neutral, or negative
- **Category**: Classification of content as news, social, entertainment, education, or other
- **Doomscroll_Session**: A browsing session exceeding 15 minutes with negative content ratio above 0.6 in news category
- **Cognito_Service**: AWS authentication service that manages user identity
- **CloudWatch_Service**: AWS monitoring service that logs system events

## Requirements

### Requirement 1: Capture Browsing Metadata

**User Story:** As a user, I want the browser extension to capture my browsing activity, so that I can understand my content consumption patterns.

#### Acceptance Criteria

1. WHEN a user navigates to a new page, THE Browser_Extension SHALL capture the domain name
2. WHEN a user navigates to a new page, THE Browser_Extension SHALL capture the page title
3. WHEN a user navigates to a new page, THE Browser_Extension SHALL capture the timestamp
4. WHEN a user leaves a page, THE Browser_Extension SHALL calculate the duration_seconds spent on that page
5. THE Browser_Extension SHALL count browsing time only when the tab is active and the browser window is focused
6. THE Browser_Extension SHALL NOT capture full page content
7. THE Browser_Extension SHALL NOT capture passwords
8. THE Browser_Extension SHALL NOT capture personal messages
9. THE Browser_Extension SHALL NOT capture credentials
10. THE Browser_Extension SHALL ignore internal browser pages such as chrome:// URLs

### Requirement 2: Transmit Browsing Events

**User Story:** As a user, I want my browsing data to be analyzed, so that I can receive insights about my content consumption.

#### Acceptance Criteria

1. WHEN the Browser_Extension captures a Browsing_Event, THE Browser_Extension SHALL transmit the event to the API_Gateway
2. WHEN transmitting a Browsing_Event, THE Browser_Extension SHALL include the user authentication token
3. WHEN the API_Gateway receives a Browsing_Event, THE API_Gateway SHALL validate the authentication token with Cognito_Service
4. IF authentication fails, THEN THE API_Gateway SHALL return a 401 error code
5. WHEN the API_Gateway validates authentication, THE API_Gateway SHALL forward the event to the Lambda_Function

### Requirement 3: Classify Content Sentiment

**User Story:** As a user, I want my browsing content to be analyzed for emotional tone, so that I can understand the emotional impact of my content consumption.

#### Acceptance Criteria

1. WHEN the Lambda_Function receives a Browsing_Event, THE Lambda_Function SHALL send the domain and page_title to Bedrock_Service
2. WHEN Bedrock_Service analyzes content, THE Bedrock_Service SHALL classify sentiment as positive, neutral, or negative
3. WHEN Bedrock_Service analyzes content, THE Bedrock_Service SHALL classify category as news, social, entertainment, education, or other
4. WHEN Bedrock_Service returns classification results, THE Lambda_Function SHALL add sentiment and category to the Browsing_Event
5. IF Bedrock_Service fails to respond within 5 seconds, THEN THE Lambda_Function SHALL classify sentiment as neutral and category as other

### Requirement 4: Limit AI Analysis Frequency

**User Story:** As a system operator, I want to limit how frequently AI analysis is executed so that operational costs remain predictable during MVP operation.

#### Acceptance Criteria

1. WHEN the Lambda_Function receives a Browsing_Event, THE Lambda_Function SHALL perform AI classification only once per browsing event

2. THE Lambda_Function SHALL NOT repeatedly call Bedrock_Service for the same event

3. THE Lambda_Function SHALL store the AI classification result together with the Browsing_Event in DynamoDB_Table

4. WHEN retrieving browsing insights, THE Lambda_Function SHALL use stored classification data instead of calling Bedrock_Service again

5. THE System SHALL ensure that Bedrock_Service is invoked only during event processing and not during dashboard queries

### Requirement 5: Detect Doomscrolling Patterns

**User Story:** As a user, I want to be alerted when I engage in doomscrolling behavior, so that I can make more mindful browsing choices.

#### Acceptance Criteria

1. WHEN the Lambda_Function processes Browsing_Events, THE Lambda_Function SHALL group them into Browsing_Sessions

2. A Browsing_Session SHALL be defined as consecutive events where the time gap between events is less than 5 minutes

3. WHEN the total duration of a Browsing_Session exceeds 900 seconds AND the negative sentiment ratio exceeds 0.6 AND the category equals news

4. THE Lambda_Function SHALL mark the session as doomscroll_flag = true

### Requirement 6: Store Browsing Events

**User Story:** As a user, I want my browsing data to be stored securely, so that I can review my patterns over time.

#### Acceptance Criteria

1. WHEN the Lambda_Function completes event processing, THE Lambda_Function SHALL store the Browsing_Event in DynamoDB_Table

2. WHEN storing a Browsing_Event, THE Lambda_Function SHALL use partition key format USER#userId

3. WHEN storing a Browsing_Event, THE Lambda_Function SHALL use sort key format EVENT#timestamp

4. WHEN storing a Browsing_Event, THE Lambda_Function SHALL include attributes:

- userId
- timestamp
- domain
- duration_seconds
- sentiment
- category
- doomscroll_flag

5. IF DynamoDB_Table storage fails, THEN THE Lambda_Function SHALL log the error to CloudWatch_Service

### Requirement 7: Retrieve Browsing Insights

**User Story:** As a user, I want to view aggregated insights about my browsing behavior, so that I can understand my content consumption patterns.

#### Acceptance Criteria

1. WHEN the Dashboard requests insights, THE Dashboard SHALL send an authenticated request to the API_Gateway
2. WHEN the API_Gateway receives an insights request, THE API_Gateway SHALL forward the request to the Lambda_Function
3. WHEN the Lambda_Function receives an insights request, THE Lambda_Function SHALL query DynamoDB_Table for the user's events from the past 24 hours
4. WHEN the Lambda_Function retrieves events, THE Lambda_Function SHALL calculate total browsing time in seconds
5. WHEN the Lambda_Function retrieves events, THE Lambda_Function SHALL calculate sentiment distribution as percentages
6. WHEN the Lambda_Function retrieves events, THE Lambda_Function SHALL calculate category distribution as percentages
7. WHEN the Lambda_Function retrieves events, THE Lambda_Function SHALL count doomscroll sessions
8. WHEN the Lambda_Function completes calculations, THE Lambda_Function SHALL return insights in JSON format

### Requirement 8: Display Browsing Insights

**User Story:** As a user, I want to see visual representations of my browsing patterns, so that I can quickly understand my content consumption habits.

#### Acceptance Criteria

1. WHEN the Dashboard receives insights data, THE Dashboard SHALL display total daily browsing time in hours and minutes
2. WHEN the Dashboard receives insights data, THE Dashboard SHALL display sentiment distribution as a percentage breakdown
3. WHEN the Dashboard receives insights data, THE Dashboard SHALL display category distribution as a percentage breakdown
4. WHEN doomscroll sessions exceed zero, THE Dashboard SHALL display a doomscroll alert count
5. WHEN the Dashboard loads THE Dashboard SHALL request insights from the API
6. WHEN the user manually refreshes THE Dashboard SHALL request updated insights

WHEN the user manually refreshes
THE Dashboard SHALL request updated insights

### Requirement 9: Authenticate Users

**User Story:** As a user, I want to securely access my browsing insights, so that my data remains private.

#### Acceptance Criteria

1. WHEN a user accesses the Dashboard, THE Dashboard SHALL redirect unauthenticated users to Cognito_Service login
2. WHEN a user completes authentication, THE Cognito_Service SHALL issue an authentication token
3. WHEN the Dashboard receives an authentication token, THE Dashboard SHALL store the token securely
4. WHEN the Browser_Extension starts, THE Browser_Extension SHALL retrieve the authentication token from secure storage
5. IF an authentication token expires, THEN THE Dashboard SHALL redirect the user to Cognito_Service login

### Requirement 10: Log System Events

**User Story:** As a developer, I want system events to be logged, so that I can troubleshoot issues and monitor system health.

#### Acceptance Criteria

1. WHEN the Lambda_Function processes a Browsing_Event, THE Lambda_Function SHALL log the event to CloudWatch_Service
2. WHEN the Lambda_Function encounters an error, THE Lambda_Function SHALL log the error details to CloudWatch_Service
3. WHEN the API_Gateway receives a request, THE API_Gateway SHALL log the request metadata to CloudWatch_Service
4. WHEN Bedrock_Service classification fails, THE Lambda_Function SHALL log the failure to CloudWatch_Service
5. THE System SHALL allow logging verbosity to be controlled using an environment variable such as LOG_LEVEL.
6. Logging verbosity SHALL be configurable so that verbose logs can be enabled during development and reduced in production environments.


### Requirement 11: Handle Service Failures

**User Story:** As a user, I want the system to handle failures gracefully, so that temporary issues do not prevent me from browsing.

#### Acceptance Criteria

1. IF the API_Gateway is unavailable, THEN THE Browser_Extension SHALL queue events locally for up to 100 events. 
2. The Browser_Extension SHALL store queued events in local browser storage.
3. WHEN the API_Gateway becomes available, THE Browser_Extension SHALL transmit queued events
4. IF the Lambda_Function fails to process an event, THEN THE API_Gateway SHALL return a 500 error code
5. IF DynamoDB_Table is unavailable, THEN THE Lambda_Function SHALL retry the operation up to 3 times with exponential backoff
6. WHEN all retry attempts fail, THE Lambda_Function SHALL log the failure to CloudWatch_Service

### Requirement 12: Browser Extension data transmission frequency

1. WHEN a user remains on a page
THE Browser_Extension SHALL send browsing events every 60 seconds

2. WHEN a user switches tabs or leaves a page
THE Browser_Extension SHALL immediately transmit the event

3. THE Browser_Extension SHALL track browsing activity only for the currently active tab

### Requirement 13: Serve Dashboard Content

**User Story:** As a user, I want to access the dashboard quickly from anywhere, so that I can review my insights conveniently.

#### Acceptance Criteria

1. THE Dashboard SHALL be hosted on Amazon S3
2. THE Dashboard SHALL be distributed through Amazon CloudFront
3. WHEN a user requests the Dashboard, THE CloudFront SHALL serve cached content within 200 milliseconds
4. WHEN Dashboard files are updated, THE CloudFront SHALL invalidate the cache within 5 minutes

