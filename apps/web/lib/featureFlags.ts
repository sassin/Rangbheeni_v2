export const featureFlags = {
  journey: process.env.NEXT_PUBLIC_SHOW_JOURNEY !== "false",
  core: process.env.NEXT_PUBLIC_SHOW_CORE !== "false",
  products: process.env.NEXT_PUBLIC_SHOW_PRODUCTS !== "false",
  stories: process.env.NEXT_PUBLIC_SHOW_STORIES !== "false",
  events: process.env.NEXT_PUBLIC_SHOW_EVENTS !== "false",
  aiChat: process.env.NEXT_PUBLIC_SHOW_AI_CHAT !== "false",
  aiChatMaintenance: process.env.NEXT_PUBLIC_AI_CHAT_MAINTENANCE === "true",
};

export function isNavigationItemEnabled(item: { href?: string; label?: string }) {
  const href = item.href ?? "";
  const label = (item.label ?? "").toLowerCase();

  if (href.includes("/journey") || label.includes("journey")) return featureFlags.journey;
  if (href.includes("/about") || label.includes("core")) return featureFlags.core;
  if (href.includes("/products") || label.includes("products")) return featureFlags.products;
  if (href.includes("/stories") || label.includes("stories")) return featureFlags.stories;
  if (href.includes("/events") || label.includes("events")) return featureFlags.events;

  return true;
}
