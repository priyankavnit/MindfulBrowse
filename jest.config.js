module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.test.ts',
    '!packages/*/src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@mindful-browse/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
  },
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/packages/**/*.unit.test.ts'],
    },
    {
      displayName: 'property',
      testMatch: ['<rootDir>/packages/**/*.property.test.ts'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/packages/**/*.integration.test.ts'],
    },
  ],
};