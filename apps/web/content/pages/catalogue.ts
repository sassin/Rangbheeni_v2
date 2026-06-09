export type CatalogueItem = {
  key: string;
  label: string;
  title: string;
  description: string;
  href: string;
  accent: string;
  texture: string;
};

export const catalogueContent: CatalogueItem[] = [
  {
    key: "holiday",
    label: "Seasonal",
    title: "Holiday Gifts",
    description:
      "Festive gifting options for end-of-year campaigns, events, and celebrations.",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSeqcV5HrM06MpaHY46YmT4EwvI2IKnysoelvy_3Y5X_z9UnwQ/viewform?usp=publish-editor",
    accent: "var(--rang-primary)",
    texture:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, #000 3px)",
  },
  {
    key: "corporate",
    label: "Partnerships",
    title: "Corporate Gifts",
    description:
      "Purpose-led gifting options for organizations, events, and collaborations.",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSf59-CfY-I57_XDwl6IkHC6k3DxlGMcRsmeAK84o1PTrqZKrQ/viewform?usp=dialog",
    accent: "var(--rang-highlight)",
    texture:
      "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)",
  },
  {
    key: "womens-day",
    label: "Occasion",
    title: "Women's Day Gifts",
    description:
      "Thoughtful gifting ideas curated for Women’s Day and allied campaigns.",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSea7-MkcFfYo34HAumH5A6Fwh5CR0Yx4Im76enpiRC9pG0UwQ/viewform?usp=publish-editor",
    accent: "var(--rang-secondary)",
    texture:
      "repeating-linear-gradient(90deg, transparent, transparent 2px, #000 3px)",
  },
];