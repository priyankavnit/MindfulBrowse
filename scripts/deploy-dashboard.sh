#!/bin/bash

# Mindful Browse - Dashboard Deployment Script
# This script builds and deploys the web dashboard to S3/CloudFront

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment (default: dev)
ENVIRONMENT=${1:-dev}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Mindful Browse Dashboard Deployment${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get stack outputs
echo -e "${YELLOW}Retrieving stack outputs...${NC}"
STACK_NAME="MindfulBrowseStack-$ENVIRONMENT"

API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text \
    --no-verify-ssl)

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

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DashboardBucketName`].OutputValue' \
    --output text \
    --no-verify-ssl)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
    --output text \
    --no-verify-ssl)

echo -e "${GREEN}✓ Stack outputs retrieved${NC}"
echo "  API URL: $API_URL"
echo "  User Pool ID: $USER_POOL_ID"
echo "  Client ID: $CLIENT_ID"
echo "  Bucket: $BUCKET_NAME"
echo "  Distribution ID: $DISTRIBUTION_ID"
echo ""

# Build dashboard
echo -e "${YELLOW}Building dashboard...${NC}"
cd packages/web-dashboard

# Create environment config
cat > .env.production << EOF
VITE_API_URL=$API_URL
VITE_USER_POOL_ID=$USER_POOL_ID
VITE_CLIENT_ID=$CLIENT_ID
VITE_REGION=${AWS_REGION:-us-east-1}
EOF

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build
npm run build

echo -e "${GREEN}✓ Dashboard built successfully${NC}"
echo ""

# Upload to S3
echo -e "${YELLOW}Uploading to S3...${NC}"

# Upload HTML files
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete --no-verify-ssl \
    --exclude "assets/*" \
    --content-type "text/html"

# Upload JS files with correct MIME type
aws s3 sync dist/assets/ s3://$BUCKET_NAME/assets/ --no-verify-ssl \
    --exclude "*" --include "*.js" \
    --content-type "application/javascript" \
    --cache-control "public, max-age=31536000"

# Upload CSS files with correct MIME type
aws s3 sync dist/assets/ s3://$BUCKET_NAME/assets/ --no-verify-ssl \
    --exclude "*" --include "*.css" \
    --content-type "text/css" \
    --cache-control "public, max-age=31536000"

# Upload map files
aws s3 sync dist/assets/ s3://$BUCKET_NAME/assets/ --no-verify-ssl \
    --exclude "*" --include "*.map" \
    --content-type "application/json" \
    --cache-control "public, max-age=31536000"

# Upload index.html with no cache
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
    --content-type "text/html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --no-verify-ssl

echo -e "${GREEN}✓ Files uploaded to S3${NC}"
echo ""

# Invalidate CloudFront cache
echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text \
    --no-verify-ssl)

echo "Invalidation ID: $INVALIDATION_ID"
echo "Waiting for invalidation to complete..."

aws cloudfront wait invalidation-completed \
    --distribution-id $DISTRIBUTION_ID \
    --id $INVALIDATION_ID \
    --no-verify-ssl

echo -e "${GREEN}✓ CloudFront cache invalidated${NC}"
echo ""

# Get dashboard URL
DASHBOARD_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' \
    --output text \
    --no-verify-ssl)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Dashboard Deployed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Dashboard URL: $DASHBOARD_URL${NC}"
echo ""
echo "You can now access the dashboard at the URL above."
