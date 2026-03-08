import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'https://api.example.com');
vi.stubEnv('VITE_AWS_REGION', 'us-east-1');
vi.stubEnv('VITE_COGNITO_USER_POOL_ID', 'us-east-1_TEST123');
vi.stubEnv('VITE_COGNITO_USER_POOL_CLIENT_ID', 'test-client-id');
vi.stubEnv('VITE_COGNITO_DOMAIN', 'test.auth.us-east-1.amazoncognito.com');
