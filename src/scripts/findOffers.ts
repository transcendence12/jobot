import { BulldogJobsScrapper } from "../bot/scrapper/buldogJobsScrapper";
import { CzyJestEldoradoScrapper } from "../bot/scrapper/czyJestEldoradoScrapper";
import fs from "fs";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { ScrapperOptions } from "../bot/scrapper/types";

export const findOffers = async (searchTerm: string, limit: number = 10) => {
  const options: ScrapperOptions = {
    searchValue: searchTerm,
    maxRecords: limit,
  };

  const buldogJobsScrapper = new BulldogJobsScrapper(options);
  const czyJestEldoradoScrapper = new CzyJestEldoradoScrapper(options);

  const fromBuldogJobsJobOffers = await buldogJobsScrapper.scrapeBulldogJobs();
  const fromCzyJestEldoradoScrapper = await czyJestEldoradoScrapper.scrapeCzyJestEldorado();

  const allOffers = [
    ...fromBuldogJobsJobOffers,
    ...fromCzyJestEldoradoScrapper,
  ];

  const formattedOffers = allOffers.map((offer) => ({
    Title: offer.title,
    Description: offer.description,
    Company: offer.company,
    Salary_From: offer.salaryFrom,
    Salary_To: offer.salaryTo,
    Currency: offer.currency,
    Offer_URL: offer.offerURL,
    Technologies: offer.technologies,
    Added_At: offer.addedAt,
  }));

  const outputPath = path.join(__dirname, "../../scrap-results/results.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(formattedOffers, null, 2),
    "utf-8"
  );
  console.log(`Offers saved to ${outputPath}`);

  const writeToCSV = createObjectCsvWriter({
    path: path.join(__dirname, "../../scrap-results/results.csv"),
    header: Object.keys(formattedOffers[0]).map((key) => ({
      id: key,
      title: key,
    })),
  });

  await writeToCSV.writeRecords(formattedOffers);
  console.log(`Offers saved to ${path.join(__dirname, "../../scrap-results/results.csv")}`);
};
