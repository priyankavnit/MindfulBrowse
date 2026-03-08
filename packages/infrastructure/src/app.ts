#!/usr/bin/env node
import 'source-map-support/register.js';
import * as cdk from 'aws-cdk-lib';
import { MindfulBrowseStack } from './mindful-browse-stack.js';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') || 'dev';

new MindfulBrowseStack(app, `MindfulBrowseStack-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment,
  description: `Mindful Browse MVP infrastructure for ${environment} environment`,
});

app.synth();
