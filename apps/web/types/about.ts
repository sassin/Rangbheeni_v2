import type { ImageAsset } from "./content";

export type AboutWhoWeAre = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  mission: string;
  vision: string;
};

export type FounderContent = {
  name: string;
  title: string;
  photo: string;
  paragraphs: string[];
  quote?: string;
};

export type Advisor = {
  name: string;
  role: string;
  photo: string;
  cred?: string;
  shortBio?: string;
};

export type AdvisorsContent = {
  title: string;
  subtitle?: string;
  items: Advisor[];
  groupPhoto?: ImageAsset & { caption?: string };
};

export type PartnerLogo = {
  name: string;
  logo: string;
};

export type PartnersContent = {
  title: string;
  subtitle?: string;
  ctaLine?: string;
  items: PartnerLogo[];
};

export type AboutPageContent = {
  pageTitle: string;
  intro?: string;
  whoWeAre: AboutWhoWeAre;
  founder: FounderContent;
  advisors: AdvisorsContent;
  partners: PartnersContent;
};
