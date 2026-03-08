# Mindful Browse MVP - Deployment Guide

## Overview

This guide provides complete instructions for deploying the Mindful Browse MVP to AWS. The system uses a serverless architecture with AWS Lambda, DynamoDB, Bedrock, API Gateway, and CloudFront.

**Target Environment:** DEV (Development) - This MVP focuses on development environment deployment only.

## Architecture Summary

```
Browser Extension → API Gateway → Lambda → Bedrock + DynamoDB
Web Dashboard (S3 + CloudFront) → API Gateway → Lambda
```

**Key Components:**
- **Browser Extension**: Captures browsing metadata and sends to API
- **API Gateway**: REST API with Cognito authentication
- **Lambda Function**: Processes events, classifies content with Bedrock, detects doomscrolling
- **DynamoDB**: Stores browsing events and user profiles
- **Web Dashboard**: React SPA hosted on S3/CloudFront
- **Cognito**: User authentication and authorization

## Prerequisites

### 1. AWS Account Setup
- AWS account with admin access (or appropriate IAM permissions)
- AWS CLI installed and configured
- Billing alerts configured (recommended)

### 2. Local Development Environment
- **Node.js 20+** and **npm 10+** installed
- **AWS CDK CLI**: `npm install -g aws-cdk`
- **Git** for version control
- **Docker** (optional, for LocalStack testing)

### 3. AWS Service Requirements
- **Bedrock access** enabled in your region (us-east-1 recommended)
- **Claude 3 Haiku and Sonnet models** enabled in Bedrock
- Lambda concurrent execution limit (default 1000 is sufficient)
- Appropriate IAM permissions for CloudFormation, Lambda, DynamoDB, S3, CloudFront, Cognito, Bedrock

## Quick Start

For a complete automated deployment, use the deployment scripts:

```bash
# 1. Complete deployment (infrastructure + dashboard + extension)
./scripts/deploy-all.sh dev

# 2. Create a test user
./scripts/create-test-user.sh dev

# 3. Test the API
./scripts/test-api.sh dev
```

**Deployment time:** ~5-10 minutes for initial deployment

For detailed step-by-step instructions, see the sections below.

---

## Initial Setup (One-Time)

### Step 1: Install Dependencies

```bash
# From project root
npm install
```

This installs dependencies for all packages in the monorepo using npm workspaces.

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure

# Enter your AWS Access Key ID, Secret Access Key, region (us-east-1), and output format (json)

# Verify credentials
aws sts get-caller-identity
```

**Expected output:**
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### Step 3: Enable Bedrock Models

**Check Bedrock availability:**
```bash
aws bedrock list-foundation-models --region us-east-1
```

**Enable Claude models via AWS Console:**
1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Click "Manage model access"
4. Request access to:
   - **Claude 3 Haiku** (anthropic.claude-3-haiku-20240307-v1:0)
   - **Claude 3 Sonnet** (anthropic.claude-3-sonnet-20240229-v1:0)
5. Wait for approval (usually instant)

**Verify access:**
```bash
aws bedrock list-foundation-models --region us-east-1 | grep -i claude
```

### Step 4: Bootstrap CDK (One-Time per Account/Region)

```bash
# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Bootstrap CDK
cdk bootstrap aws://$ACCOUNT_ID/us-east-1
```

**What this does:**
- Creates an S3 bucket for CDK assets
- Creates IAM roles for CloudFormation
- Sets up resources needed for CDK deployments

**Note:** Only needed once per AWS account and region combination.

---

## Deployment Workflow

### Option 1: Automated Deployment (Recommended)

Use the deployment scripts for a streamlined deployment process:

```bash
# Deploy everything (infrastructure + dashboard + extension)
./scripts/deploy-all.sh dev
```

**What this does:**
1. Builds all packages (shared, lambda-functions, infrastructure)
2. Deploys AWS infrastructure using CDK
3. Builds and deploys web dashboard to S3/CloudFront
4. Packages browser extension for distribution
5. Displays deployment summary with URLs and configuration

**Duration:** ~5-10 minutes

**Output includes:**
- Dashboard URL
- API endpoint URL
- Cognito User Pool ID and Client ID
- Extension package location

### Option 2: Manual Step-by-Step Deployment

For more control or troubleshooting, deploy components individually:

#### Step 1: Deploy Infrastructure

```bash
./scripts/deploy-infrastructure.sh dev
```

**What this creates:**
- DynamoDB table (MindfulBrowse-dev)
- Cognito User Pool and Client
- Lambda function (event processor)
- API Gateway (REST API with Cognito authorizer)
- S3 bucket (dashboard hosting)
- CloudFront distribution
- CloudWatch log groups
- IAM roles and policies

**Duration:** ~3-5 minutes

**Save the stack outputs** - you'll need them for testing and configuration:
```bash
aws cloudformation describe-stacks \
  --stack-name MindfulBrowseStack-dev \
  --query 'Stacks[0].Outputs' \
  --output table
