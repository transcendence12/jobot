import { BulldogJobsScrapper } from "../bot/scrapper/buldogJobsScrapper";
import { CzyJestEldoradoScrapper } from "../bot/scrapper/czyJestEldoradoScrapper";
import fs from "fs";
import path from "path";
import {createObjectCsvWriter} from "csv-writer";

const searchForJobs = async () => {
  const buldogJobsscrapper = new BulldogJobsScrapper();
  const fromBuldogJobsjobOffers = await buldogJobsscrapper.scrapeBulldogJobs('backend', 10);
  console.log(fromBuldogJobsjobOffers);

  console.log("--------------------------------");

  const czyJestEldoradoScrapper = new CzyJestEldoradoScrapper();
  const fromCzyJestEldoradoScrapper = await czyJestEldoradoScrapper.scrapeCzyJestEldorado('frontend', 10);
  console.log(fromCzyJestEldoradoScrapper);

  const allOffers = [...fromBuldogJobsjobOffers, ...fromCzyJestEldoradoScrapper];
  console.log(allOffers);

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

  const outputPath = path.join(__dirname, '../../scrap-results/results.json');
  fs.writeFileSync(outputPath, JSON.stringify(formattedOffers, null, 2), 'utf-8');
  console.log(`Offers saved to ${outputPath}`);

  const writeToCSV = createObjectCsvWriter({
    path: path.join(__dirname, '../../scrap-results/results.csv'),
    header: Object.keys(formattedOffers[0]).map((key) => ({id: key, title: key}))
  })

  await writeToCSV.writeRecords(formattedOffers);
  console.log(`Offers saved to ${outputPath}`);
};

searchForJobs();
