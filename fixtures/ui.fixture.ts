import { test as base, expect } from '@playwright/test';
import { POManager } from '../ui/pages/po-manager';

type UiFixtures = {
  poManager: POManager;
};

export const test = base.extend<UiFixtures>({
  page: async ({ page }, use) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await use(page);
  },
  poManager: async ({ page }, use) => {
    await use(new POManager(page));
  },
});

export { expect } from '@playwright/test';
