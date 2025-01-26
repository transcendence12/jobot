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
  ): Promise<string | null> {
    if (!this.page || !element || !selector) return null;
    const childElement = await element.$(selector);
    if (!childElement) return null;

    if (attribute) {
      return await this.page.evaluate(
        (el, attribute) => el.getAttribute(attribute),
        childElement,
        attribute
      );
    } else {
      return await this.page.evaluate(
        (el) => el.textContent?.trim() || null,
        childElement
      );
    }
  }

  /**
   * Generic method to scrape elements from the page
   * @param scrapingConfig - Configuration for scraping elements
   * @param maxRecords - Maximum number of records to scrape
   * @returns Array of extracted data
   */
  async scrapeElements<T>(
    scrapingConfig: {
      containerSelector: string;
      fields: {
        name: keyof T;
        selector: string;
        attribute?: string;
      }[];
    },
    maxRecords: number
  ): Promise<(T & { element: any })[]> {
    if (!this.page) {
      throw new Error("Page not initialized");
    }

    const results: (T & { element: any })[] = [];
    const elements = await this.page.$$(scrapingConfig.containerSelector);

    for (let i = 0; i < Math.min(maxRecords, elements.length); i++) {
      const element = elements[i];
      const extractedData = {} as T;

      for (const field of scrapingConfig.fields) {
        const value = field.selector
          ? await this.extractFromElement(element, field.selector, field.attribute)
          : null;
        extractedData[field.name] = value as T[keyof T];
      }

      results.push({ ...extractedData, element });
    }

    return results;
  }

  /**
   * Scrapes job offers from the current page up to the maxRecords limit
   * @returns An array of job offers
   */
  // async scrapeJobOffers(maxRecords: number): Promise<string[]> {
  //   interface JobOffer {
  //     title: string;
  //   }

  //   const results = await this.scrapeElements<JobOffer>(
  //     {
  //       containerSelector: '.container a',
  //       fields: [
  //         {
  //           name: 'title',
  //           selector: 'div > h3'
  //         }
  //       ]
  //     },
  //     maxRecords
  //   );

  //   return results.map(result => result.title);
  // }

  async extractMultipleFromElement(
    element: any | null,
    selector: string
  ): Promise<string[]> {
    if (!this.page || !element || !selector) return [];
    const childElements = await element.$$(selector);
    const texts = await Promise.all(
      childElements.map(async (child) => {
        return await this.page.evaluate(
          (el) => el.textContent?.trim() || "",
          child
        );
      })
    );
    return texts.filter(text => text !== "");
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
