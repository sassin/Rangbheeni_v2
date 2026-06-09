import type { AnnouncementDto, EventDto, ProductDto, StoryDto } from "@rangbheeni/shared-types";

const contentApiUrl = process.env.NEXT_PUBLIC_CONTENT_API_URL || process.env.CONTENT_API_URL || "http://localhost:4000";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${contentApiUrl.replace(/\/$/, "")}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Content API failed for ${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getProducts() { return getJson<ProductDto[]>("/public/products"); }
export async function getProduct(slug: string) { return getJson<ProductDto>(`/public/products/${slug}`); }
export async function getEvents() { return getJson<EventDto[]>("/public/events"); }
export async function getStories() { return getJson<StoryDto[]>("/public/stories"); }
export async function getStory(slug: string) { return getJson<StoryDto>(`/public/stories/${slug}`); }
export async function getAnnouncement() { return getJson<AnnouncementDto | null>("/public/announcement/active"); }
export async function getPage<T = any>(key: string) { return getJson<{ key: string; title?: string | null; content: T }>(`/public/pages/${key}`); }
export async function getHome() { return getJson<any>("/public/home"); }
