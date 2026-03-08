# Mindful Browse Infrastructure

AWS CDK infrastructure for the Mindful Browse MVP.

## Architecture

The infrastructure includes:

- **DynamoDB Table**: Stores browsing events and user profiles
- **Cognito User Pool**: Handles user authentication
- **Lambda Function**: Processes events and generates insights
- **API Gateway**: REST API with Cognito authorization
- **S3 + CloudFront**: Hosts and distributes the web dashboard

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js 18+ and npm
- AWS CDK CLI: `npm install -g aws-cdk`

## Deployment

### First-time setup

```bash
# Bootstrap CDK (only needed once per account/region)
cdk bootstrap

# Install dependencies
npm install
```

### Deploy to dev environment

```bash
npm run build
npm run deploy
```

### Deploy to staging environment

```bash
npm run build
npm run deploy:staging
```

### Deploy to production environment

```bash
npm run build
cdk deploy --all --context environment=prod
```

## Useful Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm run synth` - Synthesize CloudFormation template
- `npm run diff` - Compare deployed stack with current state
- `npm run deploy` - Deploy stack to AWS
- `npm run destroy` - Destroy stack (use with caution)

## Outputs

After deployment, the stack outputs:

- `TableName`: DynamoDB table name
- `UserPoolId`: Cognito User Pool ID
- `UserPoolClientId`: Cognito User Pool Client ID
- `ApiUrl`: API Gateway endpoint URL
- `DashboardUrl`: CloudFront distribution URL
- `DashboardBucketName`: S3 bucket for dashboard files
- `DistributionId`: CloudFront distribution ID

## Environment Variables

The Lambda function uses these environment variables:

- `TABLE_NAME`: DynamoDB table name (auto-configured)
- `LOG_LEVEL`: Logging level (INFO for prod, DEBUG for dev)
- `BEDROCK_HAIKU_MODEL_ID`: Claude 3 Haiku model ID
- `BEDROCK_SONNET_MODEL_ID`: Claude 3 Sonnet model ID
- `ENVIRONMENT`: Deployment environment (dev/staging/prod)

## Security

- All data encrypted at rest (DynamoDB, S3)
- All data encrypted in transit (HTTPS/TLS)
- API Gateway protected by Cognito authorization
- Lambda has minimal IAM permissions (DynamoDB, Bedrock, CloudWatch)
- S3 bucket blocks public access (served via CloudFront only)

## Cost Optimization

- DynamoDB uses on-demand billing (pay per request)
- Lambda uses 512 MB memory with 10-second timeout
- CloudFront uses PriceClass 100 (North America and Europe)
- CloudWatch logs retained for 7 days
- Non-production resources auto-delete on stack destruction
