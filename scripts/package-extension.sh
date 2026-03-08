#!/bin/bash

# Mindful Browse - Browser Extension Packaging Script
# This script builds and packages the browser extension for distribution

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment (default: dev)
ENVIRONMENT=${1:-dev}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Mindful Browse Extension Packaging${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get API URL from CloudFormation stack
echo -e "${YELLOW}Retrieving API configuration...${NC}"
STACK_NAME="MindfulBrowseStack-$ENVIRONMENT"

API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -z "$API_URL" ]; then
    echo -e "${RED}Error: Could not retrieve API URL from stack $STACK_NAME${NC}"
    echo "Make sure infrastructure is deployed first."
    exit 1
fi

echo -e "${GREEN}✓ API URL retrieved: $API_URL${NC}"
echo ""

# Build extension
echo -e "${YELLOW}Building browser extension...${NC}"
cd packages/browser-extension

# Create environment config
cat > src/config.ts << EOF
// Auto-generated configuration - DO NOT EDIT MANUALLY
export const config = {
  apiUrl: '$API_URL',
  environment: '$ENVIRONMENT',
};
EOF

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build extension
npm run build

echo -e "${GREEN}✓ Extension built successfully${NC}"
echo ""

# Create distribution package
echo -e "${YELLOW}Creating distribution package...${NC}"

# Create dist directory at root if it doesn't exist
mkdir -p "$(pwd)/../../dist"

# Package name with version and environment
PACKAGE_NAME="mindful-browse-extension-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).zip"
PACKAGE_PATH="$(pwd)/../../dist/$PACKAGE_NAME"

# Create zip file from dist directory
cd dist
zip -r "$PACKAGE_PATH" . -x "*.DS_Store"
cd ..

echo -e "${GREEN}✓ Extension packaged${NC}"
echo ""

# Display package info
PACKAGE_SIZE=$(du -h "$PACKAGE_PATH" | cut -f1)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Extension Packaged Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Package: $PACKAGE_NAME${NC}"
echo -e "${GREEN}Size: $PACKAGE_SIZE${NC}"
echo -e "${GREEN}Location: dist/$PACKAGE_NAME${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test the extension locally by loading the 'packages/browser-extension/dist' folder"
echo "2. For Chrome: Go to chrome://extensions, enable Developer Mode, click 'Load unpacked'"
echo "3. For Firefox: Go to about:debugging, click 'Load Temporary Add-on'"
echo "4. For distribution: Upload the zip file to Chrome Web Store or Firefox Add-ons"
echo ""
echo "See packages/browser-extension/SETUP.md for detailed instructions."

