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


  setTimeout(() => {
    console.log(`${options.maxRecords} offers found.`);
  }, 3000);
};

findOffers("backend", 10);
