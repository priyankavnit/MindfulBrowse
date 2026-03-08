# Mindful Browse MVP

A privacy-first digital wellness platform that helps users understand and improve their relationship with web content consumption.

## Overview

Mindful Browse is a serverless application that analyzes the emotional footprint of daily web usage. It provides users with insights into how their content consumption affects their emotional state through sentiment analysis, category classification, and doomscroll detection.

**Key Features:**
- 📊 **Browsing Insights**: Track time spent, sentiment distribution, and content categories
- 🧠 **AI-Powered Analysis**: Uses Amazon Bedrock (Claude 3) for content classification
- 🚨 **Doomscroll Detection**: Identifies prolonged negative content consumption patterns
- 💬 **Gentle Nudges**: Provides reflection prompts when doomscrolling is detected
- 🔒 **Privacy-First**: Collects only metadata (domain, title, duration) - never full content
- ☁️ **Serverless Architecture**: Built on AWS Lambda, DynamoDB, and API Gateway

## Architecture

```
Browser Extension → API Gateway → Lambda → Bedrock + DynamoDB
Web Dashboard (S3 + CloudFront) → API Gateway → Lambda
```

**Components:**
- **Browser Extension**: Captures browsing metadata and sends to API
- **Lambda Function**: Processes events, classifies content, detects doomscrolling
- **DynamoDB**: Stores browsing events and user profiles
- **Web Dashboard**: React SPA for viewing insights
- **Amazon Bedrock**: AI classification using Claude 3 models
- **Amazon Cognito**: User authentication

## Quick Start

### Prerequisites

- **Node.js 20+** and **npm 10+**
- **AWS CLI** configured with credentials
- **AWS CDK CLI**: `npm install -g aws-cdk`
- **AWS Account** with Bedrock access enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/mindful-browse.git
cd mindful-browse

# 2. Install dependencies
npm install

# 3. Configure AWS credentials
aws configure

# 4. Enable Bedrock models (Claude 3 Haiku and Sonnet)
# Go to AWS Bedrock Console → Model access → Request access

# 5. Bootstrap CDK (one-time)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
cdk bootstrap aws://$ACCOUNT_ID/us-east-1

# 6. Deploy everything
./scripts/deploy-all.sh dev

# 7. Create a test user
./scripts/create-test-user.sh dev

# 8. Test the API
./scripts/test-api.sh dev
```

**Deployment time:** ~5-10 minutes

### Load Browser Extension

**Chrome/Edge:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/browser-extension/dist/`

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in `packages/browser-extension/dist/`

### Access Dashboard

Open the Dashboard URL from deployment output and log in with your test user credentials.

## Project Structure

```
.kiro/
├── specs/                          # Feature specifications
│   └── mvp-prototype/             # MVP specification
│       ├── requirements.md        # User stories and acceptance criteria
│       ├── design.md              # Technical design and architecture
│       └── tasks.md               # Implementation task breakdown
└── steering/                      # Project guidance documents
    ├── product.md                 # Product overview and principles
    ├── tech.md                    # Technology stack and practices
    └── structure.md               # Project organization

packages/                          # Monorepo packages
├── browser-extension/             # Browser extension (WebExtensions API)
├── infrastructure/                # AWS CDK infrastructure as code
├── lambda-functions/              # AWS Lambda event processor
├── shared/                        # Shared TypeScript types and utilities
└── web-dashboard/                 # React web dashboard

scripts/                           # Deployment and utility scripts
├── deploy-all.sh                  # Complete deployment
├── deploy-infrastructure.sh       # Infrastructure only
├── deploy-dashboard.sh            # Dashboard only
├── package-extension.sh           # Extension packaging
├── create-test-user.sh            # Create Cognito test user
└── test-api.sh                    # API endpoint testing
```

## Development

### Monorepo Commands

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Lint all packages
npm run lint
```

### Package-Specific Commands

```bash
# Lambda functions
npm run build --workspace=packages/lambda-functions
npm run test --workspace=packages/lambda-functions

# Web dashboard
npm run dev --workspace=packages/web-dashboard
npm run build --workspace=packages/web-dashboard

# Browser extension
npm run watch --workspace=packages/browser-extension
npm run build --workspace=packages/browser-extension
```

### Local Testing with LocalStack

```bash
# Start LocalStack (local AWS services)
npm run localstack:start

# Run integration tests
npm run test:integration

# Stop LocalStack
npm run localstack:stop
```

## Deployment

### Complete Deployment

```bash
./scripts/deploy-all.sh dev
```

### Individual Components

```bash
# Infrastructure only
./scripts/deploy-infrastructure.sh dev

# Dashboard only
./scripts/deploy-dashboard.sh dev

