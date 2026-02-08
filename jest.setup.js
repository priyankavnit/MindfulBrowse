// Global test setup
process.env.NODE_ENV = 'test';

// Mock AWS SDK for tests
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-comprehend');
jest.mock('@aws-sdk/client-cognito-identity-provider');
jest.mock('@aws-sdk/client-bedrock-runtime');

// Global test timeout
jest.setTimeout(30000);