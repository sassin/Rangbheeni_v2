import { notFound } from "next/navigation";
import { getStory } from "@/lib/api";
import PageBackground from "@/components/layout/PageBackground";
import DenimTexture from "@/components/shared/DenimTexture";
import StoryModalContent from "@/components/stories/StoryModalContent";

export const dynamic = "force-dynamic";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStory(slug).catch(() => null);

  if (!story) return notFound();

  return (
    <PageBackground variant="paper">
      <main className="relative min-h-screen overflow-x-hidden bg-[#efeeea] text-[var(--color-brown)]">
        <DenimTexture opacity="soft" />
        <div className="relative z-10 px-4 py-24 md:px-10 lg:px-20">
          <StoryModalContent story={story} />
        </div>
      </main>
    </PageBackground>
  );
}
