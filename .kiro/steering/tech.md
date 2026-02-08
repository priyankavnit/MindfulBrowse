# Technology Stack

## Architecture Overview

The platform follows a cloud-native architecture using AWS services with a browser extension client and web dashboard interface.

## Core Technologies

### Frontend
- **Browser Extension**: JavaScript/TypeScript with WebExtensions API
- **Web Dashboard**: React/TypeScript hosted on AWS Amplify with CloudFront CDN
- **UI Framework**: Modern React with responsive design principles

### Backend Services
- **API Layer**: Amazon API Gateway for RESTful APIs
- **Compute**: 
  - Amazon ECS Fargate for main backend services
  - AWS Lambda for event-driven data processing
- **Load Balancing**: Application Load Balancer for high availability

### AI/ML Services
- **Amazon Comprehend**: Real-time sentiment analysis and topic classification
- **Amazon Bedrock**: Advanced insight generation and personalized recommendations

### Data Storage
- **Amazon DynamoDB**: NoSQL database for aggregated metrics and user profiles
- **Amazon S3**: Encrypted backup storage (opt-in only)
- **AWS KMS**: Encryption key management

### Security & Authentication
- **Amazon Cognito**: User authentication and authorization
- **AWS IAM**: Role-based access control
- **AWS Secrets Manager**: Secure configuration storage

### Monitoring & Operations
- **Amazon CloudWatch**: Logging, monitoring, and alerting
- **AWS X-Ray**: Distributed tracing
- **AWS Config**: Compliance monitoring

## Development Practices

### Testing Strategy
- **Unit Testing**: Jest with ts-jest for TypeScript support
- **Property-Based Testing**: 
  - fast-check library for JavaScript/TypeScript across all packages
- **Integration Testing**: LocalStack for AWS service testing
- **Test Organization**: Separate test files by type (`.unit.test.ts`, `.property.test.ts`, `.integration.test.ts`)

### Code Quality
- TypeScript for type safety across all packages
- ESLint with TypeScript rules for consistent code style
- Prettier for automated code formatting
- Zod for runtime type validation and schema definition
- Automated testing and linting in CI/CD pipeline

### Build Tools
- **Backend API**: TypeScript compiler with Express.js
- **Browser Extension**: Webpack for bundling and asset management
- **Web Dashboard**: Vite for fast development and optimized builds
- **Lambda Functions**: TypeScript compiler with ZIP packaging
- **Infrastructure**: AWS CDK for TypeScript-based infrastructure
- **Shared Package**: TypeScript compiler for type definitions

## Common Commands

The project uses npm workspaces for monorepo management:

```bash
# Development
npm install          # Install all dependencies
npm run dev         # Start development servers for all packages
npm run build       # Build all packages for production

# Testing  
npm run test        # Run all tests across packages
npm run test:unit   # Run unit tests only
npm run test:property # Run property-based tests only
npm run test:integration # Run integration tests only

# Code Quality
npm run lint        # Lint all packages
npm run lint --workspace=packages/backend-api # Lint specific package

# Deployment
npm run deploy      # Deploy infrastructure to AWS
npm run deploy:staging # Deploy to staging environment

# Local Development with AWS Services
npm run localstack:start # Start LocalStack for local AWS testing
npm run localstack:stop  # Stop LocalStack

# Package-specific commands
npm run dev --workspace=packages/web-dashboard
npm run build --workspace=packages/browser-extension
```

## Monorepo Structure

The project is organized as a monorepo with the following packages:

- **@mindful-browse/backend-api**: Express.js API service
- **@mindful-browse/browser-extension**: Browser extension with Webpack build
- **@mindful-browse/infrastructure**: AWS CDK infrastructure code
- **@mindful-browse/lambda-functions**: AWS Lambda functions
- **@mindful-browse/shared**: Shared types and utilities
- **@mindful-browse/web-dashboard**: React dashboard with Vite

## Environment Setup

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured with appropriate permissions
- Docker for LocalStack testing
- Browser development tools for extension testing

### AWS Services Configuration
- AWS CDK for infrastructure as code (TypeScript-based)
- Environment-specific configurations for dev/staging/prod
- LocalStack for local development and testing
- Automated deployment pipelines using GitHub Actions