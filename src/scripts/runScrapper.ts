import yargs from "yargs";
import { findOffers } from "./findOffers";

const argv = yargs
  .option('s', {
    alias: 'search',
    type: 'string',
    description: 'Search value',
    demandOption: true,
  })
  .option('l', {
    alias: 'limit',
    type: 'number',
    description: 'Limit of records',
    demandOption: true,
  })
  .help()
  .alias('h', 'help')
  .parse();

findOffers(argv.s, argv.l);
