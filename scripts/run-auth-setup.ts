import type { FullConfig } from '@playwright/test';
import globalSetup from '../global-setup';

const config = {
  projects: [
    {
      name: 'ui',
      use: { baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com' },
    },
  ],
} as FullConfig;

async function main(): Promise<void> {
  await globalSetup(config);
  console.log('[Setup] Auth setup complete');
}

main().catch((error: unknown) => {
  console.error('[Setup] Auth setup failed:', error);
  process.exit(1);
});
