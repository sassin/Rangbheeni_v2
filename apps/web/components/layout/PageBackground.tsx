export default function PageBackground({
  variant = "paper",
  children,
}: {
  variant?: "paper" | "linen" | "jute" | "sage" | "events";
  children: React.ReactNode;
}) {
  const cls =
    variant === "jute"
      ? "page-jute"
      : variant === "linen"
        ? "linen-bg"
        : variant === "sage"
          ? "page-sage"
          : "page-paper";

  return <main className={`${cls} relative min-h-screen`}>{children}</main>;
}
