module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/nexus'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'nexus/**/*.ts',
    '!nexus/**/*.d.ts',
    '!nexus/**/__tests__/**',
    '!nexus/**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@bridge-2026/(.*)$': '<rootDir>/nexus/$1/src',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

