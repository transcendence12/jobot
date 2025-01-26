import { Scrapper } from "../bot/scrapper/scrapper";
import { ScrapperOptions } from "../bot/scrapper/types";

const findOffers = async (searchValue: string, maxRecords: number = 10) => {
  console.log("Scrapping...");
  const options: ScrapperOptions = {
    searchValue,
    maxRecords,
  };
  const scrapper = new Scrapper();
  scrapper.options = options;
  await scrapper.init();
  await scrapper.navigateTo(`https://bulldogjob.pl/companies/jobs/s/role,${searchValue}`);

  const offers = await scrapper.scrapeJobOffers(maxRecords);
  console.log(`${offers.length} offers found:`, offers);

  await scrapper.close();
};

findOffers("backend", 10);
