export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './src/__tests__/setup/globalSetup.ts',
  globalTeardown: './src/__tests__/setup/globalTeardown.ts',
  setupFilesAfterEnv: ['./src/__tests__/setup/db.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/workers/index.ts',
    '!src/db/seed.ts'
  ],
  coverageReporters: ['lcov', 'text', 'html'],
  moduleNameMapper: {
    '^@coels-crms/shared(.*)$': '<rootDir>/../shared/src$1'
  }
};
