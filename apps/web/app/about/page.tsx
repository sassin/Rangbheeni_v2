import { getPage } from "@/lib/api";
import { fallbackAbout } from "@/lib/fallbackContent";
import AboutPageClient from "./AboutPageClient";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = await getPage<any>("about").catch(() => null);
  return <AboutPageClient content={page?.content ?? fallbackAbout} />;
}