```

#### Step 2: Deploy Web Dashboard

```bash
./scripts/deploy-dashboard.sh dev
```

**What this does:**
1. Retrieves API URL and Cognito configuration from CloudFormation
2. Creates `.env.production` with configuration
3. Builds React dashboard with Vite
4. Uploads files to S3 bucket
5. Sets cache headers (assets: 1 year, index.html: no-cache)
6. Invalidates CloudFront cache
7. Outputs dashboard URL

**Duration:** ~2-3 minutes

#### Step 3: Package Browser Extension

```bash
./scripts/package-extension.sh dev
```

**What this does:**
1. Retrieves API URL from CloudFormation
2. Creates `src/config.ts` with API configuration
3. Builds extension with Webpack
4. Creates timestamped zip file in `dist/` directory

**Output:** `dist/mindful-browse-extension-dev-YYYYMMDD-HHMMSS.zip`

---

## Testing the Deployment

### Step 1: Create a Test User

```bash
./scripts/create-test-user.sh dev
```

**Interactive prompts:**
- Email address (e.g., testuser@example.com)
- Password (must meet Cognito requirements: 8+ chars, uppercase, lowercase, number, special char)

**What this does:**
1. Creates user in Cognito User Pool
2. Sets permanent password (skips email verification)
3. Authenticates and retrieves JWT token
4. Outputs credentials and token

**Save the token** - you'll need it for API testing.

### Step 2: Test API Endpoints

```bash
./scripts/test-api.sh dev
```

**What this tests:**
1. **POST /events** - Submit a browsing event
2. **GET /insights** - Retrieve aggregated insights

**Expected results:**
- POST /events: 200 OK (empty body or nudge if doomscroll detected)
- GET /insights: 200 OK with JSON containing insights data

**Example output:**
```json
{
  "total_time_seconds": 60,
  "sentiment_distribution": {
    "positive": 0.0,
    "neutral": 1.0,
    "negative": 0.0
  },
  "category_distribution": {
    "news": 0.0,
    "social": 0.0,
    "entertainment": 0.0,
    "education": 0.0,
    "other": 1.0
  },
  "doomscroll_sessions": 0
}
```

### Step 3: Load Browser Extension

**For Chrome/Edge:**
1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select `packages/browser-extension/dist/` directory
5. Extension should appear in toolbar

**For Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in `packages/browser-extension/dist/` directory
4. Extension should appear in toolbar

**Test the extension:**
1. Click extension icon
2. Log in with test user credentials
3. Browse some websites
4. Check browser console for event transmission logs
5. Verify events appear in DynamoDB (check CloudWatch logs)

### Step 4: Test Web Dashboard

1. Open the Dashboard URL (from deployment output)
2. Log in with test user credentials
3. Verify insights are displayed
4. Check that data refreshes correctly
5. Test manual refresh button
6. Verify auto-refresh (every 60 seconds)

### Step 5: End-to-End Test

**Complete user flow:**
1. Install and authenticate browser extension
2. Browse various websites for 5-10 minutes
3. Open dashboard and verify insights appear
4. Test doomscroll detection:
   - Browse negative news sites for 15+ minutes
   - Verify doomscroll alert appears in dashboard
   - Check if nudge appears in extension

---

## Monitoring and Troubleshooting

### CloudWatch Logs

**View Lambda logs:**
```bash
# Tail logs in real-time
aws logs tail /aws/lambda/MindfulBrowse-EventProcessor-dev --follow

