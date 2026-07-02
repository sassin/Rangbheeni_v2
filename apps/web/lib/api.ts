import type {
  AnnouncementDto,
  EventDto,
  GalleryImageDto,
  ProductCategoryDto,
  ProductDto,
  StoryDto,
} from "@rangbheeni/shared-types";

type FetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

type QueryValue = string | number | boolean | null | undefined;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_CONTENT_API_BASE_URL ||
  process.env.NEXT_PUBLIC_CONTENT_API_URL ||
  process.env.CONTENT_API_BASE_URL ||
  process.env.CONTENT_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");

function getApiBaseUrl() {
  const base = API_BASE_URL.trim();

  if (!base) {
    throw new Error(
      "Content API base URL is not configured. Set NEXT_PUBLIC_CONTENT_API_URL or CONTENT_API_URL."
    );
  }

  return base.replace(/\/+$/, "");
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function fetchJson<T>(
  path: string,
  options?: FetchOptions & { query?: Record<string, QueryValue> }
): Promise<T> {
  const { query, headers, ...fetchOptions } = options || {};
  const requestHeaders = new Headers(headers);

  if (fetchOptions.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Content API request failed: ${response.status} ${response.statusText}${
        body ? ` - ${body}` : ""
      }`
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export async function getPageContent<T = Record<string, unknown>>(key: string): Promise<T> {
  return fetchJson<T>(`/public/pages/${key}`, {
    next: { revalidate: 300 },
  });
}

export async function getPage<T = Record<string, unknown>>(key: string): Promise<T> {
  return getPageContent<T>(key);
}

export async function getHomeContent(): Promise<Record<string, unknown>> {
  return fetchJson<Record<string, unknown>>("/public/home", {
    next: { revalidate: 300 },
  });
}

export async function getCategories(): Promise<ProductCategoryDto[]> {
  return fetchJson<ProductCategoryDto[]>("/public/categories", {
    next: { revalidate: 300 },
  });
}

export async function getProducts(options?: {
  featured?: boolean;
  limit?: number;
  category?: string;
}): Promise<ProductDto[]> {
  return fetchJson<ProductDto[]>("/public/products", {
    query: {
      featured: options?.featured,
      limit: options?.limit,
      category: options?.category,
    },
    next: { revalidate: 300 },
  });
}

export async function getFeaturedProducts(limit = 6): Promise<ProductDto[]> {
  return getProducts({ featured: true, limit });
}

export async function getProduct(slug: string): Promise<ProductDto> {
  return fetchJson<ProductDto>(`/public/products/${slug}`, {
    next: { revalidate: 300 },
  });
}

export async function getEvents(options?: {
  featured?: boolean;
  limit?: number;
}): Promise<EventDto[]> {
  return fetchJson<EventDto[]>("/public/events", {
    query: {
      featured: options?.featured,
      limit: options?.limit,
    },
    next: { revalidate: 300 },
  });
}

export async function getFeaturedEvents(limit = 3): Promise<EventDto[]> {
  return getEvents({ featured: true, limit });
}

export async function getEvent(slug: string): Promise<EventDto> {
  return fetchJson<EventDto>(`/public/events/${slug}`, {
    next: { revalidate: 300 },
  });
}

export async function getStories(options?: {
  featured?: boolean;
  limit?: number;
}): Promise<StoryDto[]> {
  return fetchJson<StoryDto[]>("/public/stories", {
    query: {
      featured: options?.featured,
      limit: options?.limit,
    },
    next: { revalidate: 300 },
  });
}

export async function getFeaturedStories(limit = 4): Promise<StoryDto[]> {
  return getStories({ featured: true, limit });
}

export async function getStory(slug: string): Promise<StoryDto> {
  return fetchJson<StoryDto>(`/public/stories/${slug}`, {
    next: { revalidate: 300 },
  });
}

export async function getGalleryImages(): Promise<GalleryImageDto[]> {
  return fetchJson<GalleryImageDto[]>("/public/gallery-images", {
    next: { revalidate: 300 },
  });
}

export async function getActiveAnnouncement(): Promise<AnnouncementDto | null> {
  return fetchJson<AnnouncementDto | null>("/public/announcement", {
    next: { revalidate: 300 },
  });
}

export async function subscribeNewsletter(email: string) {
  return fetchJson<{ ok: boolean }>("/public/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
