/** @type {import('jest').Config} */
module.exports = {
  // Where Jest should look for tests
  roots: [
    '<rootDir>/__tests__',          // unit / component tests
    '<rootDir>/integration-tests'   // integration tests
  ],

  // Global hooks that start and stop the in‑memory MongoDB
  globalSetup: '<rootDir>/integration-tests/globalSetup.js',
  globalTeardown: '<rootDir>/integration-tests/globalTeardown.js',

  // Default environment (jsdom works for both React and Node code;
  // adjust to "node" if you prefer and add @jest-environment pragmas for jsdom tests)
  testEnvironment: 'jsdom',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
  },

  transform: {
    '^.+\\.(js|jsx|mjs)$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'ecmascript', jsx: true },
          transform: { react: { runtime: 'automatic' } }
        },
        module: { type: 'es6' }
      }
    ]
  },
  
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|axios)/)'
  ],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  forceExit: true
};
