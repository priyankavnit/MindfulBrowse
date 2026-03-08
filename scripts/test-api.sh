#!/bin/bash

# Mindful Browse - API Testing Script
# This script tests the API endpoints

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment (default: dev)
ENVIRONMENT=${1:-dev}
TOKEN=${2}

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: Authentication token required${NC}"
    echo "Usage: ./test-api.sh [environment] [token]"
    echo ""
    echo "Get a token with: ./create-test-user.sh"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Testing Mindful Browse API${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get API URL
STACK_NAME="MindfulBrowseStack-$ENVIRONMENT"
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

echo "API URL: $API_URL"
echo ""

# Test POST /events
echo -e "${YELLOW}Testing POST /events...${NC}"
TIMESTAMP=$(date +%s000)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/events \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"domain\": \"example.com\",
        \"title\": \"Test Article - $(date)\",
        \"timestamp\": $TIMESTAMP,
        \"duration_seconds\": 60,
        \"scroll_count\": 10,
        \"avg_scroll_velocity\": 200
    }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ POST /events successful (200 OK)${NC}"
    if [ ! -z "$BODY" ]; then
        echo "Response: $BODY"
    fi
else
    echo -e "${RED}✗ POST /events failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Wait a moment for event to be processed
sleep 2

# Test GET /insights
echo -e "${YELLOW}Testing GET /insights...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $API_URL/insights \
    -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ GET /insights successful (200 OK)${NC}"
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ GET /insights failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}API Testing Complete${NC}"
echo -e "${GREEN}========================================${NC}"
