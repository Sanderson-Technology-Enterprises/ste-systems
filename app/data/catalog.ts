import uiManifest from "ui-style-kit-css/manifest.json";

export const LAYOUT_PERSONALITIES = [
  "minimal-saas",
  "bauhaus",
  "tactile",
  "cyberpunk",
  "f-pattern",
  "brutalism",
  "neumorphism",
  "y2k",
  "retro-glass",
  "z-pattern",
  "retrofuturism",
  "mondrian",
  "synthwave",
  "bento",
  "maximalist",
  "split-screen",
  "technical-blueprint",
  "data-terminal",
  "industrial-hmi",
  "editorial",
] as const;

export const LAYOUT_RECIPES = [
  "app-shell",
  "dashboard",
  "docs",
  "list-detail",
  "split-hero",
  "gallery",
  "card-grid",
] as const;

export const INTERACTION_VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "subtle",
  "warning",
  "danger",
] as const;

export const INTERACTION_LEVELS = [1, 2, 3] as const;

export type LayoutPersonality = (typeof LAYOUT_PERSONALITIES)[number];
export type LayoutRecipe = (typeof LAYOUT_RECIPES)[number];
export type InteractionVariant = (typeof INTERACTION_VARIANTS)[number];
export type InteractionLevel = (typeof INTERACTION_LEVELS)[number];

export type UiPreset =
  | "minimal-saas"
  | "bento"
  | "maximalist"
  | "bauhaus"
  | "tactile"
  | "neumorphism"
  | "retrofuturism"
  | "brutalism"
  | "cyberpunk"
  | "y2k"
  | "retro-glass"
  | "editorial-luxe"
  | "organic-modern"
  | "industrial-utility"
  | "technical-blueprint"
  | "art-deco"
  | "clay"
  | "data-terminal"
  | "paper-editorial"
  | "neo-noir";

export type UiTheme =
  | "midnight-gold"
  | "ocean-steel"
  | "forest-moss"
  | "sunset-ember"
  | "royal-plum"
  | "graphite-cyan"
  | "desert-sage"
  | "rose-quartz"
  | "cyber-lime"
  | "arctic-indigo"
  | "chrome-navy"
  | "recycled-emerald"
  | "industrial-orange"
  | "performance-red"
  | "heritage-brass"
  | "service-blue-red"
  | "newsprint-crimson"
  | "foundry-amber"
  | "soft-orchid"
  | "electric-noir"
  | "signal-yellow"
  | "botanical-green"
  | "cobalt-electric"
  | "stone-graphite"
  | "walnut-clay";

export type UiMode = "light" | "dark" | "contrast";

export type UiSemanticComponentSuffix =
  | "button"
  | "icon-button"
  | "card"
  | "field"
  | "label"
  | "help-text"
  | "input"
  | "select"
  | "textarea"
  | "check"
  | "check-control"
  | "radio"
  | "radio-control"
  | "switch"
  | "switch-track"
  | "switch-thumb"
  | "badge"
  | "alert"
  | "alert-title"
  | "alert-body"
  | "nav"
  | "nav-link"
  | "table"
  | "table-wrap"
  | "progress"
  | "progress-bar"
  | "toolbar"
  | "spinner"
  | "tooltip";

type UiSemanticSelectorEntry = {
  readonly selector: `.usk-${string}`;
  readonly sourceSuffix: string;
};

export type UiSemanticComponentApi = {
  readonly presetSwitchAttribute: "data-ui";
  readonly selectorsByRole: Readonly<
    Record<string, readonly UiSemanticSelectorEntry[]>
  >;
  readonly variantAttribute: {
    readonly name: "data-ui-variant";
    readonly neutral: "omitted";
    readonly valuesBySelector: Readonly<
      Record<`.usk-${string}`, readonly string[]>
    >;
  };
};

type PublishedUiManifest = {
  readonly presets: readonly {
    readonly id: string;
    readonly label: string;
    readonly prefix: string;
  }[];
  readonly themes: readonly string[];
  readonly modes: readonly string[];
  readonly semanticComponentApi: UiSemanticComponentApi;
};

type UiPresetEntry = {
  readonly id: UiPreset;
  readonly label: string;
  readonly prefix: string;
};

const publishedUiManifest = uiManifest as PublishedUiManifest;

// The pinned manifest remains the runtime source of truth while these narrow
// catalog types keep downstream configuration code literal-safe.
export const UI_PRESETS = Object.freeze(
  publishedUiManifest.presets.map(({ id, label, prefix }) => ({
    id: id as UiPreset,
    label,
    prefix,
  })),
) as readonly UiPresetEntry[];

export const UI_THEMES = Object.freeze([
  ...publishedUiManifest.themes,
]) as readonly UiTheme[];

export const UI_MODES = Object.freeze([
  ...publishedUiManifest.modes,
]) as readonly UiMode[];

/** Semantic component contract from the pinned UI Style Kit manifest. */
export const UI_SEMANTIC_COMPONENT_API =
  publishedUiManifest.semanticComponentApi;

/**
 * Maps core semantic suffixes to published usk-* classes across all presets.
 * Preset-prefixed classes remain available for advanced visual treatments.
 */
export const UI_SEMANTIC_CLASS_BY_SUFFIX = Object.freeze(
  Object.fromEntries(
    Object.values(UI_SEMANTIC_COMPONENT_API.selectorsByRole)
      .flat()
      .map(({ selector, sourceSuffix }) => [sourceSuffix, selector.slice(1)]),
  ),
) as Readonly<Record<UiSemanticComponentSuffix, `usk-${string}`>>;

/**
 * Resolves a core semantic component class from the published manifest.
 *
 * @param suffix Stable component role shared by every UI preset.
 * @returns The corresponding usk-* class without its selector dot.
 */
export function getUiSemanticClass(
  suffix: UiSemanticComponentSuffix,
): `usk-${string}` {
  return UI_SEMANTIC_CLASS_BY_SUFFIX[suffix];
}

export function getUiPrefix(preset: UiPreset): string {
  const match = UI_PRESETS.find((entry) => entry.id === preset);
  if (!match) throw new Error(`Unknown UI preset: ${preset}`);
  return match.prefix;
}
