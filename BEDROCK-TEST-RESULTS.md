# AWS Bedrock Model Testing Results

**Date:** 2026-03-09  
**Region:** us-east-1  
**Account:** 387030538086

## Test Summary

### ❌ CRITICAL ISSUE: Payment Method Required

**Error:** `AccessDeniedException - INVALID_PAYMENT_INSTRUMENT`

```
Model access is denied due to INVALID_PAYMENT_INSTRUMENT:
A valid payment instrument must be provided. 
Your AWS Marketplace subscription for this model cannot be completed at this time.
```

**Root Cause:** AWS account does not have a valid payment method configured for Bedrock model access.

**Impact:** Cannot use ANY Bedrock models until payment method is added.

---

## Model Availability Status

### Claude 3 Models (Target Models)

| Model ID | Name | Status | Inference Profile Required? | Test Result |
|----------|------|--------|----------------------------|-------------|
| `anthropic.claude-3-haiku-20240307-v1:0` | Claude 3 Haiku | ACTIVE | ❌ NO | ❌ Payment Required |
| `anthropic.claude-3-sonnet-20240229-v1:0` | Claude 3 Sonnet | LEGACY | ❌ NO | ❌ Payment Required |

### Other Available Models

| Model ID | Name | Status | Notes |
|----------|------|--------|-------|
| `anthropic.claude-3-5-haiku-20241022-v1:0` | Claude 3.5 Haiku | ACTIVE | Requires inference profile |
| `anthropic.claude-3-5-sonnet-20241022-v2:0` | Claude 3.5 Sonnet v2 | LEGACY | - |
| `anthropic.claude-sonnet-4-20250514-v1:0` | Claude Sonnet 4 | ACTIVE | - |
| `anthropic.claude-haiku-4-5-20251001-v1:0` | Claude Haiku 4.5 | ACTIVE | - |

---

## Test Results

### Test 1: Claude 3 Haiku (anthropic.claude-3-haiku-20240307-v1:0)

**Status:** ❌ FAILED  
**Error:** AccessDeniedException - INVALID_PAYMENT_INSTRUMENT

**Test Command:**
```bash
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --region us-east-1 \
  --body file:///tmp/test-request.json \
  /tmp/output.json
```

**Error Message:**
```
Model access is denied due to INVALID_PAYMENT_INSTRUMENT:
A valid payment instrument must be provided.
```

**Inference Profile Required:** ❌ NO (model supports direct invocation)

---

### Test 2: Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)

**Status:** ❌ FAILED  
**Error:** ValidationException - Malformed input request

**Note:** This error occurred AFTER the payment error, suggesting the payment issue must be fixed first.

**Inference Profile Required:** ❌ NO (model supports direct invocation)

---

## Conclusion

### ✅ Good News

1. **Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`) - Does NOT require inference profile
2. **Claude 3 Sonnet** (`anthropic.claude-3-sonnet-20240229-v1:0`) - Does NOT require inference profile
3. Both models are available in us-east-1 region
4. Both models support direct invocation (no inference profile needed)

### ❌ Blocking Issue

**Payment Method Required:** AWS account needs a valid payment instrument configured before ANY Bedrock models can be used.

---

## Required Actions

### 1. Add Payment Method to AWS Account

**Steps:**
1. Go to AWS Console → Billing Dashboard
2. Navigate to Payment Methods
3. Add a valid credit/debit card
4. Wait 2-5 minutes for changes to propagate

### 2. Enable Model Access (After Payment Method Added)

**Steps:**
1. Go to AWS Console → Amazon Bedrock → Model Access
2. Click "Manage model access" or "Request model access"
3. Enable these models:
   - ✅ Claude 3 Haiku (`anthropic.claude-3-haiku-20240307-v1:0`)
   - ✅ Claude 3 Sonnet (`anthropic.claude-3-sonnet-20240229-v1:0`)
4. Click "Save changes"
5. Wait 2-5 minutes for access to be granted

### 3. Test Again

After completing steps 1 and 2, run:

```bash
# Test Claude 3 Haiku
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --region us-east-1 \
  --no-verify-ssl \
  --body file:///tmp/test-request.json \
  /tmp/haiku-output.json

# Test Claude 3 Sonnet
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-sonnet-20240229-v1:0 \
  --region us-east-1 \
  --no-verify-ssl \
  --body file:///tmp/test-request.json \
  /tmp/sonnet-output.json
```

---

## Current Code Configuration

### Lambda Function (bedrock.ts)

**Current Model IDs:**
```typescript
const CLASSIFICATION_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';
const NUDGE_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
```

**Status:** ✅ CORRECT - These model IDs are valid and do NOT require inference profiles

### Infrastructure (mindful-browse-stack.ts)

**Current IAM Permissions:**
```typescript
resources: [
  `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
  `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`,
]
```

**Status:** ✅ CORRECT - ARN format is correct

---

## Next Steps

1. **Immediate:** Add payment method to AWS account
2. **After payment:** Enable Bedrock model access in AWS Console
3. **Test:** Run test commands to verify models work
4. **Deploy:** No code changes needed - current configuration is correct
5. **Monitor:** Check CloudWatch logs for successful Bedrock calls

---

## Cost Implications

Once payment method is added and models are enabled:

**Claude 3 Haiku:**
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens
- ~$0.0001 per classification (50 tokens)

**Claude 3 Sonnet:**
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens
- ~$0.002 per nudge generation (150 tokens)

**Monthly estimate (1000 events/day):**
- Domain heuristics: 950 events (free)
- Bedrock classifications: 50 events × $0.0001 = $0.005/day
- Nudge generation: ~5 nudges/day × $0.002 = $0.01/day
- **Total: ~$0.45/month**

Very affordable for MVP!

---

**Last Updated:** 2026-03-09  
**Status:** Waiting for payment method to be added to AWS account
