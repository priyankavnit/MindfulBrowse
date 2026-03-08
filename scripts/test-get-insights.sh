#!/bin/bash

# Test script to get insights from the API

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Testing Insights Retrieval from API${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get the auth token from the test user
STACK_NAME="MindfulBrowseStack-dev"
USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text \
    --no-verify-ssl 2>&1 | grep -v "InsecureRequestWarning" | grep -v "urllib3")

CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text \
    --no-verify-ssl 2>&1 | grep -v "InsecureRequestWarning" | grep -v "urllib3")

API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text \
    --no-verify-ssl 2>&1 | grep -v "InsecureRequestWarning" | grep -v "urllib3")

echo "Getting auth token..."
TOKEN=$(aws cognito-idp initiate-auth \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id $CLIENT_ID \
    --auth-parameters USERNAME=test@mindfulbrowse.com,PASSWORD=MindfulTest123! \
    --query 'AuthenticationResult.IdToken' \
    --output text \
    --no-verify-ssl 2>&1 | grep -v "InsecureRequestWarning" | grep -v "urllib3")

echo -e "${GREEN}✓ Token obtained${NC}"
echo ""

echo "Getting insights from API..."
echo "API URL: ${API_URL}insights"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}insights" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Insights retrieved successfully!${NC}"
else
    echo -e "${RED}✗ Failed to get insights${NC}"
    exit 1
fi
