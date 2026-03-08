#!/bin/bash

# Mindful Browse - Infrastructure Deployment Script
# This script deploys the AWS infrastructure using CDK

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment (default: dev)
ENVIRONMENT=${1:-dev}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Mindful Browse Infrastructure Deployment${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check CDK CLI
if ! command -v cdk &> /dev/null; then
    echo -e "${RED}Error: AWS CDK CLI not found. Install with: npm install -g aws-cdk${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity --no-verify-ssl &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured. Run: aws configure${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --no-verify-ssl --query Account --output text)
REGION=${AWS_REGION:-us-east-1}

# Set AWS CLI to skip SSL verification (for certificate issues)
export AWS_CLI_OPTS="--no-verify-ssl"

echo -e "${GREEN}✓ AWS CLI configured${NC}"
echo -e "${GREEN}✓ CDK CLI installed${NC}"
echo -e "${GREEN}✓ AWS Account: $ACCOUNT_ID${NC}"
echo -e "${GREEN}✓ Region: $REGION${NC}"
echo ""

# Check Bedrock access
echo -e "${YELLOW}Checking Bedrock access...${NC}"
if aws bedrock list-foundation-models --region $REGION --no-verify-ssl &> /dev/null; then
    echo -e "${GREEN}✓ Bedrock access enabled${NC}"
else
    echo -e "${RED}Warning: Bedrock access may not be enabled. Please enable it in AWS Console.${NC}"
fi
echo ""

# Build packages
echo -e "${YELLOW}Building packages...${NC}"

# Build shared package
echo "Building shared package..."
npm run build --workspace=packages/shared

# Build Lambda functions
echo "Building Lambda functions..."
npm run build --workspace=packages/lambda-functions

# Build infrastructure
echo "Building infrastructure..."
npm run build --workspace=packages/infrastructure

echo -e "${GREEN}✓ All packages built successfully${NC}"
echo ""

# Bootstrap CDK (if needed)
echo -e "${YELLOW}Checking CDK bootstrap...${NC}"
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION --no-verify-ssl &> /dev/null; then
    echo "CDK not bootstrapped. Bootstrapping now..."
    cdk bootstrap aws://$ACCOUNT_ID/$REGION
    echo -e "${GREEN}✓ CDK bootstrapped${NC}"
else
    echo -e "${GREEN}✓ CDK already bootstrapped${NC}"
fi
echo ""

# Deploy infrastructure
echo -e "${YELLOW}Deploying infrastructure stack...${NC}"
cd packages/infrastructure

if [ "$ENVIRONMENT" = "prod" ]; then
    cdk deploy --all --context environment=prod --require-approval never
else
    npm run deploy
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get stack outputs
echo -e "${YELLOW}Stack Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name MindfulBrowseStack-$ENVIRONMENT \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table \
    --no-verify-ssl

echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Save the stack outputs above"
echo "2. Create a test user in Cognito"
echo "3. Test the API endpoints"
echo "4. Deploy the browser extension"
echo "5. Deploy the web dashboard"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
