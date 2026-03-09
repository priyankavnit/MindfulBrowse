# Mindful Browse - Cost Analysis & Optimization

## Table of Contents
1. [Per-Event Cost Breakdown](#per-event-cost-breakdown)
2. [Daily Usage Analysis](#daily-usage-analysis)
3. [Monthly Cost Projections](#monthly-cost-projections)
4. [Cost Optimization Strategies](#cost-optimization-strategies)
5. [Future Recommendations](#future-recommendations)

---

## Per-Event Cost Breakdown

### Scenario 1: Normal Event (Duration > 5 seconds)

**User browses CNN.com for 5 minutes**

| Operation | Count | Unit Cost | Total Cost |
|-----------|-------|-----------|------------|
| **DynamoDB Query** (recent events) | 1 | $0.00000025 | $0.00000025 |
| **DynamoDB PutItem** (store event) | 1 | $0.00000125 | $0.00000125 |
| **Claude 3 Haiku** (classification) | 1 | $0.000025 | $0.000025 |
| **Total** | | | **$0.0000265** |

**What happens:**
- Query last 30 minutes of events
- Call Claude Haiku for sentiment + category
- Store event with classification
- No doomscroll detected

---

### Scenario 2: Short Event (Duration < 5 seconds)

**User quickly clicks through a page**

| Operation | Count | Unit Cost | Total Cost |
|-----------|-------|-----------|------------|
| **DynamoDB Query** (recent events) | 1 | $0.00000025 | $0.00000025 |
| **DynamoDB PutItem** (store event) | 1 | $0.00000125 | $0.00000125 |
| **Claude 3 Haiku** | 0 | $0 | $0 |
| **Total** | | | **$0.0000015** |

**What happens:**
- Query last 30 minutes of events
- Skip Claude (cost optimization)
- Use default: sentiment='neutral', category='other'
- Store event

**Savings: 94% cheaper than normal event!**

---

### Scenario 3: Doomscroll Detected + Nudge Eligible

**User has been doomscrolling, eligible for nudge**

| Operation | Count | Unit Cost | Total Cost |
|-----------|-------|-----------|------------|
| **DynamoDB Query** (recent events) | 1 | $0.00000025 | $0.00000025 |
| **DynamoDB GetItem** (user profile) | 1 | $0.00000025 | $0.00000025 |
| **DynamoDB PutItem** (store event) | 1 | $0.00000125 | $0.00000125 |
| **DynamoDB UpdateItem** (nudge counter) | 1 | $0.00000125 | $0.00000125 |
| **Claude 3 Haiku** (classification) | 1 | $0.000025 | $0.000025 |
| **Claude 3 Sonnet** (nudge generation) | 1 | $0.00003 | $0.00003 |
| **Total** | | | **$0.000058** |

**What happens:**
- Query last 30 minutes of events
- Call Claude Haiku for classification
- Detect doomscroll pattern
- Check user profile for nudge eligibility
- Call Claude Sonnet to generate personalized nudge
- Store event
- Update nudge counter

**Most expensive scenario (2x normal event cost)**

---

### Scenario 4: Doomscroll Detected + NOT Eligible

**User has been doomscrolling, but already got 3 nudges today**

| Operation | Count | Unit Cost | Total Cost |
|-----------|-------|-----------|------------|
| **DynamoDB Query** (recent events) | 1 | $0.00000025 | $0.00000025 |
| **DynamoDB GetItem** (user profile) | 1 | $0.00000025 | $0.00000025 |
| **DynamoDB PutItem** (store event) | 1 | $0.00000125 | $0.00000125 |
| **Claude 3 Haiku** (classification) | 1 | $0.000025 | $0.000025 |
| **Total** | | | **$0.0000278** |

**What happens:**
- Query last 30 minutes of events
- Call Claude Haiku for classification
- Detect doomscroll pattern
- Check user profile (finds limit reached)
- Skip nudge generation (not eligible)
- Store event
- No counter update

---

## Daily Usage Analysis

### Typical User Day (100 Events)

**Assumptions:**
- 100 browsing events per day
- 70 events > 5 seconds (Claude classification)
- 30 events < 5 seconds (skip Claude)
- 5 doomscroll detections
- 3 nudges generated (daily limit)
- 2 doomscroll detections without nudge (limit reached)

### DynamoDB Operations

| Operation Type | Count | Unit Cost | Total Cost |
|----------------|-------|-----------|------------|
| **Query** (recent events) | 100 | $0.00000025 | $0.000025 |
| **GetItem** (user profile) | 5 | $0.00000025 | $0.00000125 |
| **PutItem** (store events) | 100 | $0.00000125 | $0.000125 |
| **UpdateItem** (nudge counter) | 3 | $0.00000125 | $0.00000375 |
| **Total DynamoDB** | **208 ops** | | **$0.0001525** |

### Claude API Calls

| Model | Count | Unit Cost | Total Cost |
|-------|-------|-----------|------------|
| **Haiku** (classification) | 70 | $0.000025 | $0.00175 |
| **Sonnet** (nudge generation) | 3 | $0.00003 | $0.00009 |
| **Total Claude** | **73 calls** | | **$0.00184** |

### Lambda Invocations

| Operation | Count | Unit Cost | Total Cost |
|-----------|-------|-----------|------------|
| **Lambda invocations** | 100 | $0.0000002 | $0.00002 |
| **Lambda compute** (512MB, 2s avg) | 100 | $0.0000167 | $0.00167 |
| **Total Lambda** | | | **$0.00169** |

### API Gateway

| Operation | Count | Unit Cost | Total Cost |
|-----------|-------|-----------|------------|
| **API requests** | 100 | $0.0000035 | $0.00035 |
| **Total API Gateway** | | | **$0.00035** |

### Daily Cost Per User Summary

| Service | Daily Cost |
|---------|------------|
| DynamoDB | $0.0001525 |
| Claude (Haiku + Sonnet) | $0.00184 |
| Lambda | $0.00169 |
| API Gateway | $0.00035 |
| **Total Per User/Day** | **$0.00403** |

**Monthly Cost Per User: ~$0.12**

---

## Monthly Cost Projections

### 100 Users

| Service | Monthly Usage | Monthly Cost |
|---------|---------------|--------------|
| **DynamoDB** | 624K operations | $4.58 |
| **Claude Haiku** | 210K calls | $52.50 |
| **Claude Sonnet** | 9K calls | $27.00 |
| **Lambda** | 300K invocations | $50.70 |
| **API Gateway** | 300K requests | $10.50 |
| **CloudFront + S3** | 100 users | $5.00 |
| **CloudWatch Logs** | 7-day retention | $2.00 |
| **Cognito** | 100 MAU | $0.00 (free tier) |
| **Total** | | **$152.28** |

**Cost per user: $1.52/month**

---

### 1,000 Users

| Service | Monthly Usage | Monthly Cost |
|---------|---------------|--------------|
| **DynamoDB** | 6.24M operations | $45.76 |
| **Claude Haiku** | 2.1M calls | $525.00 |
| **Claude Sonnet** | 90K calls | $270.00 |
| **Lambda** | 3M invocations | $507.00 |
| **API Gateway** | 3M requests | $105.00 |
| **CloudFront + S3** | 1K users | $30.00 |
| **CloudWatch Logs** | 7-day retention | $15.00 |
| **Cognito** | 1K MAU | $27.50 |
| **Total** | | **$1,525.26** |

**Cost per user: $1.53/month**

---

### 10,000 Users

| Service | Monthly Usage | Monthly Cost |
|---------|---------------|--------------|
| **DynamoDB** | 62.4M operations | $457.60 |
| **Claude Haiku** | 21M calls | $5,250.00 |
| **Claude Sonnet** | 900K calls | $2,700.00 |
| **Lambda** | 30M invocations | $5,070.00 |
| **API Gateway** | 30M requests | $1,050.00 |
| **CloudFront + S3** | 10K users | $200.00 |
| **CloudWatch Logs** | 7-day retention | $100.00 |
| **Cognito** | 10K MAU | $275.00 |
| **Total** | | **$15,102.60** |

**Cost per user: $1.51/month**

**Note: Cost per user remains stable due to economies of scale**

---

## Cost Optimization Strategies

### 1. Short Event Optimization ✅ (Already Implemented)

**Strategy:**
```typescript
if (duration_seconds < 5) {
  // Skip Claude Haiku call
  sentiment = 'neutral';
  category = 'other';
}
```

**Impact:**
- Saves 30% of Claude Haiku calls
- Reduces cost by ~$0.0075 per user/day
- **Monthly savings: $7.50 per 1K users**

**Rationale:** Events under 5 seconds are typically page transitions, not meaningful content consumption.

---

### 2. Nudge Frequency Limits ✅ (Already Implemented)

**Strategy:**
```typescript
// Maximum 3 nudges per day
// Minimum 30 minutes between nudges
if (nudge_count_today >= 3) {
  return false; // Not eligible
}
if (time_since_last_nudge < 30 * 60 * 1000) {
  return false; // Too soon
}
```

**Impact:**
- Prevents excessive Sonnet calls
- Prevents user nudge fatigue
- Limits Sonnet calls to 3 per user per day
- **Saves ~$0.00027 per user/day**

**Rationale:** More nudges don't mean better outcomes. Gentle, spaced interventions are more effective.

---

### 3. Bedrock Timeout with Fallback ✅ (Already Implemented)

**Strategy:**
```typescript
const classification = await Promise.race([
  invokeBedrockClassification(prompt),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 5000)
  )
]);

// Fallback on timeout
catch (error) {
  return { sentiment: 'neutral', category: 'other' };
}
```

**Impact:**
- Prevents Lambda timeout (10s limit)
- Avoids paying for slow Bedrock calls
- Maintains user experience
- **Saves ~$0.001 per timeout event**

**Rationale:** Fast response is better than perfect classification.

---

### 4. DynamoDB On-Demand Pricing ✅ (Already Implemented)

**Strategy:**
- Use on-demand billing instead of provisioned capacity
- No idle costs
- Auto-scales with usage

**Impact:**
- No minimum monthly cost
- Pay only for actual usage
- **Saves ~$25/month for low-traffic periods**

**Rationale:** MVP usage is unpredictable. On-demand is more cost-effective.

---

## Future Recommendations

### Priority 1: Batch Event Processing (High Impact)

**Current State:**
```
1 event → 1 Lambda invocation → 1 DynamoDB write
100 events → 100 Lambda invocations → 100 DynamoDB writes
```

**Proposed:**
```
10 events → 1 Lambda invocation → 1 DynamoDB batch write
100 events → 10 Lambda invocations → 10 DynamoDB batch writes
```

**Implementation:**
- Buffer events in browser extension (5-10 events)
- Send batch to API
- Lambda processes batch
- Use DynamoDB BatchWriteItem (25 items max)

**Expected Savings:**
- Lambda invocations: 90% reduction
- API Gateway requests: 90% reduction
- DynamoDB writes: Same (but faster)
- **Monthly savings: ~$50 per 1K users**

**Trade-offs:**
- Slight delay in real-time insights (5-10 min)
- More complex error handling
- Larger Lambda payload

**Recommendation:** Implement for production, keep single-event for MVP

---

### Priority 2: User Profile Caching (Medium Impact)

**Current State:**
```
Every doomscroll detection:
  → GetItem from DynamoDB (user profile)
  → Check nudge eligibility
  → UpdateItem to DynamoDB
```

**Proposed:**
```
Lambda warm start:
  → Load user profile into memory
  → Cache for 5 minutes
  → Only GetItem if cache miss or expired
```

**Implementation:**
- Use Lambda global variables
- Cache user profile for 5 minutes
- Invalidate on UpdateItem

**Expected Savings:**
- DynamoDB reads: 50% reduction
- **Monthly savings: ~$2 per 1K users**

**Trade-offs:**
- Potential stale data (5 min window)
- More complex cache invalidation
- Lambda memory usage

**Recommendation:** Implement after batch processing

---

### Priority 3: Claude Haiku Prompt Optimization (Medium Impact)

**Current Prompt:**
```
Analyze this web page and classify it:
Domain: cnn.com
URL: https://cnn.com/article/...
Title: Breaking News Article

Respond with JSON only:
{
  "sentiment": "positive" | "neutral" | "negative",
  "category": "news" | "social" | "entertainment" | "education" | "other"
}
```

**Optimized Prompt:**
```
Classify:
Domain: cnn.com
Title: Breaking News

JSON:
{"sentiment":"positive|neutral|negative","category":"news|social|entertainment|education|other"}
```

**Expected Savings:**
- Token count: 50% reduction (100 → 50 tokens)
- **Monthly savings: ~$26 per 1K users**

**Trade-offs:**
- Slightly less context for AI
- May reduce classification accuracy by 2-3%

**Recommendation:** A/B test before full rollout

---

### Priority 4: Intelligent Classification Skipping (High Impact)

**Current State:**
```
if (duration < 5 seconds) {
  skip Claude
}
```

**Proposed:**
```
if (duration < 5 seconds) {
  skip Claude
}
else if (domain in KNOWN_DOMAINS) {
  // Use cached classification for known domains
  sentiment = DOMAIN_CACHE[domain].sentiment
  category = DOMAIN_CACHE[domain].category
}
else {
  call Claude
}
```

**Implementation:**
- Maintain domain classification cache
- Cache popular domains (top 100)
- Update cache weekly
- Example: cnn.com → always "news" + "negative"

**Expected Savings:**
- Claude Haiku calls: 40% reduction (for repeat domains)
- **Monthly savings: ~$210 per 1K users**

**Trade-offs:**
- Less accurate for specific articles
- Cache maintenance overhead
- Storage for domain cache

**Recommendation:** High ROI, implement after MVP validation

---

### Priority 5: DynamoDB TTL for Old Events (Low Impact)

**Current State:**
- Events stored forever
- Dashboard only shows last 24 hours
- Old data accumulates

**Proposed:**
```
Add TTL attribute to events:
  ttl_timestamp = event.timestamp + 30 days

DynamoDB automatically deletes after 30 days
```

**Implementation:**
- Add TTL attribute to StoredEvent
- Enable TTL on DynamoDB table
- Set expiration to 30 days

**Expected Savings:**
- Storage costs: 90% reduction
- **Monthly savings: ~$5 per 1K users**

**Trade-offs:**
- Cannot analyze historical data beyond 30 days
- No long-term trend analysis

**Recommendation:** Implement for production, keep longer retention for MVP

---

### Priority 6: Regional Deployment (Low Impact, High Complexity)

**Current State:**
- Single region deployment (us-east-1)
- Global users experience latency

**Proposed:**
- Multi-region deployment
- Route users to nearest region
- Replicate DynamoDB globally

**Expected Savings:**
- Faster response times (not cost savings)
- Better user experience
- **Cost increase: ~$50/month for replication**

**Trade-offs:**
- Increased complexity
- Higher costs
- Data consistency challenges

**Recommendation:** Only for scale (10K+ users)

---

### Priority 7: Reserved Lambda Capacity (Medium Impact, High Scale Only)

**Current State:**
- On-demand Lambda pricing
- $0.0000167 per GB-second

**Proposed:**
- Reserved capacity for predictable workloads
- 1-year commitment
- 30% discount

**Expected Savings:**
- Lambda costs: 30% reduction
- **Monthly savings: ~$150 per 10K users**

**Trade-offs:**
- Requires 1-year commitment
- Only beneficial at scale (10K+ users)
- Less flexibility

**Recommendation:** Only after reaching 10K users

---

## Cost Optimization Roadmap

### Phase 1: MVP (Current)
- ✅ Short event optimization
- ✅ Nudge frequency limits
- ✅ Bedrock timeout with fallback
- ✅ DynamoDB on-demand pricing

**Current cost: $1.53 per user/month**

---

### Phase 2: Production (1K+ users)
- 🔄 Batch event processing
- 🔄 User profile caching
- 🔄 DynamoDB TTL for old events

**Target cost: $1.20 per user/month (22% reduction)**

---

### Phase 3: Scale (10K+ users)
- 🔄 Intelligent classification skipping
- 🔄 Claude prompt optimization
- 🔄 Reserved Lambda capacity

**Target cost: $0.85 per user/month (44% reduction)**

---

### Phase 4: Enterprise (100K+ users)
- 🔄 Regional deployment
- 🔄 Custom ML models (replace Claude)
- 🔄 DynamoDB provisioned capacity

**Target cost: $0.50 per user/month (67% reduction)**

---

## Cost Comparison by Scale

| Users | Current Cost/User | Optimized Cost/User | Monthly Savings |
|-------|-------------------|---------------------|-----------------|
| 100 | $1.52 | $1.52 | $0 (MVP) |
| 1,000 | $1.53 | $1.20 | $330 |
| 10,000 | $1.51 | $0.85 | $6,600 |
| 100,000 | $1.50 | $0.50 | $100,000 |

---

## Key Takeaways

1. **Claude is the biggest cost** (60% of total)
   - Optimize prompts
   - Cache common classifications
   - Skip when possible

2. **Batch processing has highest ROI**
   - 90% reduction in Lambda/API Gateway costs
   - Minimal trade-offs
   - Implement early

3. **Current optimizations are effective**
   - Short event skipping saves 30% on Claude
   - Nudge limits prevent runaway costs
   - On-demand pricing is cost-effective for MVP

4. **Scale brings efficiency**
   - Cost per user decreases with volume
   - Reserved capacity becomes viable
   - Custom solutions become cost-effective

5. **Don't over-optimize too early**
   - Current cost ($1.53/user/month) is reasonable
   - Focus on product-market fit first
   - Optimize when you have 1K+ users

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Next Review:** After reaching 1,000 users