# View recent logs
aws logs tail /aws/lambda/MindfulBrowse-EventProcessor-dev --since 1h
```

**View API Gateway logs:**
```bash
aws logs tail /aws/apigateway/MindfulBrowse-API-dev --follow
```

### CloudWatch Metrics

**Check Lambda invocations:**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=MindfulBrowse-EventProcessor-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

**Check for errors:**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=MindfulBrowse-EventProcessor-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### Common Issues and Solutions

#### Issue: CDK Bootstrap Fails
**Symptoms:** Error message about CDK not being bootstrapped
**Solution:**
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
cdk bootstrap aws://$ACCOUNT_ID/us-east-1
```

#### Issue: Bedrock Access Denied
**Symptoms:** Lambda logs show "AccessDeniedException" for Bedrock
**Solution:**
1. Go to AWS Bedrock Console
2. Navigate to "Model access"
3. Request access to Claude 3 Haiku and Sonnet
4. Wait for approval (usually instant)

#### Issue: Lambda Timeout
**Symptoms:** API returns 500 error, Lambda logs show timeout
**Solution:**
- Check CloudWatch logs for specific error
- Verify Bedrock is responding (check timeout fallback)
- Increase Lambda timeout if needed (current: 10 seconds)

#### Issue: API Gateway 401 Errors
**Symptoms:** Extension or dashboard can't authenticate
**Solution:**
- Verify Cognito token is valid
- Check token expiration (1 hour for access tokens)
- Re-authenticate to get new token
- Verify User Pool ID and Client ID are correct

#### Issue: Extension Not Sending Events
**Symptoms:** No events appearing in DynamoDB
**Solution:**
- Check browser console for errors
- Verify API URL is correct in extension config
- Check authentication token is stored
- Verify extension has required permissions
- Check API Gateway logs for incoming requests

#### Issue: Dashboard Not Loading
**Symptoms:** CloudFront returns error or blank page
**Solution:**
- Check CloudFront distribution status (must be "Deployed")
- Verify S3 bucket permissions
- Check CloudFront cache (may need invalidation)
- Verify `.env.production` has correct values
- Check browser console for errors

#### Issue: High AWS Costs
**Symptoms:** Unexpected charges on AWS bill
**Solution:**
- Check DynamoDB request volume (on-demand pricing)
- Review Bedrock API calls (check Lambda logs)
- Verify CloudWatch log retention (set to 7 days)
- Check CloudFront data transfer
- Review Lambda invocation count
- Consider setting up billing alerts

---

## Local Development Setup

### Running Tests

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### LocalStack for Local AWS Testing

```bash
# Start LocalStack
npm run localstack:start

# Run integration tests against LocalStack
npm run test:integration

# Stop LocalStack
npm run localstack:stop
```

**What LocalStack provides:**
- Local DynamoDB for testing
- Local Lambda execution
- Local API Gateway
- No AWS costs during development

### Development Workflow

**For Lambda functions:**
```bash
cd packages/lambda-functions

# Watch mode for development
npm run watch

# Run tests
npm run test

# Build for deployment
npm run build
```

**For Web Dashboard:**
```bash
cd packages/web-dashboard

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**For Browser Extension:**
```bash
cd packages/browser-extension

# Watch mode for development
npm run watch

# Build for production
npm run build

