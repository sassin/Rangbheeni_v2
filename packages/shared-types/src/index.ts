export type ContentStatus = "draft" | "published" | "archived";

export type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
  target?: "_self" | "_blank";
};

export type MediaAssetDto = {
  id?: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type ProductCategoryDto = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
};

export type ProductDto = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategoryDto | null;
  shortDescription: string;
  longDescription?: string | null;
  storyTitle?: string | null;
  story?: string | null;
  featured: boolean;
  featuredRank?: number | null;
  images: MediaAssetDto[];
};

export type EventDateBadgeDto = {
  month: string;
  day: string;
};

export type EventDto = {
  id: string;
  eventCode?: number | null;
  slug: string;
  title: string;
  type?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  descriptionParagraphs: string[];
  city?: string | null;
  venue?: string | null;
  address?: string | null;
  startDate: string;
  endDate?: string | null;
  timeText?: string | null;
  dateBadge: EventDateBadgeDto;
  startLabel?: string | null;
  endLabel?: string | null;
  showDateRange: boolean;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaText: string;
  ctaHref: string;
  featured: boolean;
  featuredRank?: number | null;
  image?: MediaAssetDto | null;
};

export type StorySection =
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: string; [key: string]: unknown };

export type StoryBlockDto = {
  id: string;
  type: "paragraph" | "quote" | "image" | "subheading";
  sortOrder: number;
  text?: string | null;
  caption?: string | null;
  altText?: string | null;
  image?: MediaAssetDto | null;
};

export type StoryDto = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: MediaAssetDto | null;
  featured: boolean;
  featuredRank?: number | null;
  publishedDate?: string | null;
  blocks: StoryBlockDto[];
};

export type AnnouncementDto = {
  id: string;
  title: string;
  message: string;
  displayType: "modal" | "banner";
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  image?: MediaAssetDto | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type ChatMessageRequest = {
  message: string;
  sessionId?: string;
};

export type ChatSource = {
  title: string;
  sourceType: string;
};

export type ChatMessageResponse = {
  answer: string;
  fallbackUsed: boolean;
  sources: ChatSource[];
};
