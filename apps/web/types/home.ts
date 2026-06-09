import type { ImageAsset, LinkItem } from "./content";

export type HeroContent = {
  titleLines: string[];
  description: string;
  images: ImageAsset[];
  marqueeItems: string[];
};

export type ImpactEquivalent = {
  label: string;
  value: string;
};

export type ImpactStatDetails = {
  title?: string;
  subtitle?: string;
  bullets?: string[];
  math?: string[];
  equivalents?: ImpactEquivalent[];
  note?: string;
};

export type ImpactStat = {
  label: string;
  value: string;
  details?: ImpactStatDetails;
};

export type ImpactData = {
  heading: string;
  description: string;
  stats: ImpactStat[];
  equivalents?: ImpactEquivalent[];
  perCustomer?: { label: string; value: string }[];
};

export type ProductCategory =
  | "accessories"
  | "bags"
  | "home-utility"
  | "jewellery"
  | "stationery"
  | "other";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory | string;
  short: string;
  images: string[];
  featured?: boolean;
  storyTitle?: string;
  story?: string;
  artisan?: {
    name: string;
    location?: string;
    quote?: string;
  };
};

export type ProductsCollection = {
  pageTitle: string;
  intro: string;
  items: Product[];
};

export type FeaturedProductsContent = {
  heading: string;
  description: string;
  cta: LinkItem;
  limit: number;
};

export type CorporateService = {
  id: string;
  title: string;
  desc: string;
  impact: string;
  tag: string;
  bgClassName: string;
};

export type CorporateCollabContent = {
  heading: string;
  description: string;
  services: CorporateService[];
  cta: {
    label: string;
    href: string;
  };
};

export type FinalCtaContent = {
  id: string;
  heading: string[];
  logo: ImageAsset;
  links: LinkItem[];
};

export type HomeSectionType =
  | "hero"
  | "impactSnapshot"
  | "featuredProducts"
  | "corporateCollab"
  | "finalCta";

export type HomeSectionConfig = {
  type: HomeSectionType;
  enabled: boolean;
};

export type HomePageContent = {
  backgroundVariant: "paper" | "linen" | "jute" | "sage" | "events";
  sections: HomeSectionConfig[];
};
