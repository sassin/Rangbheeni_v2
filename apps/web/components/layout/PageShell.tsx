export default function PageShell({
  children,
  size = "default",
  className = "",
}: {
  children: React.ReactNode;
  size?: "narrow" | "default" | "wide";
  className?: string;
}) {
  const width =
    size === "narrow"
      ? "max-w-3xl"
      : size === "wide"
        ? "max-w-7xl"
        : "max-w-6xl";

  return <div className={`mx-auto ${width} px-6 ${className}`}>{children}</div>;
}
