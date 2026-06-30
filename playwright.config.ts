import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const currentShard = process.env.CURRENT_SHARD
  ? parseInt(process.env.CURRENT_SHARD, 10)
  : undefined;
const totalShards = process.env.TOTAL_SHARDS
  ? parseInt(process.env.TOTAL_SHARDS, 10)
  : undefined;
const shardLabel = currentShard?.toString() ?? '1';

const reporters: Parameters<typeof defineConfig>[0]['reporter'] = [
  ['html', { outputFolder: `reports/html/shard-${shardLabel}`, open: 'never' }],
  ['allure-playwright', {
    resultsDir: `reports/allure-results/shard-${shardLabel}`,
    detail: true,
    suiteTitle: true,
  }],
];

if (process.env.CI) {
  reporters.unshift(['blob', { outputDir: `reports/blob/shard-${shardLabel}` }]);
}

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.WORKERS
    ? Number(process.env.WORKERS)
    : process.env.CI
      ? 2
      : undefined,
  shard: currentShard && totalShards
    ? { current: currentShard, total: totalShards }
    : undefined,
  globalSetup: './global-setup',
  globalTeardown: './global-teardown',
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
      // To add more browsers: copy this block and swap devices['Desktop Chrome']
      // for devices['Desktop Firefox'] or devices['Desktop Safari']
      name: 'ui',
      testDir: './ui/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL || 'https://www.saucedemo.com',
        headless: process.env.HEADED !== 'true',
      },
    },
  ],
});
