#!/bin/bash

# Send test browsing events to API
# This helps verify the pipeline is working

API_URL="https://nqqbdhge68.execute-api.us-east-1.amazonaws.com/dev"
EMAIL="test@mindfulbrowse.com"
PASSWORD="MindfulTest123!"

echo "========================================="
echo "Sending Test Browsing Events"
echo "========================================="
echo ""

# Get auth token
echo "Getting auth token..."
TOKEN_RESPONSE=$(curl -s -X POST https://cognito-idp.us-east-1.amazonaws.com/ \
  -H "Content-Type: application/x-amz-json-1.1" \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth" \
  -d "{
    \"AuthFlow\": \"USER_PASSWORD_AUTH\",
    \"ClientId\": \"71cq717bep7dgsdi726r5bbkd\",
    \"AuthParameters\": {
      \"USERNAME\": \"$EMAIL\",
      \"PASSWORD\": \"$PASSWORD\"
    }
  }")

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"IdToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token"
  echo "Response: $TOKEN_RESPONSE"
  exit 1
fi

echo "✓ Got auth token"
echo ""

# Send 5 test events with different durations
echo "Sending test events..."

# Event 1: CNN - 120 seconds
echo "1. Sending CNN event (120s)..."
curl -s -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"domain\": \"cnn.com\",
    \"url\": \"https://cnn.com/world/news-article\",
    \"title\": \"World News Update\",
    \"timestamp\": $(date +%s)000,
    \"duration_seconds\": 120,
    \"scroll_count\": 15,
    \"avg_scroll_velocity\": 400
  }" > /dev/null

echo "✓ Sent"

# Event 2: Twitter - 180 seconds
echo "2. Sending Twitter event (180s)..."
curl -s -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"domain\": \"twitter.com\",
    \"url\": \"https://twitter.com/home\",
    \"title\": \"Twitter Home\",
    \"timestamp\": $(date +%s)000,
    \"duration_seconds\": 180,
    \"scroll_count\": 50,
    \"avg_scroll_velocity\": 800
  }" > /dev/null

echo "✓ Sent"

# Event 3: YouTube - 300 seconds
echo "3. Sending YouTube event (300s)..."
curl -s -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"domain\": \"youtube.com\",
    \"url\": \"https://youtube.com/watch?v=abc123\",
    \"title\": \"Interesting Video\",
    \"timestamp\": $(date +%s)000,
    \"duration_seconds\": 300,
    \"scroll_count\": 5,
    \"avg_scroll_velocity\": 100
  }" > /dev/null

echo "✓ Sent"

# Event 4: GitHub - 240 seconds
echo "4. Sending GitHub event (240s)..."
curl -s -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"domain\": \"github.com\",
    \"url\": \"https://github.com/user/repo\",
    \"title\": \"Repository Code\",
    \"timestamp\": $(date +%s)000,
    \"duration_seconds\": 240,
    \"scroll_count\": 20,
    \"avg_scroll_velocity\": 300
  }" > /dev/null

echo "✓ Sent"

# Event 5: Reddit - 420 seconds
echo "5. Sending Reddit event (420s)..."
curl -s -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"domain\": \"reddit.com\",
    \"url\": \"https://reddit.com/r/programming\",
    \"title\": \"Programming Discussion\",
    \"timestamp\": $(date +%s)000,
    \"duration_seconds\": 420,
    \"scroll_count\": 80,
    \"avg_scroll_velocity\": 600
  }" > /dev/null

echo "✓ Sent"

echo ""
echo "========================================="
echo "✓ All test events sent successfully!"
echo "========================================="
echo ""
echo "Total time: 1260 seconds = 21 minutes"
echo ""
echo "Check your dashboard - total time should now show ~22 minutes"
echo "(21 minutes from these events + 1.5 minutes from old test events)"
