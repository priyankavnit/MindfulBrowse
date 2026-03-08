# Deployment Scripts

This directory contains deployment and utility scripts for the Mindful Browse MVP prototype.

## Prerequisites

- AWS CLI configured with appropriate credentials (`aws configure`)
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Node.js 20+ and npm 10+
- Docker (for LocalStack testing)
- Appropriate AWS permissions (IAM, CloudFormation, S3, CloudFront, Lambda, DynamoDB, Cognito, Bedrock)

## Scripts Overview

### `deploy-all.sh` - Complete Deployment

Deploys all components in the correct order: infrastructure → dashboard → extension.

```bash
# Deploy to dev environment (default)
./scripts/deploy-all.sh

# Deploy to specific environment
./scripts/deploy-all.sh dev
```

**What it does:**
1. Deploys AWS infrastructure (CDK stacks)
2. Builds and deploys web dashboard to S3/CloudFront
3. Packages browser extension for distribution
4. Displays deployment summary with all URLs and IDs

**Duration:** ~5-10 minutes for initial deployment

---

### `deploy-infrastructure.sh` - Infrastructure Only

Deploys AWS infrastructure using CDK.

```bash
# Deploy to dev environment
./scripts/deploy-infrastructure.sh

# Deploy to specific environment
./scripts/deploy-infrastructure.sh dev
```

**What it does:**
1. Checks prerequisites (AWS CLI, CDK, credentials)
2. Builds shared package and Lambda functions
3. Bootstraps CDK (if needed)
4. Deploys CloudFormation stacks
5. Outputs stack values (API URL, User Pool ID, etc.)

**Resources created:**
- DynamoDB table (MindfulBrowse-{env})
- Cognito User Pool and Client
- Lambda function (event processor)
- API Gateway (REST API)
- S3 bucket (dashboard hosting)
- CloudFront distribution
- CloudWatch log groups
- IAM roles and policies

---

### `deploy-dashboard.sh` - Dashboard Only

Builds and deploys the web dashboard to S3/CloudFront.

```bash
# Deploy to dev environment
./scripts/deploy-dashboard.sh

# Deploy to specific environment
./scripts/deploy-dashboard.sh dev
```

**What it does:**
1. Retrieves stack outputs (API URL, Cognito config)
2. Creates `.env.production` with configuration
3. Builds React dashboard with Vite
4. Uploads files to S3 bucket
5. Sets appropriate cache headers
6. Invalidates CloudFront cache
7. Outputs dashboard URL

**Duration:** ~2-3 minutes

---

### `package-extension.sh` - Extension Packaging

Builds and packages the browser extension for distribution.

```bash
# Package for dev environment
./scripts/package-extension.sh

# Package for specific environment
./scripts/package-extension.sh dev
```

**What it does:**
1. Retrieves API URL from CloudFormation
2. Creates `src/config.ts` with API configuration
3. Builds extension with Webpack
4. Creates timestamped zip file in `dist/` directory
5. Outputs package location and size

**Output:** `dist/mindful-browse-extension-{env}-{timestamp}.zip`

---

### `create-test-user.sh` - Create Test User

Creates a test user in Cognito for development and testing.

```bash
# Create user in dev environment
./scripts/create-test-user.sh

# Create user in specific environment
./scripts/create-test-user.sh dev
```

**What it does:**
1. Prompts for email and password
2. Creates user in Cognito User Pool
3. Confirms user (skips email verification)
4. Outputs user credentials

---

### `test-api.sh` - API Testing

Tests API endpoints with authentication.

```bash
# Test dev environment
./scripts/test-api.sh

# Test specific environment
./scripts/test-api.sh dev
```

**What it does:**
1. Prompts for user credentials
2. Authenticates with Cognito
3. Tests POST /events endpoint
4. Tests GET /insights endpoint
5. Displays responses

---

## Typical Deployment Workflow

### Initial Setup

```bash
# 1. Deploy everything
./scripts/deploy-all.sh dev

# 2. Create a test user
./scripts/create-test-user.sh dev

# 3. Test the API
./scripts/test-api.sh dev
```

### Dashboard Updates

```bash
# Only redeploy dashboard after code changes
./scripts/deploy-dashboard.sh dev
```

### Extension Updates

```bash
# Only repackage extension after code changes
./scripts/package-extension.sh dev
```

### Infrastructure Updates

```bash
# Redeploy infrastructure after CDK changes
./scripts/deploy-infrastructure.sh dev

# Then redeploy dashboard (config may have changed)
./scripts/deploy-dashboard.sh dev
```

## Environment Variables

Scripts use the following environment variables:

- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_PROFILE` - AWS CLI profile (optional)

Set them before running scripts:

```bash
export AWS_REGION=us-west-2
export AWS_PROFILE=my-profile
./scripts/deploy-all.sh dev
```

## Troubleshooting

### CDK Bootstrap Error

If you see "CDK not bootstrapped":

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Bedrock Access Error

Enable Bedrock in AWS Console:
1. Go to AWS Bedrock console
2. Navigate to Model access
3. Request access to Claude 3 models

### CloudFormation Stack Not Found

Make sure infrastructure is deployed first:

```bash
./scripts/deploy-infrastructure.sh dev
```

### Extension Config Error

If extension can't connect to API, rebuild with correct environment:

```bash
./scripts/package-extension.sh dev
```

## Script Output

All scripts output:
- ✓ Success messages in green
- ⚠ Warnings in yellow
- ✗ Errors in red
- ℹ Info messages in blue

## Security Notes

- Scripts require AWS credentials with appropriate permissions
- Never commit `.env` files or credentials to version control
- Use separate AWS accounts for dev/staging/prod
- Review IAM permissions before deployment
- Enable MFA for production deployments

## Additional Resources

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Detailed deployment guide
- [PROJECT-DOCUMENTATION.md](../PROJECT-DOCUMENTATION.md) - Project overview
- [packages/browser-extension/SETUP.md](../packages/browser-extension/SETUP.md) - Extension setup
- [packages/web-dashboard/AUTH_SETUP.md](../packages/web-dashboard/AUTH_SETUP.md) - Auth configuration

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review CloudWatch logs for Lambda errors
3. Check CloudFormation events for deployment issues
4. See DEPLOYMENT.md for detailed instructions
