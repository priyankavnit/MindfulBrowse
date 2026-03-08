#!/bin/bash

# Mindful Browse - Upload Extension to S3
# This script uploads the browser extension ZIP to S3 for distribution

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment (default: dev)
ENVIRONMENT=${1:-dev}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Upload Browser Extension to S3${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get bucket name from CloudFormation stack
echo -e "${YELLOW}Retrieving S3 bucket...${NC}"
STACK_NAME="MindfulBrowseStack-$ENVIRONMENT"

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DashboardBucketName`].OutputValue' \
    --output text)

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}Error: Could not retrieve bucket name from stack $STACK_NAME${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Bucket: $BUCKET_NAME${NC}"
echo ""

# Find the latest extension package
echo -e "${YELLOW}Finding extension package...${NC}"
EXTENSION_ZIP=$(ls -t dist/mindful-browse-extension-*.zip 2>/dev/null | head -1)

if [ -z "$EXTENSION_ZIP" ]; then
    echo -e "${RED}Error: No extension package found in dist/${NC}"
    echo "Run ./scripts/package-extension.sh first"
    exit 1
fi

echo -e "${GREEN}✓ Found: $EXTENSION_ZIP${NC}"
echo ""

# Upload to S3
echo -e "${YELLOW}Uploading to S3...${NC}"

# Create a consistent filename for the latest version
LATEST_FILENAME="mindful-browse-extension-latest.zip"

# Upload without ACL (will be accessible via CloudFront)
aws s3 cp "$EXTENSION_ZIP" "s3://$BUCKET_NAME/downloads/$LATEST_FILENAME" \
    --content-type "application/zip" \
    --content-disposition "attachment; filename=$LATEST_FILENAME" \
    --metadata "version=1.0.0,environment=$ENVIRONMENT"

# Also upload with timestamped name for version history
TIMESTAMPED_FILENAME=$(basename "$EXTENSION_ZIP")
aws s3 cp "$EXTENSION_ZIP" "s3://$BUCKET_NAME/downloads/$TIMESTAMPED_FILENAME" \
    --content-type "application/zip" \
    --content-disposition "attachment; filename=$TIMESTAMPED_FILENAME" \
    --metadata "version=1.0.0,environment=$ENVIRONMENT"

echo -e "${GREEN}✓ Extension uploaded to S3${NC}"
echo ""

# Get CloudFront distribution URL
DASHBOARD_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' \
    --output text)

# Construct download URLs
CLOUDFRONT_URL="${DASHBOARD_URL}/downloads/$LATEST_FILENAME"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Extension Uploaded Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Download URL (via CloudFront):${NC}"
echo "$CLOUDFRONT_URL"
echo ""
echo -e "${YELLOW}Note:${NC} The extension is accessible via CloudFront CDN."
echo ""
echo -e "${YELLOW}Installation Instructions for Users:${NC}"
echo "1. Download the ZIP file from: $CLOUDFRONT_URL"
echo "2. Extract the ZIP file to a folder"
echo "3. Open Chrome and go to chrome://extensions"
echo "4. Enable 'Developer mode' (toggle in top-right)"
echo "5. Click 'Load unpacked' and select the extracted folder"
echo ""
echo -e "${GREEN}Share this download link with your users:${NC}"
echo "$CLOUDFRONT_URL"

