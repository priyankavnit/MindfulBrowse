#!/bin/bash

# Mindful Browse - Create Test User Script
# This script creates a test user in Cognito for testing

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment (default: dev)
ENVIRONMENT=${1:-dev}
EMAIL=${2:-testuser@example.com}
PASSWORD=${3:-TestPass123!}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Creating Test User in Cognito${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get User Pool ID
STACK_NAME="MindfulBrowseStack-$ENVIRONMENT"
USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

echo "User Pool ID: $USER_POOL_ID"
echo "Email: $EMAIL"
echo ""

# Create user
echo -e "${YELLOW}Creating user...${NC}"
aws cognito-idp admin-create-user \
    --user-pool-id $USER_POOL_ID \
    --username $EMAIL \
    --user-attributes Name=email,Value=$EMAIL Name=email_verified,Value=true \
    --temporary-password "TempPass123!" \
    --message-action SUPPRESS

echo -e "${GREEN}✓ User created${NC}"
echo ""

# Set permanent password
echo -e "${YELLOW}Setting permanent password...${NC}"
aws cognito-idp admin-set-user-password \
    --user-pool-id $USER_POOL_ID \
    --username $EMAIL \
    --password $PASSWORD \
    --permanent

echo -e "${GREEN}✓ Password set${NC}"
echo ""

# Get authentication token
echo -e "${YELLOW}Getting authentication token...${NC}"
CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text)

TOKEN=$(aws cognito-idp initiate-auth \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id $CLIENT_ID \
    --auth-parameters USERNAME=$EMAIL,PASSWORD=$PASSWORD \
    --query 'AuthenticationResult.IdToken' \
    --output text)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Test User Created Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Credentials:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""
echo "Authentication Token (valid for 1 hour):"
echo "$TOKEN"
echo ""
echo "Save this token for API testing."
