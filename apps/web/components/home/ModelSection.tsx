import Link from "next/link";

function RangDivider() {
  return (
    <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)]" />
  );
}

export default function ModelSection() {
  const items = [
    {
      title: "Collect pre-loved textiles",
      text: "We collect pre-loved clothes and textile scraps through community drives and partner institutions.",
    },
    {
      title: "Train & Educate",
      text: "Women are trained in upcycling skills and quality finishing. We also conduct sustainability workshops for institutions and corporates.",
    },
    {
      title: "Create sustainable products",
      text: "Textiles are transformed into durable, handmade products—ready for exhibitions, gifting, and everyday use.",
    },
    {
      title: "Livelihoods & Education",
      text: "The model generates dignified, climate-resilient livelihoods and supports children’s education within the community.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-heading text-2xl font-bold text-[var(--color-brown)] md:text-3xl">
        Our Model
      </h2>
      <p className="mt-2 font-body text-neutral-800 max-w-3xl">
        At Rangbheeni, waste becomes resource, skills become opportunity, and communities build resilience.
      </p>
      <RangDivider />

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((it, index) => (
          <div
            key={it.title}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Badge + Title Row */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(9,113,13,0.08)] font-heading text-sm font-bold text-[var(--color-primary)]">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="font-heading text-lg font-bold text-[var(--color-warmbrown)]">
                {it.title}
              </div>
            </div>

            <p className="mt-4 font-body text-sm text-neutral-700 leading-relaxed">
              {it.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}