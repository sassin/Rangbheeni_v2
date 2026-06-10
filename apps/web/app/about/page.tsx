import { getPage } from "@/lib/api";
import AboutPageClient from "./AboutPageClient";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = await getPage<any>("about");
  return <AboutPageClient content={page.content} />;
}
