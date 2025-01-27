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

export class CzyJestEldoradoScrapper extends Scrapper {
  constructor(options: ScrapperOptions) {
    super();
    this.options = options;
  }

  async scrapeCzyJestEldorado(): Promise<JobOffer[]> {
    await this.init();
    const encodedSearchValue = encodeURIComponent(this.options.searchValue);
    await this.navigateTo(
      `https://czyjesteldorado.pl/search?q=${encodedSearchValue}`
    );
    await this.page?.waitForSelector("div.row.offer-list");
    const containerSelector = "div.row.offer-list";

    const results = await this.scrapeElements<
      Omit<JobOffer, 'technologies'> & { salary: string; element: any }
    >(
      {
        containerSelector,
        fields: [
          { name: "title", selector: "div > h3" },
          { name: "description", selector: null },
          { name: "company", selector: "span.d-block.float-none.d-md-inline.float-md-start.ms-md-1.text-primary.small.mt-1" },
          {
            name: "salary",
            selector: "span.text-success.text-nowrap.small.fw-bold > span",
          },
          { name: "addedAt", selector: "" },
        ],
      },
      this.options.maxRecords
    );

    const formattedResults = await Promise.all(results.map(async (result) => {
      const salaryText = result.salary?.replace(/&nbsp;/g, " ") || "";
      const [salaryRange] = salaryText.split(" zł");
      const [salaryFrom, salaryTo] = salaryRange.split("-").map(s => s.trim()) || [null, null];

      const offerURL = await result.element.$eval(
        "a.text-decoration-none",
        (a: any) => a.getAttribute('href')
      );

      const technologies = await this.extractMultipleFromElement(
        result.element,
        "span.small.text-muted.font-monospace.ms-md-2"
      );

      const { element, ...rest } = result;

      return {
        ...rest,
        salaryFrom,
        salaryTo,
        currency: "PLN",
        offerURL,
        technologies: technologies.length ? technologies[0].split(" ") : [],
      };
    }));

    await this.close();
    return formattedResults;
  }
}