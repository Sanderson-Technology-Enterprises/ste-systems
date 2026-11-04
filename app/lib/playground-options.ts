import type { CSSProperties } from "react";
import type {
  LayoutRecipeName,
  LayoutAreaName,
} from "@sanderson-technology-enterprises/ste-usk-react";

/** Public CSS variable maps used by the client playground and theme exports. */
export type PlaygroundVariables = CSSProperties & Record<`--${string}`, string>;
/** Application labels for supported hover-lift strengths, independent of depth. */
export type HoverIntensity = "none" | "subtle" | "balanced" | "strong";

/**
 * Convert a native color input value into validated CSS RGB channels.
 * @param value Six-digit hexadecimal color.
 * @returns Three integer channels separated by spaces.
 * @throws If the value is not a concrete six-digit color.
 */
export function hexToChannels(value: string): string {
  const match = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
  if (!match) throw new TypeError("Choose a six-digit hexadecimal color.");
  return match
    .slice(1)
    .map((channel) => parseInt(channel, 16))
    .join(" ");
}

/**
 * Normalize computed RGB or RGB-channel text for a native color control.
 * @param value Computed RGB text or three space-separated channels.
 * @returns A six-digit hexadecimal color.
 * @throws If the value does not contain valid RGB channels.
 */
export function colorToHex(value: string): string {
  const channels = value
    .trim()
    .replace(/^rgba?\(/, "")
    .replace(/\)$/, "")
    .split(/[\s,/]+/)
    .slice(0, 3)
    .map(Number);
  if (
    channels.length !== 3 ||
    channels.some(
      (channel) => !Number.isFinite(channel) || channel < 0 || channel > 255,
    )
  )
    throw new TypeError("The color is not a concrete RGB value.");
  return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Build shareable JSON and CSS from validated public palette tokens.
 * @param theme Client label, configuration scope, and concrete RGB variables.
 * @returns Matching JSON metadata and an applyable CSS class.
 * @throws If a token name or RGB value could not be applied safely.
 */
export function buildThemeExport(theme: {
  name: string;
  preset: string;
  theme: string;
  mode: string;
  variables: Record<string, string>;
}): { json: string; css: string } {
  const variables = Object.fromEntries(
    Object.entries(theme.variables).map(([key, value]) => {
      if (
        !/^--[a-z][a-z0-9-]*-rgb$/.test(key) ||
        !/^\d{1,3} \d{1,3} \d{1,3}$/.test(value) ||
        value.split(" ").some((channel) => Number(channel) > 255)
      )
        throw new TypeError(
          "Theme exports require public RGB token names and concrete channels.",
        );
      return [key, value];
    }),
  );
  return {
    json: JSON.stringify({ ...theme, variables }, null, 2),
    css: `.client-custom-theme {\n${Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n")}\n}`,
  };
}

/**
 * Tune interaction movement only through the installed library's public tokens.
 * @param intensity Selected hover strength; elevation and paint remain independent.
 * @returns Scoped tokens inherited by interactive specimen controls.
 */
export function interactionIntensity(
  intensity: HoverIntensity,
): PlaygroundVariables {
  const distance = { none: 0, subtle: 2, balanced: 4, strong: 8 }[intensity];
  return {
    "--interactive-surface-lift-hover": `${-distance}px`,
    "--interactive-surface-lift-active": `${distance / 2}px`,
    "--interactive-surface-motion-default": "180ms",
    "--interactive-surface-motion-press": "80ms",
  };
}

/**
 * Assign the existing workspace regions to each canonical recipe's named areas.
 * Gallery and card-grid intentionally use ordinary auto-flow children.
 * @param recipe Installed Layout Style CSS recipe.
 * @returns Region-to-area assignments without invented area names.
 */
export function recipeAreas(
  recipe: LayoutRecipeName,
): Partial<
  Record<"header" | "navigation" | "main" | "aside" | "footer", LayoutAreaName>
> {
  if (recipe === "gallery" || recipe === "card-grid") return {};
  if (recipe === "list-detail")
    return { main: "primary", aside: "secondary", footer: "actions" };
  if (recipe === "split-hero")
    return { main: "content", aside: "media", footer: "actions" };
  return {
    header: "header",
    navigation: recipe === "app-shell" ? "sidebar" : "nav",
    main: "main",
    aside: "aside",
    footer: "footer",
  };
}
