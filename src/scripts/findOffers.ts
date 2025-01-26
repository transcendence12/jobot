import { BulldogJobsScrapper } from "../bot/scrapper/buldogJobsScrapper";
import { CzyJestEldoradoScrapper } from "../bot/scrapper/czyJestEldoradoScrapper";

const searchForJobs = async () => {
  // const buldogJobsscrapper = new BulldogJobsScrapper();
  // const fromBuldogJobsjobOffers = await buldogJobsscrapper.scrapeBulldogJobs('backend', 10);
  // console.log(fromBuldogJobsjobOffers);

  console.log("--------------------------------");

  const czyJestEldoradoScrapper = new CzyJestEldoradoScrapper();
  const fromCzyJestEldoradoScrapper = await czyJestEldoradoScrapper.scrapeCzyJestEldorado('frontend', 10);
  console.log(fromCzyJestEldoradoScrapper);
};

searchForJobs();
