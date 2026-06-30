import type { FullConfig } from '@playwright/test';
import globalSetup from '../global-setup';

const config = {
  projects: [{
    name: 'ui',
    use: { baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com' },
  }],
} as FullConfig;

void globalSetup(config);
