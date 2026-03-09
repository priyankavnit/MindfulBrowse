#!/bin/bash

# Test classification with domain normalization

API_URL="https://nqqbdhge68.execute-api.us-east-1.amazonaws.com/dev"

# Get auth token from Cognito
echo "Testing domain classification..."
echo ""

# Test 1: Reddit with www prefix
echo "Test 1: www.reddit.com (should be 'social')"
curl -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id 71cq717bep7dgsdi726r5bbkd --auth-parameters USERNAME=test@mindfulbrowse.com,PASSWORD=MindfulTest123! --no-verify-ssl --query 'AuthenticationResult.IdToken' --output text 2>/dev/null)" \
  -d '{
    "domain": "www.reddit.com",
    "url": "https://www.reddit.com/r/worldnews",
    "title": "Breaking news discussion",
    "timestamp": '$(date +%s000)',
    "duration_seconds": 30,
    "scroll_count": 50,
    "avg_scroll_velocity": 800
  }' \
  --no-buffer 2>/dev/null

echo ""
echo ""

# Test 2: CNN news
echo "Test 2: www.cnn.com (should be 'news')"
curl -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id 71cq717bep7dgsdi726r5bbkd --auth-parameters USERNAME=test@mindfulbrowse.com,PASSWORD=MindfulTest123! --no-verify-ssl --query 'AuthenticationResult.IdToken' --output text 2>/dev/null)" \
  -d '{
    "domain": "www.cnn.com",
    "url": "https://www.cnn.com/2024/war-news",
    "title": "War escalates in conflict zone",
    "timestamp": '$(date +%s000)',
    "duration_seconds": 45,
    "scroll_count": 60,
    "avg_scroll_velocity": 900
  }' \
  --no-buffer 2>/dev/null

echo ""
echo ""
echo "Check CloudWatch logs:"
echo "aws logs tail /aws/lambda/mindful-browse-processor-dev --since 2m --no-verify-ssl | grep -E '(domain|category|heuristic)'"
