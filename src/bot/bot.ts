import schedule from "node-schedule";
import { findOffers } from "../scripts/findOffers";
export class Bot {
  // Logic should be encapsulated in bot class body
  constructor() {
    this.setupCronJob();
  }

  scrapeOffers() {
    console.log("Starting job scraping...");

    findOffers("Javascript Developer", 30)
      .then(() => {
        console.log("Job scraping completed.");
      })
      .catch((error) => {
        console.error("Error during scraping:", error);
      });
  }

  setupCronJob() {
    // Set up the CRON job to run every day at 9:00 from Monday to Friday
    schedule.scheduleJob("'0 9 * * 1-5'", this.scrapeOffers.bind(this));
    console.log("CRON job has been set up.");
  }
}
const bot = new Bot();
