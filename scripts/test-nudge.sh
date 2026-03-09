#!/bin/bash

# Test script to trigger a nudge by simulating doomscroll conditions
# Requirements:
# - Session duration >= 12 minutes (720 seconds)
# - High scroll activity (avg scroll count >= 30 per event)
# - Category is news/social/entertainment (>= 50%)

set -e

# Configuration
API_URL="https://nqqbdhge68.execute-api.us-east-1.amazonaws.com/dev"
AUTH_TOKEN="YOUR_AUTH_TOKEN_HERE"  # Replace with actual token from Cognito

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Testing Nudge Feature${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get current timestamp
NOW=$(date +%s)000  # milliseconds

# Calculate timestamps for events spread over 15 minutes
# We'll send 10 events, each 90 seconds apart = 15 minutes total
# Each event will have 40 scroll count (high scroll activity)

echo -e "${YELLOW}Sending 10 news events with high scroll activity...${NC}"
echo "This simulates 15 minutes of doomscrolling on news sites"
echo ""

for i in {1..10}; do
  # Calculate timestamp (90 seconds apart)
  TIMESTAMP=$((NOW - (10 - i) * 90000))
  
  # Alternate between news sites
  if [ $((i % 3)) -eq 0 ]; then
    DOMAIN="cnn.com"
    TITLE="Breaking: Major conflict escalates"
  elif [ $((i % 3)) -eq 1 ]; then
    DOMAIN="bbc.com"
    TITLE="War update: Casualties reported"
  else
    DOMAIN="nytimes.com"
    TITLE="Crisis deepens as tensions rise"
  fi
  
  echo "Event $i: $DOMAIN - $TITLE"
  
  # Send event
  curl -X POST "$API_URL/events" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{
      \"domain\": \"$DOMAIN\",
      \"url\": \"https://$DOMAIN/article-$i\",
      \"title\": \"$TITLE\",
      \"timestamp\": $TIMESTAMP,
      \"duration_seconds\": 90,
      \"scroll_count\": 40,
      \"avg_scroll_velocity\": 800
    }" \
    --no-buffer \
    -w "\n" \
    2>/dev/null
  
  echo ""
  sleep 0.5
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Test Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Expected behavior:"
echo "- First 9 events: No nudge (session < 12 min)"
echo "- Event 10: Should trigger nudge (session = 15 min)"
echo ""
echo "Check the last response above for the nudge message."
echo ""
echo "To check CloudWatch logs:"
echo "aws logs tail /aws/lambda/mindful-browse-processor-dev --since 5m --follow"