# Extension only
./scripts/package-extension.sh dev
```

### Testing Deployment

```bash
# Create test user
./scripts/create-test-user.sh dev

# Test API endpoints
./scripts/test-api.sh dev
```

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with step-by-step instructions
- **[PROJECT-DOCUMENTATION.md](PROJECT-DOCUMENTATION.md)** - Project overview and architecture
- **[scripts/README.md](scripts/README.md)** - Deployment scripts documentation
- **[packages/browser-extension/SETUP.md](packages/browser-extension/SETUP.md)** - Extension setup guide
- **[packages/web-dashboard/AUTH_SETUP.md](packages/web-dashboard/AUTH_SETUP.md)** - Authentication configuration
- **[.kiro/specs/mvp-prototype/](. kiro/specs/mvp-prototype/)** - MVP specification documents

## Technology Stack

### Frontend
- **Browser Extension**: JavaScript/TypeScript with WebExtensions API
- **Web Dashboard**: React 18+ with TypeScript, Vite, hosted on S3/CloudFront

### Backend
- **API Layer**: Amazon API Gateway (REST API)
- **Compute**: AWS Lambda (Node.js 18+)
- **AI/ML**: Amazon Bedrock (Claude 3 Haiku and Sonnet)

### Data Storage
- **Database**: Amazon DynamoDB (on-demand pricing)
- **Encryption**: AWS KMS for encryption at rest

### Security & Authentication
- **Authentication**: Amazon Cognito User Pools
- **Authorization**: JWT tokens with API Gateway authorizer

### Monitoring
- **Logging**: Amazon CloudWatch Logs (7-day retention)
- **Metrics**: CloudWatch Metrics for Lambda, API Gateway, DynamoDB

### Testing
- **Unit Tests**: Jest with ts-jest
- **Integration Tests**: Jest with LocalStack
- **Test Coverage**: 70% minimum

## Cost Estimates

### Development Environment (Low Usage)
- **Total:** ~$5-25/month
  - DynamoDB: ~$1-5/month
  - Lambda: ~$0.50-2/month
  - Bedrock: ~$2-10/month
  - API Gateway: ~$0.50-2/month
  - CloudFront + S3: ~$1-3/month

### Production Environment (1000 Active Users)
- **Total:** ~$80-240/month
  - DynamoDB: ~$10-30/month
  - Lambda: ~$5-15/month
  - Bedrock: ~$50-150/month
  - API Gateway: ~$5-15/month
  - CloudFront + S3: ~$10-30/month

## Privacy & Security

- **Data Minimization**: Only collects domain, title, timestamp, and duration
- **No Full Content**: Never captures page content, passwords, or personal messages
- **Encryption**: All data encrypted at rest (DynamoDB, S3) and in transit (HTTPS/TLS)
- **User Control**: Users can delete their account and all data at any time
- **No Third-Party Sharing**: Data never sold or shared with third parties
- **Privacy-Preserving AI**: Only domain and title sent to Bedrock (no full content)

## Monitoring

### CloudWatch Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/MindfulBrowse-EventProcessor-dev --follow

# View API Gateway logs
aws logs tail /aws/apigateway/MindfulBrowse-API-dev --follow
```

### CloudWatch Metrics

```bash
# Check Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=MindfulBrowse-EventProcessor-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

## Troubleshooting

### Common Issues

**CDK Bootstrap Fails**
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
cdk bootstrap aws://$ACCOUNT_ID/us-east-1
```

**Bedrock Access Denied**
- Go to AWS Bedrock Console → Model access
- Request access to Claude 3 Haiku and Sonnet
- Wait for approval (usually instant)

**Extension Not Sending Events**
- Check browser console for errors
- Verify API URL in extension config
- Check authentication token is stored
- Verify extension permissions

**Dashboard Not Loading**
- Check CloudFront distribution status
- Verify S3 bucket permissions
- Check browser console for errors
- Verify `.env.production` configuration

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting.

## Cleanup

```bash
# Destroy all AWS resources
cd packages/infrastructure
cdk destroy

# Empty S3 bucket first if needed
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name MindfulBrowseStack-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardBucketName`].OutputValue' \
  --output text)
aws s3 rm s3://$BUCKET_NAME --recursive
```

## Contributing

This is an MVP prototype. For production use, consider:
- Setting up staging and production environments
- Implementing CloudWatch alarms and SNS notifications
- Adding backup and disaster recovery procedures
- Implementing rate limiting and DDoS protection
- Adding comprehensive monitoring dashboards
- Implementing automated testing in CI/CD pipeline

## License

MIT

## Support

For issues or questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
2. Review CloudWatch logs for errors
3. Check AWS service quotas
4. Consult AWS documentation

---

**Version:** 1.0.0 (MVP)  
**Environment:** DEV (Development)  
**Last Updated:** 2024
