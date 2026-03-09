#!/bin/bash

# Test AWS Bedrock Claude Haiku and Sonnet integration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Testing AWS Bedrock Integration${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Test 1: Direct Bedrock API call with Haiku
echo -e "${YELLOW}Test 1: Direct Bedrock Haiku API Call${NC}"
echo "Testing sentiment classification..."
echo ""

# Create request body file
cat > /tmp/haiku-request.json << 'EOF'
{
  "anthropic_version": "bedrock-2023-05-31",
  "max_tokens": 50,
  "messages": [
    {
      "role": "user",
      "content": "Analyze the sentiment of this title: War escalates in conflict zone. Respond with JSON: {\"sentiment\": \"positive\" | \"neutral\" | \"negative\"}"
    }
  ]
}
EOF

aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --region us-east-1 \
  --no-verify-ssl \
  --body file:///tmp/haiku-request.json \
  /tmp/haiku-response.json 2>/dev/null

HAIKU_RESPONSE=$(cat /tmp/haiku-response.json | jq -r '.content[0].text' 2>/dev/null || echo "Error parsing response")

echo "Haiku Response: $HAIKU_RESPONSE"
echo ""

if echo "$HAIKU_RESPONSE" | grep -q "negative"; then
  echo -e "${GREEN}✓ Haiku is working correctly (detected negative sentiment)${NC}"
else
  echo -e "${RED}✗ Haiku response unexpected${NC}"
  echo "Full response:"
  cat /tmp/haiku-response.json 2>/dev/null || echo "No response file"
fi
echo ""

# Test 2: Direct Bedrock API call with Sonnet
echo -e "${YELLOW}Test 2: Direct Bedrock Sonnet API Call${NC}"
echo "Testing nudge generation..."
echo ""

# Create request body file
cat > /tmp/sonnet-request.json << 'EOF'
{
  "anthropic_version": "bedrock-2023-05-31",
  "max_tokens": 150,
  "messages": [
    {
      "role": "user",
      "content": "Generate a gentle nudge for someone browsing for 15 minutes. Format as JSON: {\"prompt\": \"message\", \"choices\": [\"option1\", \"option2\"]}"
    }
  ]
}
EOF

aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-sonnet-20240229-v1:0 \
  --region us-east-1 \
  --no-verify-ssl \
  --body file:///tmp/sonnet-request.json \
  /tmp/sonnet-response.json 2>/dev/null

SONNET_RESPONSE=$(cat /tmp/sonnet-response.json | jq -r '.content[0].text' 2>/dev/null || echo "Error parsing response")

echo "Sonnet Response: $SONNET_RESPONSE"
echo ""

if echo "$SONNET_RESPONSE" | grep -q "prompt"; then
  echo -e "${GREEN}✓ Sonnet is working correctly (generated nudge)${NC}"
else
  echo -e "${RED}✗ Sonnet response unexpected${NC}"
  echo "Full response:"
  cat /tmp/sonnet-response.json 2>/dev/null || echo "No response file"
fi
echo ""

# Test 3: Lambda integration test with unknown domain (triggers Bedrock)
echo -e "${YELLOW}Test 3: Lambda Integration Test (Unknown Domain)${NC}"
echo "Sending event with unknown domain to trigger Bedrock classification..."
echo ""

API_URL="https://nqqbdhge68.execute-api.us-east-1.amazonaws.com/dev"

# Get auth token
AUTH_TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id 71cq717bep7dgsdi726r5bbkd \
  --auth-parameters USERNAME=test@mindfulbrowse.com,PASSWORD=MindfulTest123! \
  --no-verify-ssl \
  --query 'AuthenticationResult.IdToken' \
  --output text 2>/dev/null)

if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}✗ Failed to get auth token${NC}"
  exit 1
fi

# Send event with unknown domain (will trigger full Bedrock classification)
TIMESTAMP=$(date +%s)000

LAMBDA_RESPONSE=$(curl -s -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"domain\": \"unknown-test-site-$TIMESTAMP.com\",
    \"url\": \"https://unknown-test-site-$TIMESTAMP.com/war-article\",
    \"title\": \"Breaking: War escalates in conflict zone\",
    \"timestamp\": $TIMESTAMP,
    \"duration_seconds\": 30,
    \"scroll_count\": 50,
    \"avg_scroll_velocity\": 800
  }")

echo "Lambda Response: $LAMBDA_RESPONSE"
echo ""

# Wait a moment for logs to be available
sleep 2

# Check CloudWatch logs for Bedrock classification
echo -e "${YELLOW}Checking CloudWatch logs...${NC}"
LOGS=$(aws logs tail /aws/lambda/mindful-browse-processor-dev \
  --since 1m \
  --no-verify-ssl \
  2>/dev/null | grep -E "(Bedrock|classification|sentiment)" | tail -5)

echo "$LOGS"
echo ""

if echo "$LOGS" | grep -q "classification failed"; then
  echo -e "${RED}✗ Bedrock classification failed in Lambda${NC}"
  echo ""
  echo "Detailed error logs:"
  aws logs tail /aws/lambda/mindful-browse-processor-dev \
    --since 2m \
    --no-verify-ssl \
    2>/dev/null | grep -A 5 "error" | tail -20
else
  echo -e "${GREEN}✓ Lambda Bedrock integration working${NC}"
fi
echo ""

# Test 4: Test with known domain (should use heuristics, not Bedrock)
echo -e "${YELLOW}Test 4: Lambda with Known Domain (Heuristics)${NC}"
echo "Sending event with reddit.com (should use heuristics)..."
echo ""

TIMESTAMP=$(date +%s)000

curl -s -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"domain\": \"www.reddit.com\",
    \"url\": \"https://www.reddit.com/r/worldnews\",
    \"title\": \"Discussion about current events\",
    \"timestamp\": $TIMESTAMP,
    \"duration_seconds\": 30,
    \"scroll_count\": 50,
    \"avg_scroll_velocity\": 800
  }" > /dev/null

sleep 2

HEURISTIC_LOGS=$(aws logs tail /aws/lambda/mindful-browse-processor-dev \
  --since 1m \
  --no-verify-ssl \
  2>/dev/null | grep -E "(heuristic|reddit)" | tail -3)

echo "$HEURISTIC_LOGS"
echo ""

if echo "$HEURISTIC_LOGS" | grep -q "heuristic"; then
  echo -e "${GREEN}✓ Domain heuristics working (reddit.com classified without Bedrock)${NC}"
else
  echo -e "${RED}✗ Domain heuristics not working${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Test Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "1. Haiku direct API: Check output above"
echo "2. Sonnet direct API: Check output above"
echo "3. Lambda Bedrock integration: Check logs above"
echo "4. Domain heuristics: Check logs above"
echo ""
echo "For detailed logs, run:"
echo "aws logs tail /aws/lambda/mindful-browse-processor-dev --since 5m --follow --no-verify-ssl"
