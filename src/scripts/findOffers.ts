import { BulldogJobsScrapper } from "../bot/scrapper/buldogJobsScrapper";
import { CzyJestEldoradoScrapper } from "../bot/scrapper/czyJestEldoradoScrapper";
import fs from "fs";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { ScrapperOptions } from "../bot/scrapper/types";
import puppeteer from "puppeteer";

export const findOffers = async (searchTerm: string, limit: number = 10) => {
  let browser = null;
  try {
    console.log(`Searching for: ${searchTerm} with limit: ${limit}`);
    const options: ScrapperOptions = {
      searchValue: searchTerm,
      maxRecords: limit,
    };

    browser = await puppeteer.launch({ 
      headless: false, 
      slowMo: 250,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const buldogJobsScrapper = new BulldogJobsScrapper(options);
    const czyJestEldoradoScrapper = new CzyJestEldoradoScrapper(options);

    // Share the browser instance
    buldogJobsScrapper.browser = browser;
    czyJestEldoradoScrapper.browser = browser;

    // Run scrapers sequentially to avoid conflicts
    console.log('Starting Bulldog Jobs scraper...');
    const fromBuldogJobsJobOffers = await buldogJobsScrapper.scrapeBulldogJobs();
    await buldogJobsScrapper.close(); // Close only the page

    console.log('Starting CzyJestEldorado scraper...');
    const fromCzyJestEldoradoScrapper = await czyJestEldoradoScrapper.scrapeCzyJestEldorado();
    await czyJestEldoradoScrapper.close(); // Close only the page

    console.log('Bulldog Jobs results:', fromBuldogJobsJobOffers);
    console.log('Czy Jest Eldorado results:', fromCzyJestEldoradoScrapper);

    const allOffers = [
      ...fromBuldogJobsJobOffers,
      ...fromCzyJestEldoradoScrapper,
    ].filter(offer => offer !== null);

    console.log('Combined offers:', allOffers);

    if (!allOffers.length) {
      console.log('No offers found');
      return [];
    }

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

    await saveToFiles(formattedOffers);
    console.log('Returning formatted offers:', formattedOffers);

    return formattedOffers;
  } catch (error) {
    console.error('Error in findOffers:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
};

async function saveToFiles(formattedOffers) {
  try {
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
    console.log(`Offers saved to CSV`);
  } catch (error) {
    console.error('Error saving files:', error);
    throw error;
  }
}
