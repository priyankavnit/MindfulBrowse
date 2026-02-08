# Mindful Browse - Use Case Diagrams

## Primary Use Cases

```mermaid
graph TB
    subgraph "Actors"
        USER[User]
        ADMIN[System Admin]
        AWS[AWS Services]
    end
    
    subgraph "Core Use Cases"
        UC1[Install Browser Extension]
        UC2[Browse Web with Tracking]
        UC3[View Wellbeing Dashboard]
        UC4[Manage Privacy Settings]
        UC5[Export Personal Data]
        UC6[Delete Account Data]
    end
    
    subgraph "System Use Cases"
        UC7[Process Browsing Data]
        UC8[Calculate Wellbeing Metrics]
        UC9[Generate Insights]
        UC10[Monitor System Health]
        UC11[Backup User Data]
        UC12[Clean Up Expired Data]
    end
    
    USER --> UC1
    USER --> UC2
    USER --> UC3
    USER --> UC4
    USER --> UC5
    USER --> UC6
    
    AWS --> UC7
    AWS --> UC8
    AWS --> UC9
    AWS --> UC11
    AWS --> UC12
    
    ADMIN --> UC10
    
    UC2 --> UC7
    UC7 --> UC8
    UC8 --> UC9
    UC3 --> UC9
```

## Detailed Use Case: Browse Web with Tracking

```mermaid
sequenceDiagram
    participant U as User
    participant BE as Browser Extension
    participant BG as Background Worker
    participant API as Backend API
    participant ML as ML Services
    participant DB as Database
    
    U->>BE: Visits webpage
    BE->>BE: Extract page metadata
    BE->>BE: Perform local sentiment analysis
    BE->>BG: Queue browsing event
    
    Note over BG: Batch processing
    BG->>BG: Accumulate events
    BG->>API: Send batch (every 5 minutes)
    
    API->>ML: Process sentiment & topics
    ML-->>API: Return classifications
    API->>DB: Store processed data
    
    Note over DB: Raw content discarded
    DB->>DB: Calculate daily metrics
    DB->>DB: Set TTL for auto-cleanup
```

## Use Case: View Wellbeing Dashboard

```mermaid
graph LR
    subgraph "Dashboard Use Cases"
        LOGIN[User Login]
        VIEW[View Metrics]
        FILTER[Filter Time Range]
        EXPORT[Export Data]
        INSIGHTS[View Insights]
        SETTINGS[Privacy Settings]
    end
    
    subgraph "Metrics Displayed"
        INFO[Information Overload]
        NEG[Negative Content Bias]
        EMOT[Emotional Load Score]
        DOOM[Doomscroll Index]
        COG[Cognitive Diversity]
        MIND[Mindfulness Gap]
    end
    
    LOGIN --> VIEW
    VIEW --> INFO
    VIEW --> NEG
    VIEW --> EMOT
    VIEW --> DOOM
    VIEW --> COG
    VIEW --> MIND
    
    VIEW --> FILTER
    VIEW --> INSIGHTS
    VIEW --> EXPORT
    VIEW --> SETTINGS
```

## Privacy Control Use Cases

```mermaid
graph TB
    subgraph "Privacy Actions"
        CONSENT[Give Initial Consent]
        OPT_OUT[Opt Out of Collection]
        DELETE[Request Data Deletion]
        EXPORT_DATA[Export Personal Data]
        CHANGE_SETTINGS[Change Privacy Level]
        VIEW_COLLECTED[View What's Collected]
    end
    
    subgraph "System Responses"
        STOP_COLLECTION[Stop Data Collection]
        PURGE_DATA[Purge All User Data]
        PROVIDE_EXPORT[Provide Data Export]
        UPDATE_SETTINGS[Update Collection Rules]
        SHOW_TRANSPARENCY[Show Data Transparency]
    end
    
    CONSENT --> UPDATE_SETTINGS
    OPT_OUT --> STOP_COLLECTION
    DELETE --> PURGE_DATA
    EXPORT_DATA --> PROVIDE_EXPORT
    CHANGE_SETTINGS --> UPDATE_SETTINGS
    VIEW_COLLECTED --> SHOW_TRANSPARENCY
```

