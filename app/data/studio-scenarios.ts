import type { IconName } from "@sanderson-technology-enterprises/ste-usk-react";
import type { LayoutRecipe } from "./catalog";

/** One catalog drives entry cards, screen validation, preview navigation, and handoff labels. */
export const SCENARIOS = [
  {
    id: "business",
    label: "Marketing site",
    group: "website",
    description: "Introduce your services and turn interest into an inquiry.",
    icon: "building",
    screens: ["home", "inquiry"],
    starter: {
      recipe: "split-hero",
      wrapper: "content",
      headline: "Good work starts with a clear direction.",
      action: "Request a quote",
    },
    thumbnail: { width: 960, height: 640 },
  },
  {
    id: "storefront",
    label: "E-commerce store",
    group: "website",
    description: "Browse products, explore the details, and try a sample cart.",
    icon: "cart",
    screens: ["browse", "product", "cart"],
    starter: {
      recipe: "card-grid",
      wrapper: "wide",
      headline: "Useful things. Thoughtfully chosen.",
      action: "View cart",
    },
    thumbnail: { width: 960, height: 640 },
  },
  {
    id: "newsletter",
    label: "Newsletter",
    group: "website",
    description:
      "Build a publication around a subscription and an issue archive.",
    icon: "mail",
    screens: ["landing", "archive", "issue"],
    starter: {
      recipe: "split-hero",
      wrapper: "content",
      headline: "A little perspective, delivered.",
      action: "Join the newsletter",
    },
    thumbnail: { width: 960, height: 640 },
  },
  {
    id: "blog",
    label: "Blog",
    group: "website",
    description: "Give stories, ideas, and practical guides room to be read.",
    icon: "file-text",
    screens: ["index", "article"],
    starter: {
      recipe: "docs",
      wrapper: "content",
      headline: "Ideas for a more considered everyday.",
      action: "Explore the stories",
    },
    thumbnail: { width: 960, height: 640 },
  },
  {
    id: "industrial",
    label: "Industrial dashboard / PLC",
    group: "website",
    description:
      "Explore equipment status, a simulated operator panel, and alarms.",
    icon: "settings",
    screens: ["overview", "operator", "alarms"],
    starter: {
      recipe: "dashboard",
      wrapper: "workspace",
      headline: "A clear view of the production floor.",
      action: "Open operator panel",
    },
    thumbnail: { width: 960, height: 640 },
  },
  {
    id: "inventory",
    label: "Inventory management",
    group: "website",
    description:
      "Find stock, inspect locations, and try a sample stock adjustment.",
    icon: "package",
    screens: ["items", "item", "movement"],
    starter: {
      recipe: "app-shell",
      wrapper: "workspace",
      headline: "Know what is in stock. Find it faster.",
      action: "Browse inventory",
    },
    thumbnail: { width: 960, height: 640 },
  },
  {
    id: "booking",
    label: "Booking or inquiry",
    group: "example",
    description: "Service requests and sample confirmations.",
    icon: "calendar",
    screens: ["services", "request", "confirmation"],
  },
  {
    id: "portal",
    label: "Client portal",
    group: "example",
    description: "Searchable client records and project details.",
    icon: "folder",
    screens: ["records", "detail"],
  },
  {
    id: "components",
    label: "Component showcase",
    group: "advanced",
    description: "Explore supported interface components.",
    icon: "layers",
    screens: ["showcase"],
  },
  {
    id: "primitives",
    label: "Layout primitives",
    group: "advanced",
    description: "Inspect the system's structural building blocks.",
    icon: "grid",
    screens: ["structure"],
  },
] as const satisfies readonly {
  id: string;
  label: string;
  group: string;
  description: string;
  icon: IconName;
  screens: readonly string[];
  starter?: {
    recipe: LayoutRecipe;
    wrapper: string;
    headline: string;
    action: string;
  };
  thumbnail?: { width: number; height: number };
}[];

export type Scenario = (typeof SCENARIOS)[number]["id"];
/** The six client entry points; technical and legacy examples remain separately discoverable. */
export const WEBSITE_TEMPLATES = SCENARIOS.filter(
  (item) => item.group === "website",
);
export type WebsiteTemplateId = (typeof WEBSITE_TEMPLATES)[number]["id"];

/** Resolves a validated template intent without accepting arbitrary URL values. */
export function websiteTemplate(id: string) {
  return WEBSITE_TEMPLATES.find((item) => item.id === id);
}
