import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const isCi = !!process.env.CI;
const currentShard = process.env.CURRENT_SHARD
  ? parseInt(process.env.CURRENT_SHARD, 10)
  : undefined;
const totalShards = process.env.TOTAL_SHARDS
  ? parseInt(process.env.TOTAL_SHARDS, 10)
  : undefined;

const reporters: Parameters<typeof defineConfig>[0]['reporter'] = [
  ['blob', { outputDir: 'reports/blob' }],
  ['allure-playwright', {
    resultsDir: 'reports/allure-results',
    detail: true,
    suiteTitle: true,
  }],
];

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  retries: isCi ? 1 : 0,
  workers: process.env.WORKERS
    ? Number(process.env.WORKERS)
    : isCi
      ? 2
      : undefined,
  shard: !isCi && currentShard && totalShards
    ? { current: currentShard, total: totalShards }
    : undefined,
  globalSetup: path.resolve(__dirname, 'global-setup'),
  globalTeardown: path.resolve(__dirname, 'global-teardown'),
  reporter: reporters,
  use: {
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-test',
  },
  projects: [
    {
      name: 'api',
      testDir: './api/tests',
      use: { baseURL: process.env.API_BASE_URL || 'https://fakestoreapi.com' },
    },
    {
      name: 'ui',
      testDir: './ui/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL || 'https://www.saucedemo.com',
        headless:  process.env.HEADED !== 'true',
      },
    },
  ],
});
