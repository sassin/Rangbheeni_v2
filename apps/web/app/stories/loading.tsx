import PageBackground from "@/components/layout/PageBackground";

export default function StoriesLoading() {
  return (
    <PageBackground variant="jute">
      <main className="mx-auto max-w-6xl px-6 pb-12 pt-28">
        <div className="max-w-3xl">
          <div className="h-4 w-36 animate-pulse rounded-full bg-[var(--color-primary)]/20" />
          <div className="mt-5 h-12 w-64 animate-pulse rounded-2xl bg-[var(--color-brown)]/10" />
          <div className="mt-5 h-5 w-full max-w-2xl animate-pulse rounded-full bg-black/10" />
          <div className="mt-3 h-5 w-4/5 animate-pulse rounded-full bg-black/10" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-sm"
            >
              <div className="h-56 animate-pulse bg-[var(--color-cream)]" />
              <div className="p-6">
                <div className="h-4 w-24 animate-pulse rounded-full bg-black/10" />
                <div className="mt-4 h-6 w-3/4 animate-pulse rounded-full bg-black/10" />
                <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-black/10" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-black/10" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageBackground>
  );
}
