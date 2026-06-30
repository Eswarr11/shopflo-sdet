import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Normalize paths when merging blobs from host (ubuntu-latest) and container jobs.
  testDir: '.',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
