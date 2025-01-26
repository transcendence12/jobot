import { Scrapper } from "./scrapper";

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
  async scrapeBulldogJobs(
    searchValue: string,
    maxRecords: number
  ): Promise<JobOffer[]> {
    await this.init();
    const encodedSearchValue = encodeURIComponent(searchValue);
    await this.navigateTo(
      `https://bulldogjob.pl/companies/jobs/s/role,${encodedSearchValue}`
    );

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
      maxRecords
    );

    const formattedResults = await Promise.all(results.map(async (result) => {
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

    await this.close();
    return formattedResults;
  }
}
