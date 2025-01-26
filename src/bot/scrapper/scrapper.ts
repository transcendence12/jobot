import puppeteer, { Browser, Page } from "puppeteer";
import { ScrapperOptions } from "./types";
export class Scrapper {
  // Scrapper should be a set of methods that you could use for navigating through scrapped website.
  browser: Browser | null = null;
  page: Page | null = null;
  options: ScrapperOptions | null = null;

  async init() {
    this.browser = await puppeteer.launch({ headless: false, slowMo: 250 });
    this.page = await this.browser.newPage();
  }

  async navigateTo(url: string) {
    if (!this.page) {
      throw new Error("Page not initialized");
    }
    await this.page.goto(url);
  }

  /**
   * Extracts content from a child element within a parent element using a CSS selector
   * @param element - Parent element to search within
   * @param selector - CSS selector to find the child element
   * @param attribute - Optional attribute to extract from child element. If not provided, returns text content
   * @returns Extracted attribute value or text content as string, empty string if element/attribute not found
   */
  async extractFromElement(
    element: any | null,
    selector: string,
    attribute?: string
  ) {
    if (!this.page || !element) return "";
    const childElement = await element.$(selector);
    if (!childElement) return "";

    if (attribute) {
      return await this.page.evaluate(
        (el, attribute) => el.getAttribute(attribute),
        childElement,
        attribute
      );
    } else {
      return await this.page.evaluate(
        (el) => el.textContent.trim(),
        childElement
      );
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
