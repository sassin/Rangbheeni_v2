import type { ImageAsset } from "./content";

export type JourneyTimelineItem = {
  year: string;
  title: string;
  text: string;
};

export type JourneyOrigin = {
  title: string;
  paragraphs: string[];
};

export type JourneyArtisan = {
  name: string;
  location: string;
  quote: string;
  photo: string;
};

export type JourneyPageContent = {
  pageTitle: string;
  intro?: string;
  origin: JourneyOrigin;
  timeline: {
    title: string;
    items: JourneyTimelineItem[];
  };
  artisans: {
    title: string;
    subtitle: string;
    items: JourneyArtisan[];
  };
  next: {
    title: string;
    text: string;
  };
  connect?: {
    email?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
};
