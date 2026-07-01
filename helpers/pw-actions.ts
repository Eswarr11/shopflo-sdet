import { Page, Locator, expect } from '@playwright/test';
import logger from './logger';

export class PwActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private getLocator(selector: string | Locator): Locator {
    if (typeof selector !== 'string') return selector;

    const testIdMatch = selector.match(/^getByTestId\(['"](.+)['"]\)$/);
    if (testIdMatch) return this.page.locator(`[data-test="${testIdMatch[1]}"]`);

    const labelMatch = selector.match(/^getByLabel\(['"](.+)['"]\)$/);
    if (labelMatch) return this.page.getByLabel(labelMatch[1]);

    const placeholderMatch = selector.match(/^getByPlaceholder\(['"](.+)['"]\)$/);
    if (placeholderMatch) return this.page.getByPlaceholder(placeholderMatch[1]);

    const textMatch = selector.match(/^getByText\(['"](.+)['"]\)$/);
    if (textMatch) return this.page.getByText(textMatch[1]);

    const roleMatch = selector.match(/^getByRole\(['"](\w+)['"](,\s*\{[^}]+\})?\)$/);
    if (roleMatch) {
      const role = roleMatch[1] as Parameters<Page['getByRole']>[0];
      const nameMatch = selector.match(/name:\s*['"]([^'"]+)['"]/);
      return this.page.getByRole(role, nameMatch ? { name: nameMatch[1] } : {});
    }

    return this.page.locator(selector);
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

  async click(selector: string | Locator, description = 'element'): Promise<void> {
    logger.info(`Clicking: ${description}`);
    try {
      await this.getLocator(selector).click();
      logger.info(`Clicked: ${description}`);
    } catch (error) {
      logger.error(`Failed to click "${description}": ${(error as Error).message}`);
      throw error;
    }
  }

  // ─── Fill / Input ─────────────────────────────────────────────────────────

  async fill(selector: string | Locator, value: string, description = 'field'): Promise<void> {
    logger.info(`Filling "${value}" into: ${description}`);
    try {
      await this.getLocator(selector).fill(value);
      logger.info(`Filled: ${description}`);
    } catch (error) {
      logger.error(`Failed to fill "${description}": ${(error as Error).message}`);
      throw error;
    }
  }

  async clearAndFill(
    selector: string | Locator,
    value: string,
    description = 'field',
  ): Promise<void> {
    logger.info(`Clearing and filling "${value}" into: ${description}`);
    try {
      const locator = this.getLocator(selector);
      await locator.clear();
      await locator.fill(value);
      logger.info(`Cleared and filled: ${description}`);
    } catch (error) {
      logger.error(`Failed to clear and fill "${description}": ${(error as Error).message}`);
      throw error;
    }
  }

  async selectOption(
    selector: string | Locator,
    value: string,
    description = 'dropdown',
  ): Promise<void> {
    logger.info(`Selecting option "${value}" in: ${description}`);
    await this.getLocator(selector).selectOption(value);
    logger.info(`Selected "${value}" in: ${description}`);
  }

  // ─── Read ────────────────────────────────────────────────────────────────

  async getText(selector: string | Locator, description = 'element'): Promise<string | null> {
    const text = await this.getLocator(selector).textContent();
    logger.info(`Text from "${description}": "${text}"`);
    return text;
  }

  async getAttributeValue(
    selector: string | Locator,
    attribute: string,
    description = 'element',
  ): Promise<string | null> {
    const value = await this.getLocator(selector).getAttribute(attribute);
    logger.info(`Attribute "${attribute}" of "${description}": "${value}"`);
    return value;
  }

  async getInputValue(selector: string | Locator, description = 'field'): Promise<string> {
    const value = await this.getLocator(selector).inputValue();
    logger.info(`Input value from "${description}": "${value}"`);
    return value;
  }

  async getAllTexts(selector: string | Locator, description = 'elements'): Promise<string[]> {
    const texts = await this.getLocator(selector).allTextContents();
    logger.info(`Got ${texts.length} text(s) from: ${description}`);
    return texts;
  }

  async getCount(selector: string | Locator, description = 'elements'): Promise<number> {
    const count = await this.getLocator(selector).count();
    logger.info(`Count of "${description}": ${count}`);
    return count;
  }

  // ─── Visibility ──────────────────────────────────────────────────────────

  async isVisible(selector: string | Locator, description = 'element'): Promise<boolean> {
    const visible = await this.getLocator(selector).isVisible();
    logger.info(`"${description}" is ${visible ? 'visible' : 'not visible'}`);
    return visible;
  }

  async isEditable(selector: string | Locator, description = 'element'): Promise<boolean> {
    const editable = await this.getLocator(selector).isEditable();
    logger.info(`"${description}" is ${editable ? 'editable' : 'not editable'}`);
    return editable;
  }

  async waitForVisible(
    selector: string | Locator,
    description = 'element',
    timeout = 10000,
  ): Promise<void> {
    logger.info(`Waiting for "${description}" to be visible`);
    await this.getLocator(selector).waitFor({ state: 'visible', timeout });
    logger.info(`"${description}" is now visible`);
  }

  async expectVisible(selector: string | Locator, description = 'element'): Promise<void> {
    logger.info(`Asserting "${description}" is visible`);
    await expect(this.getLocator(selector), `${description} should be visible`).toBeVisible();
    logger.info(`"${description}" is visible`);
  }

  async expectHidden(selector: string | Locator, description = 'element'): Promise<void> {
    logger.info(`Asserting "${description}" is hidden`);
    await expect(this.getLocator(selector), `${description} should be hidden`).toBeHidden();
    logger.info(`"${description}" is hidden`);
  }

  async expectEditable(selector: string | Locator, description = 'element'): Promise<void> {
    logger.info(`Asserting "${description}" is editable`);
    await expect(this.getLocator(selector), `${description} should be editable`).toBeEditable();
    logger.info(`"${description}" is editable`);
  }
}