# Load unpacked extension in browser for testing
```

---

## Updating Deployments

### Update Infrastructure Only

```bash
./scripts/deploy-infrastructure.sh dev
```

**When to use:**
- CDK stack changes
- Lambda function code changes
- DynamoDB schema changes
- IAM permission changes

### Update Dashboard Only

```bash
./scripts/deploy-dashboard.sh dev
```

**When to use:**
- React component changes
- Dashboard UI updates
- No infrastructure changes needed

### Update Extension Only

```bash
./scripts/package-extension.sh dev
```

**When to use:**
- Extension code changes
- No backend changes needed
- Reload unpacked extension in browser to test

---

## Deployment Checklist

### Pre-Deployment
- [ ] AWS account configured
- [ ] AWS CLI installed and authenticated
- [ ] Node.js 20+ and npm 10+ installed
- [ ] AWS CDK CLI installed globally
- [ ] Bedrock models enabled (Claude 3 Haiku and Sonnet)
- [ ] CDK bootstrapped in target region
- [ ] All packages built successfully (`npm run build`)

### Infrastructure Deployment
- [ ] CDK stack deployed successfully
- [ ] Stack outputs saved (API URL, User Pool ID, etc.)
- [ ] DynamoDB table created
- [ ] Cognito User Pool created
- [ ] Lambda function deployed
- [ ] API Gateway created with Cognito authorizer
- [ ] S3 bucket and CloudFront distribution created
- [ ] CloudWatch log groups created

### Backend Testing
- [ ] Test user created in Cognito
- [ ] POST /events endpoint tested successfully
- [ ] GET /insights endpoint tested successfully
- [ ] CloudWatch logs verified (no errors)
- [ ] Lambda execution successful

### Frontend Deployment
- [ ] Browser extension built
- [ ] Extension loaded in browser
- [ ] Extension authentication working
- [ ] Events being sent successfully
- [ ] Web dashboard built
- [ ] Dashboard uploaded to S3
- [ ] CloudFront cache invalidated
- [ ] Dashboard accessible via URL

### End-to-End Testing
- [ ] Complete user flow tested
- [ ] Insights displayed correctly in dashboard
- [ ] Doomscroll detection working
- [ ] Nudges appearing correctly (if applicable)
- [ ] No errors in browser console
- [ ] CloudWatch metrics healthy
- [ ] No unexpected AWS costs

---

## Cost Estimates

### Development Environment (Low Usage)
- **DynamoDB:** ~$1-5/month (on-demand pricing)
- **Lambda:** ~$0.50-2/month (512 MB, 10s timeout)
- **Bedrock:** ~$2-10/month (depends on usage)
- **API Gateway:** ~$0.50-2/month
- **CloudFront + S3:** ~$1-3/month
- **CloudWatch Logs:** ~$0.50-1/month (7-day retention)
- **Total:** ~$5-25/month

### Production Environment (1000 Active Users)
- **DynamoDB:** ~$10-30/month
- **Lambda:** ~$5-15/month
- **Bedrock:** ~$50-150/month
- **API Gateway:** ~$5-15/month
- **CloudFront + S3:** ~$10-30/month
- **CloudWatch Logs:** ~$2-5/month
- **Total:** ~$80-240/month

**Cost optimization tips:**
- Use short duration safeguard (skip Bedrock for < 5 second page views)
- Set CloudWatch log retention to 7 days
- Use on-demand pricing for DynamoDB (no idle costs)
- Monitor Bedrock usage (most expensive component)
- Set up billing alerts

---

## Cleanup (Destroy Resources)

### Destroy Dev Environment

```bash
cd packages/infrastructure

# Destroy CDK stack
cdk destroy

# Confirm deletion when prompted
```

**What this deletes:**
- DynamoDB table
- Lambda function
- API Gateway
- Cognito User Pool
- CloudWatch log groups
- IAM roles

**What this does NOT delete:**
- S3 bucket (must be emptied first)
- CloudWatch logs (retained for 7 days)

### Empty S3 Bucket Before Deletion

```bash
# Get bucket name from stack outputs
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name MindfulBrowseStack-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardBucketName`].OutputValue' \
  --output text)

# Empty bucket
aws s3 rm s3://$BUCKET_NAME --recursive

# Now you can destroy the stack
cd packages/infrastructure
cdk destroy
```

---

## Additional Resources

### Documentation
- **PROJECT-DOCUMENTATION.md** - Project overview and architecture
- **packages/browser-extension/SETUP.md** - Extension setup guide
- **packages/web-dashboard/AUTH_SETUP.md** - Authentication configuration
- **scripts/README.md** - Deployment scripts documentation
- **.kiro/specs/mvp-prototype/** - MVP specification documents

### AWS Documentation
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)

### Support
For issues or questions:
1. Check CloudWatch logs first
2. Review troubleshooting section above
3. Check AWS service quotas
4. Review deployment scripts output
5. Consult AWS documentation

---

**Last Updated:** 2024
**Version:** 1.0.0 (MVP)
**Environment:** DEV (Development)
