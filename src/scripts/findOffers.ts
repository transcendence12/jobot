import { BulldogJobsScrapper } from "../bot/scrapper/buldogJobsScrapper";

const searchForJobs = async () => {
  const scrapper = new BulldogJobsScrapper();
  const jobOffers = await scrapper.scrapeBulldogJobs('backend', 10);
  console.log(jobOffers);
};

searchForJobs();
