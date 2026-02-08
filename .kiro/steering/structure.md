# Project Structure

## Repository Organization

This project follows a specification-driven development approach with clear separation between planning and implementation phases.

## Current Structure

```
.kiro/
├── specs/                          # Feature specifications
│   ├── mindful-browse/            # Main digital wellness feature
│   │   ├── requirements.md        # User stories and acceptance criteria
│   │   ├── design.md              # Technical design and architecture
│   │   └── tasks.md               # Implementation task breakdown
│   └── content-wellness-tracker/  # Focused wellness tracking feature
│       └── requirements.md        # Feature requirements
└── steering/                      # Project guidance documents
    ├── product.md                 # Product overview and principles
    ├── tech.md                    # Technology stack and practices
    └── structure.md               # This file - project organization

packages/                          # Monorepo packages
├── backend-api/                   # Express.js backend API service
├── browser-extension/             # Browser extension with WebExtensions API
├── infrastructure/                # AWS CDK infrastructure as code
├── lambda-functions/              # AWS Lambda functions for data processing
├── shared/                        # Shared types and utilities
└── web-dashboard/                 # React web dashboard
```

## Monorepo Package Structure

Each package follows a consistent structure:

```
packages/{package-name}/
├── src/                          # Source code
├── dist/                         # Compiled output (generated)
├── package.json                  # Package-specific dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── __tests__/                    # Package-specific tests
    ├── unit/                     # Unit tests
    ├── property/                 # Property-based tests
    └── integration/              # Integration tests
```

## File Naming Conventions

### Specifications
- Use kebab-case for feature directory names (e.g., `mindful-browse`)
- Standard file names: `requirements.md`, `design.md`, `tasks.md`
- Reference external files using format: `#[[file:relative_file_name]]`

### Code Files
- Use kebab-case for file and directory names
- TypeScript files use `.ts` or `.tsx` extensions
- Test files use `.unit.test.ts`, `.property.test.ts`, or `.integration.test.ts` suffixes
- React component files use PascalCase for component names
- Package names use scoped format: `@mindful-browse/package-name`

### Configuration Files
- Each package has its own `package.json` and `tsconfig.json`
- Root-level configuration files apply to all packages
- AWS resource naming follows pattern: `{service}-{environment}-{feature}`
- Secrets and sensitive data managed through AWS Secrets Manager

## Development Workflow

1. **Specification Phase**: Define requirements, design, and tasks in `.kiro/specs/`
2. **Implementation Phase**: Create source code in appropriate `packages/` directories
3. **Testing Phase**: Implement comprehensive test suites with unit, property-based, and integration tests
4. **Deployment Phase**: Use AWS CDK for infrastructure as code management

## Monorepo Commands

The project uses npm workspaces for monorepo management:

```bash
# Install all dependencies
npm install

# Run commands across all packages
npm run dev          # Start development servers
npm run build        # Build all packages
npm run test         # Run all tests
npm run lint         # Lint all packages

# Run commands for specific packages
npm run dev --workspace=packages/web-dashboard
npm run build --workspace=packages/backend-api

# LocalStack for local AWS testing
npm run localstack:start
npm run localstack:stop
```

## Data Flow Architecture

- Browser Extension → API Gateway → Lambda/ECS → DynamoDB/S3
- Web Dashboard → Application Load Balancer → ECS → DynamoDB
- All components use Amazon Cognito for authentication
- AI/ML processing through Amazon Comprehend and Bedrock