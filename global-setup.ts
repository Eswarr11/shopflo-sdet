import { chromium, FullConfig, Browser } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { USERS, PASSWORD } from './config/constants';
import { LoginPage } from './ui/pages/login.page';

const AUTH_DIR = path.join(process.cwd(), '.auth');
const FRESHNESS_MS = 24 * 60 * 60 * 1000;
const SETUP_TIMEOUT_MS = 60_000;
const PERFORMANCE_GLITCH_TIMEOUT_MS = 90_000;

const AUTH_USERS = [
  USERS.STANDARD,
  USERS.PROBLEM,
  USERS.PERFORMANCE_GLITCH,
  USERS.ERROR,
  USERS.VISUAL,
] as const;

function isAuthFileValid(authFile: string): boolean {
  if (!fs.existsSync(authFile)) return false;
  const age = Date.now() - fs.statSync(authFile).mtimeMs;
  if (age >= FRESHNESS_MS) return false;
  try {
    const state = JSON.parse(fs.readFileSync(authFile, 'utf8')) as { cookies?: unknown[] };
    return Array.isArray(state.cookies) && state.cookies.length > 0;
  } catch {
    return false;
  }
}

async function verifyAuthFile(
  browser: Browser,
  baseURL: string,
  authFile: string,
): Promise<boolean> {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  page.setDefaultTimeout(SETUP_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(SETUP_TIMEOUT_MS);

  try {
    await page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/inventory\.html/, { timeout: 15_000 });
    return true;
  } catch {
    return false;
  } finally {
    await context.close();
  }
}

async function loginAndSaveState(
  browser: Browser,
  baseURL: string,
  username: string,
  authFile: string,
): Promise<void> {
  const inventoryTimeout = username === USERS.PERFORMANCE_GLITCH
    ? PERFORMANCE_GLITCH_TIMEOUT_MS
    : SETUP_TIMEOUT_MS;

  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  page.setDefaultTimeout(inventoryTimeout);
  page.setDefaultNavigationTimeout(inventoryTimeout);

  try {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(username, PASSWORD);
    await page.waitForURL(/inventory\.html/, { timeout: inventoryTimeout });

    await context.storageState({ path: authFile });
    console.log(`[Setup] Auth saved for ${username}`);
  } catch (error) {
    throw new Error(
      `[Setup] Login failed for ${username}: ${(error as Error).message}`,
    );
  } finally {
    await context.close();
  }
}

function isApiOnlyRun(): boolean {
  const projects: string[] = [];
  const args = process.argv;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--project' && args[i + 1]) {
      projects.push(args[i + 1]);
      i++;
    } else if (arg?.startsWith('--project=')) {
      projects.push(arg.split('=')[1]);
    }
  }

  return projects.length > 0 && projects.every((project) => project === 'api');
}

async function globalSetup(config: FullConfig): Promise<void> {
  if (process.env.SKIP_GLOBAL_SETUP === 'true') {
    console.log('[Setup] SKIP_GLOBAL_SETUP=true — skipping auth setup');
    return;
  }

  if (isApiOnlyRun()) {
    console.log('[Setup] API-only run detected — skipping UI auth setup');
    return;
  }

  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const baseURL = config.projects
    .find((p) => p.name === 'ui')
    ?.use?.baseURL ?? 'https://www.saucedemo.com';

  const browser = await chromium.launch({ headless: true });

  try {
    for (const username of AUTH_USERS) {
      const authFile = path.join(AUTH_DIR, `${username}.json`);
      if (isAuthFileValid(authFile) && await verifyAuthFile(browser, baseURL, authFile)) {
        console.log(`[Setup] Auth file fresh for ${username}, skipping login`);
        continue;
      }
      console.log(`[Setup] Logging in as ${username}`);
      await loginAndSaveState(browser, baseURL, username, authFile);
    }
  } finally {
    await browser.close();
  }
}

export default globalSetup;
