#!/bin/bash

# Test script to send a browsing event to the API

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Testing Event Submission to API${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get the auth token from the test user
STACK_NAME="MindfulBrowseStack-dev"
USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text \
    --no-verify-ssl)

CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text \
    --no-verify-ssl)

API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text \
    --no-verify-ssl)

echo "Getting auth token..."
TOKEN=$(aws cognito-idp initiate-auth \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id $CLIENT_ID \
    --auth-parameters USERNAME=test@mindfulbrowse.com,PASSWORD=MindfulTest123! \
    --query 'AuthenticationResult.IdToken' \
    --output text \
    --no-verify-ssl)

echo -e "${GREEN}✓ Token obtained${NC}"
echo ""

# Create a test event
TIMESTAMP=$(date +%s)000
EVENT_DATA='{
  "domain": "cnn.com",
  "title": "Breaking News - Test Article",
  "timestamp": '$TIMESTAMP',
  "duration_seconds": 45,
  "scroll_count": 12,
  "avg_scroll_velocity": 350
}'

echo "Sending test event to API..."
echo "API URL: ${API_URL}events"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EVENT_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Event sent successfully!${NC}"
    echo ""
    echo "Check DynamoDB table 'MindfulBrowse-dev' for the event"
else
    echo -e "${RED}✗ Failed to send event${NC}"
    exit 1
fi
