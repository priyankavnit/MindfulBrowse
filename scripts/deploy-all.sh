#!/bin/bash

# Mindful Browse - Complete Deployment Script
# This script deploys all components in the correct order

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment (default: dev)
ENVIRONMENT=${1:-dev}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Mindful Browse - Complete Deployment${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Confirm deployment
if [ "$ENVIRONMENT" = "prod" ]; then
    echo -e "${RED}WARNING: You are about to deploy to PRODUCTION${NC}"
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
    echo ""
fi

# Track deployment start time
START_TIME=$(date +%s)

# Step 1: Deploy Infrastructure
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 1/3: Deploying Infrastructure${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

./scripts/deploy-infrastructure.sh $ENVIRONMENT

if [ $? -ne 0 ]; then
    echo -e "${RED}Infrastructure deployment failed. Aborting.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Infrastructure deployed successfully${NC}"
echo ""
sleep 2

# Step 2: Deploy Dashboard
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2/3: Deploying Web Dashboard${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

./scripts/deploy-dashboard.sh $ENVIRONMENT

if [ $? -ne 0 ]; then
    echo -e "${RED}Dashboard deployment failed. Aborting.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Dashboard deployed successfully${NC}"
echo ""
sleep 2

# Step 3: Package Extension
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3/3: Packaging Browser Extension${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

./scripts/package-extension.sh $ENVIRONMENT

if [ $? -ne 0 ]; then
    echo -e "${RED}Extension packaging failed. Aborting.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Extension packaged successfully${NC}"
echo ""

# Calculate deployment time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Get stack outputs for summary
STACK_NAME="MindfulBrowseStack-$ENVIRONMENT"

API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

DASHBOARD_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' \
    --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text)

COGNITO_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`CognitoDomain`].OutputValue' \
    --output text)

REGION=${AWS_REGION:-us-east-1}

# Display deployment summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Total deployment time: ${MINUTES}m ${SECONDS}s${NC}"
echo ""
echo -e "${YELLOW}Deployment Summary:${NC}"
echo ""
echo -e "${GREEN}Dashboard URL:${NC}"
echo "  $DASHBOARD_URL"
echo ""
echo -e "${GREEN}API Endpoint:${NC}"
echo "  $API_URL"
echo ""
echo -e "${GREEN}Cognito Configuration:${NC}"
echo "  User Pool ID: $USER_POOL_ID"
echo "  Client ID: $CLIENT_ID"
echo "  Domain: $COGNITO_DOMAIN"
echo "  Region: $REGION"
echo ""
echo -e "${GREEN}Browser Extension:${NC}"
echo "  Package location: dist/mindful-browse-extension-$ENVIRONMENT-*.zip"
echo "  Load unpacked from: packages/browser-extension/dist"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Create a test user:"
echo "   ./scripts/create-test-user.sh $ENVIRONMENT"
echo ""
echo "2. Test the API:"
echo "   ./scripts/test-api.sh $ENVIRONMENT"
echo ""
echo "3. Load the browser extension:"
echo "   - Chrome: chrome://extensions → Load unpacked → packages/browser-extension/dist"
echo "   - Firefox: about:debugging → Load Temporary Add-on"
echo ""
echo "4. Access the dashboard:"
echo "   $DASHBOARD_URL"
echo ""
echo "5. Log in with your test user credentials"
echo ""
echo -e "${GREEN}For detailed documentation, see:${NC}"
echo "  - DEPLOYMENT.md - Deployment guide"
echo "  - PROJECT-DOCUMENTATION.md - Project overview"
echo "  - packages/browser-extension/SETUP.md - Extension setup"
echo "  - packages/web-dashboard/AUTH_SETUP.md - Authentication setup"
echo ""
echo -e "${BLUE}========================================${NC}"

