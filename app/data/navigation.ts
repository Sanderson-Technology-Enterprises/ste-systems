import { SITE } from "../lib/site";

export type NavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
  readonly variant?: "accent" | "subtle";
};

export const HOME_NAVIGATION_ITEMS = [
  { label: "Packages", href: "#libraries" },
  { label: "Components", href: "/components/" },
  { label: "Client systems", href: "#client-systems" },
  { label: "Get started", href: "#get-started" },
  { label: "About", href: "#company" },
] as const satisfies readonly NavigationItem[];

export const HOME_NAVIGATION_ACTIONS = [
  { label: "Open lab", href: SITE.labPath, variant: "accent" },
  {
    label: "GitHub",
    href: SITE.repository,
    external: true,
    variant: "subtle",
  },
] as const satisfies readonly NavigationItem[];

export const LAB_NAVIGATION_ITEMS = [
  { label: "Top", href: "#top" },
  { label: "Workbench", href: "#workbench" },
  { label: "Layout", href: "#layouts" },
  { label: "UI & native", href: "#ui-native" },
  { label: "Interactions", href: "#interactions" },
  { label: "Motion", href: "#motion" },
  { label: "Integration", href: "#integrate" },
  { label: "Install", href: "#install" },
  { label: "Packages", href: "#libraries" },
] as const satisfies readonly NavigationItem[];

export const LAB_NAVIGATION_ACTIONS = [
  { label: "Component guides", href: "/components/", variant: "subtle" },
  { label: "Back to overview", href: "/", variant: "accent" },
  {
    label: "GitHub",
    href: SITE.repository,
    external: true,
    variant: "subtle",
  },
] as const satisfies readonly NavigationItem[];

export const ATLAS_NAVIGATION_ITEMS = [
  { label: "Top", href: "#atlas-top" },
  { label: "Layout", href: "#atlas-layout" },
  { label: "UI & native", href: "#atlas-ui" },
  { label: "Interactions", href: "#atlas-interaction" },
  { label: "Motion", href: "#atlas-motion" },
  { label: "React", href: "#atlas-react" },
] as const satisfies readonly NavigationItem[];

export const ATLAS_NAVIGATION_ACTIONS = [
  { label: "Open lab", href: SITE.labPath, variant: "accent" },
  { label: "Overview", href: "/", variant: "subtle" },
] as const satisfies readonly NavigationItem[];
