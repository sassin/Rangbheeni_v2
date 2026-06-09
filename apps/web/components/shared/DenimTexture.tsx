export default function DenimTexture({ opacity = "default" }: { opacity?: "default" | "soft" }) {
  const denimOpacity = opacity === "soft" ? "opacity-[0.05]" : "opacity-[0.06]";
  const weaveOpacity = opacity === "soft" ? "opacity-[0.03]" : "opacity-[0.04]";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-brand-mesh" />
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ filter: "url(#denimWeave)" }}
      />
      <div className={`absolute inset-0 ${denimOpacity} bg-denim-twill`} />
      <div className={`absolute inset-0 ${weaveOpacity} bg-weave`} />
      {opacity === "soft" ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_14%,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_78%_12%,rgba(9,158,200,0.08),transparent_20%),radial-gradient(circle_at_76%_78%,rgba(132,188,65,0.08),transparent_22%)]" />
      ) : null}
    </div>
  );
}