## Data Processing Use Cases

```mermaid
graph LR
    subgraph "Input Processing"
        COLLECT[Collect Metadata]
        VALIDATE[Validate Data]
        QUEUE[Queue for Processing]
    end
    
    subgraph "AI Processing"
        SENTIMENT[Analyze Sentiment]
        TOPICS[Classify Topics]
        TONE[Determine Emotional Tone]
    end
    
    subgraph "Metrics Calculation"
        CALC_INFO[Calculate Info Overload]
        CALC_NEG[Calculate Negative Bias]
        CALC_EMOT[Calculate Emotional Load]
        CALC_DOOM[Calculate Doomscroll Index]
        CALC_COG[Calculate Cognitive Diversity]
        CALC_MIND[Calculate Mindfulness Gap]
    end
    
    subgraph "Output"
        STORE[Store Daily Metrics]
        INSIGHTS[Generate Insights]
        CLEANUP[Discard Raw Data]
    end
    
    COLLECT --> VALIDATE
    VALIDATE --> QUEUE
    QUEUE --> SENTIMENT
    QUEUE --> TOPICS
    QUEUE --> TONE
    
    SENTIMENT --> CALC_INFO
    SENTIMENT --> CALC_NEG
    SENTIMENT --> CALC_EMOT
    TOPICS --> CALC_DOOM
    TOPICS --> CALC_COG
    TONE --> CALC_MIND
    
    CALC_INFO --> STORE
    CALC_NEG --> STORE
    CALC_EMOT --> STORE
    CALC_DOOM --> STORE
    CALC_COG --> STORE
    CALC_MIND --> STORE
    
    STORE --> INSIGHTS
    STORE --> CLEANUP
```

## Error Handling Use Cases

```mermaid
graph TB
    subgraph "Error Scenarios"
        NET_ERROR[Network Failure]
        AWS_ERROR[AWS Service Down]
        DATA_ERROR[Data Corruption]
        AUTH_ERROR[Authentication Failure]
    end
    
    subgraph "Recovery Actions"
        RETRY[Exponential Backoff Retry]
        QUEUE_OFFLINE[Queue for Later]
        FALLBACK[Use Fallback Service]
        NEUTRAL[Default to Neutral]
        REFRESH_TOKEN[Refresh Auth Token]
        ALERT_USER[Alert User]
    end
    
    NET_ERROR --> RETRY
    NET_ERROR --> QUEUE_OFFLINE
    
    AWS_ERROR --> FALLBACK
    AWS_ERROR --> NEUTRAL
    
    DATA_ERROR --> ALERT_USER
    DATA_ERROR --> RETRY
    
    AUTH_ERROR --> REFRESH_TOKEN
    AUTH_ERROR --> ALERT_USER
```

## System Administration Use Cases

```mermaid
graph LR
    subgraph "Admin Functions"
        MONITOR[Monitor System Health]
        SCALE[Auto-Scale Resources]
        BACKUP[Manage Backups]
        SECURITY[Security Audits]
        COMPLIANCE[Privacy Compliance]
        COSTS[Cost Optimization]
    end
    
    subgraph "Monitoring Targets"
        API_HEALTH[API Performance]
        ML_USAGE[ML Service Usage]
        STORAGE[Storage Utilization]
        ERRORS[Error Rates]
        USERS[User Activity]
    end
    
    MONITOR --> API_HEALTH
    MONITOR --> ML_USAGE
    MONITOR --> STORAGE
    MONITOR --> ERRORS
    MONITOR --> USERS
    
    SCALE --> API_HEALTH
    SCALE --> STORAGE
    
    BACKUP --> STORAGE
    SECURITY --> COMPLIANCE
    COSTS --> ML_USAGE
    COSTS --> STORAGE
```