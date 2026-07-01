import { Page, Locator, expect } from '@playwright/test';
import logger from './logger';

export class PwActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  async goto(url: string): Promise<void> {
    logger.info(`Navigating to: ${url}`);
    try {
      await this.page.goto(url);
      logger.info(`Navigated to: ${url}`);
    } catch (error) {
      logger.error(`Navigation failed to "${url}": ${(error as Error).message}`);
      throw error;
    }
  }

  async waitForURL(url: string | RegExp, timeout = 30000): Promise<void> {
    logger.info(`Waiting for URL: ${String(url)}`);
    await this.page.waitForURL(url, { timeout });
    logger.info(`URL matched: ${String(url)}`);
  }

  // ─── Click ───────────────────────────────────────────────────────────────

  async click(locator: Locator, description = 'element'): Promise<void> {
    logger.info(`Clicking: ${description}`);
    try {
      await locator.click();
      logger.info(`Clicked: ${description}`);
    } catch (error) {
      logger.error(`Failed to click "${description}": ${(error as Error).message}`);
      throw error;
    }
  }

  // ─── Fill / Input ─────────────────────────────────────────────────────────

  async fill(locator: Locator, value: string, description = 'field'): Promise<void> {
    logger.info(`Filling "${value}" into: ${description}`);
    try {
      await locator.fill(value);
      logger.info(`Filled: ${description}`);
    } catch (error) {
      logger.error(`Failed to fill "${description}": ${(error as Error).message}`);
      throw error;
    }
  }

  async clearAndFill(locator: Locator, value: string, description = 'field'): Promise<void> {
    logger.info(`Clearing and filling "${value}" into: ${description}`);
    try {
      await locator.clear();
      await locator.fill(value);
      logger.info(`Cleared and filled: ${description}`);
    } catch (error) {
      logger.error(`Failed to clear and fill "${description}": ${(error as Error).message}`);
      throw error;
    }
  }

  async selectOption(locator: Locator, value: string, description = 'dropdown'): Promise<void> {
    logger.info(`Selecting option "${value}" in: ${description}`);
    await locator.selectOption(value);
    logger.info(`Selected "${value}" in: ${description}`);
  }

  // ─── Read ────────────────────────────────────────────────────────────────

  async getText(locator: Locator, description = 'element'): Promise<string | null> {
    const text = await locator.textContent();
    logger.info(`Text from "${description}": "${text}"`);
    return text;
  }

  async getAttributeValue(
    locator: Locator,
    attribute: string,
    description = 'element',
  ): Promise<string | null> {
    const value = await locator.getAttribute(attribute);
    logger.info(`Attribute "${attribute}" of "${description}": "${value}"`);
    return value;
  }

  async getInputValue(locator: Locator, description = 'field'): Promise<string> {
    const value = await locator.inputValue();
    logger.info(`Input value from "${description}": "${value}"`);
    return value;
  }

  async getAllTexts(locator: Locator, description = 'elements'): Promise<string[]> {
    const texts = await locator.allTextContents();
    logger.info(`Got ${texts.length} text(s) from: ${description}`);
    return texts;
  }

  async getCount(locator: Locator, description = 'elements'): Promise<number> {
    const count = await locator.count();
    logger.info(`Count of "${description}": ${count}`);
    return count;
  }

  // ─── Visibility ──────────────────────────────────────────────────────────

  async isVisible(locator: Locator, description = 'element'): Promise<boolean> {
    const visible = await locator.isVisible();
    logger.info(`"${description}" is ${visible ? 'visible' : 'not visible'}`);
    return visible;
  }

  async isEditable(locator: Locator, description = 'element'): Promise<boolean> {
    const editable = await locator.isEditable();
    logger.info(`"${description}" is ${editable ? 'editable' : 'not editable'}`);
    return editable;
  }

  async waitForVisible(locator: Locator, description = 'element', timeout = 10000): Promise<void> {
    logger.info(`Waiting for "${description}" to be visible`);
    await locator.waitFor({ state: 'visible', timeout });
    logger.info(`"${description}" is now visible`);
  }

  async expectVisible(locator: Locator, description = 'element'): Promise<void> {
    logger.info(`Asserting "${description}" is visible`);
    await expect(locator, `${description} should be visible`).toBeVisible();
    logger.info(`"${description}" is visible`);
  }

  async expectHidden(locator: Locator, description = 'element'): Promise<void> {
    logger.info(`Asserting "${description}" is hidden`);
    await expect(locator, `${description} should be hidden`).toBeHidden();
    logger.info(`"${description}" is hidden`);
  }

  async expectEditable(locator: Locator, description = 'element'): Promise<void> {
    logger.info(`Asserting "${description}" is editable`);
    await expect(locator, `${description} should be editable`).toBeEditable();
    logger.info(`"${description}" is editable`);
  }
}
