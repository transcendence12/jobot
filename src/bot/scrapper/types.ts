export interface ScrapperOptions {
  searchValue: string;
  maxRecords: number;
}

export interface JobOffer {
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
