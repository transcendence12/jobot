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

  /**
   * Scrapes job offers from the current page up to the maxRecords limit
   * @returns An array of job offers
   */
  async scrapeJobOffers(maxRecords: number): Promise<string[]> {
    if (!this.page) {
      throw new Error("Page not initialized");
    }

    const jobOffers: string[] = [];
    const jobSelector = ".container a";

    const offers = await this.page.$$(jobSelector);
    for (let i = 0; i < Math.min(maxRecords, offers.length); i++) {
      const offer = offers[i];
      const title = await this.extractFromElement(offer, 'div > h3');
      jobOffers.push(title);
    }

    return jobOffers;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
