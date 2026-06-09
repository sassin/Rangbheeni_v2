import { notFound } from "next/navigation";
import { getStory } from "@/lib/api";
import StoryModalContent from "@/components/stories/StoryModalContent";
import StoryModalShell from "@/components/stories/StoryModalShell";

export const dynamic = "force-dynamic";

export default async function StoryInterceptedModalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStory(slug).catch(() => null);

  if (!story) return notFound();

  return (
    <StoryModalShell>
      <StoryModalContent story={story} modal />
    </StoryModalShell>
  );
}
