import { chromium, FullConfig, Browser } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { USERS, PASSWORD } from './config/constants';

const AUTH_DIR = path.join(process.cwd(), '.auth');
const FRESHNESS_MS = 24 * 60 * 60 * 1000;

const LOGIN_SEL = {
  username:    '//input[@data-test="username"]',
  password:    '//input[@data-test="password"]',
  loginButton: '//input[@data-test="login-button"]',
};

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
  const context = await browser.newContext({ baseURL, storageState: authFile });
  const page = await context.newPage();
  await page.goto('/inventory.html');
  const valid = page.url().includes('inventory.html');
  await context.close();
  return valid;
}

async function loginAndSaveState(
  browser: Browser,
  baseURL: string,
  username: string,
  authFile: string,
): Promise<void> {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.goto(baseURL);
  await page.locator(LOGIN_SEL.username).fill(username);
  await page.locator(LOGIN_SEL.password).fill(PASSWORD);
  await page.locator(LOGIN_SEL.loginButton).click();
  await page.waitForURL('**/inventory.html');

  await context.storageState({ path: authFile });
  console.log(`[Setup] Auth saved for ${username}`);
  await context.close();
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

  for (const username of AUTH_USERS) {
    const authFile = path.join(AUTH_DIR, `${username}.json`);
    if (isAuthFileValid(authFile) && await verifyAuthFile(browser, baseURL, authFile)) {
      console.log(`[Setup] Auth file fresh for ${username}, skipping login`);
      continue;
    }
    console.log(`[Setup] Logging in as ${username}`);
    await loginAndSaveState(browser, baseURL, username, authFile);
  }

  await browser.close();
}

export default globalSetup;
