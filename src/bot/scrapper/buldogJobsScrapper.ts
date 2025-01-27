import { Scrapper } from "./scrapper";
import { ScrapperOptions } from "./types";

interface JobOffer {
  title: string | null;
  description: string | null;
  company: string | null;
  salaryFrom: string | null;
  salaryTo: string | null;
  currency: string | null;
  offerURL: string | null;
  technologies: string[];
  addedAt: string | null;
}

export class BulldogJobsScrapper extends Scrapper {
  constructor(options: ScrapperOptions) {
    super();
    this.options = options;
  }

  async scrapeBulldogJobs(): Promise<JobOffer[]> {
    try {
      await this.init();
      const encodedSearchValue = encodeURIComponent(this.options.searchValue);
      await this.navigateTo(
        `https://bulldogjob.pl/companies/jobs/s/role,${encodedSearchValue}`
      );
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Wait for the main content to load
      await this.page?.waitForSelector(".container a");

      const containerSelector = ".container a";

      const results = await this.scrapeElements<
        Omit<JobOffer, 'technologies'> & { salary: string; element: any }
      >(
        {
          containerSelector,
          fields: [
            { name: "title", selector: "div > h3" },
            { name: "description", selector: null },
            { name: "company", selector: ".text-xxs" },
            {
              name: "salary",
              selector: "div.lg\\:font-extrabold.md\\:text-xl.text-dm.leading-8",
            },
            { name: "addedAt", selector: "" },
          ],
        },
        this.options.maxRecords
      );

      const formattedResults = await Promise.all(results.map(async (result) => {
        // Filter out unwanted results
        if (!result.title || result.offerURL === "/privacy_policy") {
          return null;
        }

        const salaryParts = result.salary?.split(" ") || [];
        const currency = salaryParts.pop() || null;
        const salaryRange = salaryParts.join(" ");
        const [salaryFrom, salaryTo] = salaryRange.split("-").map(s => s.trim()) || [null, null];
        
        const technologies = await this.extractMultipleFromElement(
          result.element,
          "div.flex.flex-wrap.justify-end.gap-3 > span"
        );

        const offerURL = await result.element.evaluate((a: any) => a.getAttribute('href'));

        const { element, ...rest } = result;

        return {
          ...rest,
          salaryFrom,
          salaryTo,
          currency,
          offerURL,
          technologies,
        };
      }));

      return formattedResults.filter(offer => offer !== null);
    } finally {
      await this.close();
    }
  }
}
