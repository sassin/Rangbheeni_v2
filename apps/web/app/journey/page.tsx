import { getPage } from "@/lib/api";
import { fallbackImpact, fallbackJourney } from "@/lib/fallbackContent";
import JourneyPageClient from "./JourneyPageClient";

export const dynamic = "force-dynamic";

export default async function JourneyPage() {
  const [journeyPage, impactPage] = await Promise.all([
    getPage<any>("journey").catch(() => null),
    getPage<any>("impact").catch(() => null),
  ]);

  return <JourneyPageClient content={journeyPage?.content ?? fallbackJourney} impact={impactPage?.content ?? fallbackImpact} />;
}
