export default function RecognitionSection() {
  const logos = [
    { src: "/images/logos/partner-1.png", alt: "Partner logo 1" },
    { src: "/images/logos/partner-2.png", alt: "Partner logo 2" },
    { src: "/images/logos/partner-3.png", alt: "Partner logo 3" },
    { src: "/images/logos/partner-4.png", alt: "Partner logo 4" },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-heading text-2xl font-bold text-[var(--color-brown)] md:text-3xl">
          Recognitions & collaborations
        </h2>
        <p className="mt-2 font-body text-neutral-700 max-w-3xl">
          Our impact and scalability are validated through corporate, CSR, and PSU partnerships,
          exhibitions across Tier 1 and Tier 2 cities, paid sustainability workshops, Ministry of Textiles–registered women artisans,
          and selection into national incubation programs.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {logos.map((l) => (
            <div
              key={l.src}
              className="flex items-center justify-center rounded-2xl border border-[var(--rang-lime)]/25 bg-white p-4"
              title={l.alt}
            >
              <img
                src={l.src}
                alt={l.alt}
                className="max-h-10 w-auto opacity-80 grayscale"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6">
          <div className="font-body text-sm text-neutral-700">
            <span className="font-semibold text-[var(--color-primary)]">Incubation highlights:</span>{" "}
            Top 3 at IIMV Field Incubation • Top 23 at IIM Bangalore • Selected into 4 national incubation programs
          </div>
        </div>
      </div>
    </section>
  );
}