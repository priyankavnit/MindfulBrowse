#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MindfulBrowseStack } from './mindful-browse-stack';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev';

// Validate environment
if (!['dev', 'staging', 'prod'].includes(environment)) {
  throw new Error(`Invalid environment: ${environment}. Must be one of: dev, staging, prod`);
}

// Create the main stack
new MindfulBrowseStack(app, `MindfulBrowseStack-${environment}`, {
  environment: environment as 'dev' | 'staging' | 'prod',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  tags: {
    Project: 'MindfulBrowse',
    Environment: environment,
    ManagedBy: 'CDK',
  },
});