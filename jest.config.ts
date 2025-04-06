import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Uncomment if you create a setup file
  preset: 'ts-jest',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/public/',
    '/app/api/', // Usually don't test API routes directly with unit tests
    '/lib/fragments.ts', // Generated or simple data files
    '/lib/SortConfig.ts',
    '/lib/theme-config.ts',
    '/lib/theme-utils.ts',
    '/lib/types/', // Type definitions
    '/components/ui/', // Assuming Shadcn UI components are generally trusted
    'middleware.ts',
    'next.config.ts',
    'postcss.config.mjs',
    'eslint.config.mjs',
    'components.json',
    'app/layout.tsx', // Often complex to unit test
    'app/page.tsx', // Entry pages might be better suited for E2E tests
    'app/sitemap.ts',
    'app/robots.ts',
    'app/favicon.ico',
    'app/opengraph-image.png',
    'app/[country]/loading.tsx',
    'app/[country]/page.tsx',
    'app/[country]/error/page.tsx',
    'app/[country]/coming-soon/page.tsx',
    'app/[country]/cart/page.tsx',
    'app/[country]/wishlist/page.tsx',
    'app/[country]/collections/[collectionSlug]/page.tsx',
    'app/[country]/products/[productSlug]/page.tsx',
    'app/[country]/search/[searchQuery]/page.tsx',
    'lib/apollo/apollo-wrapper.tsx', // Wrapper component
  ],
  // The test environment that will be used for testing
  testEnvironmentOptions: {
    // Needed for React 18+ testing with JSDOM
    customExportConditions: [''],
  },
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // An array of regexp pattern strings that are matched against all test paths before executing the test
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/e2e/', // Assuming you might have end-to-end tests elsewhere
  ],
  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
