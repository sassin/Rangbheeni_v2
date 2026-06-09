export type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
  target?: "_self" | "_blank";
};

export type ImageAsset = {
  src: string;
  alt: string;
};

export type NavItem = {
  href: string;
  label: string;
  hidden?: boolean;
};

export type FooterContent = {
  copyrightName: string;
  tagline?: string;
};

export type SiteSettings = {
  siteName: string;
  siteUrl?: string;
  defaultTitle: string;
  defaultDescription: string;
  contactEmail: string;
  socials: LinkItem[];
};
