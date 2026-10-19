import interactionManifest from "interactive-surface-css/manifest.json";
import layoutManifest from "layout-style-css/manifest.json";
import uiManifest from "ui-style-kit-css/manifest.json";

type SelectorEntry = {
  readonly selector: string;
  readonly sourceSuffix: string;
};

type UiAtlasManifest = {
  readonly classApi: {
    readonly presetExtras: Readonly<Record<string, readonly string[]>>;
    readonly universalVisualSuffixes: readonly string[];
  };
  readonly nativeElements: {
    readonly fullyThemed: readonly string[];
    readonly nonRendered: readonly string[];
    readonly platformOwned: readonly string[];
    readonly progressivelyEnhanced: readonly string[];
  };
  readonly nativeParts: {
    readonly nonRendered: readonly string[];
    readonly platformOwned: readonly string[];
    readonly standard: readonly string[];
    readonly vendorSpecific: readonly string[];
  };
  readonly presets: readonly {
    readonly id: string;
    readonly label: string;
    readonly prefix: string;
  }[];
  readonly semanticComponentApi: {
    readonly selectorsByRole: Readonly<
      Record<string, readonly SelectorEntry[]>
    >;
  };
  readonly themes: readonly string[];
};

const publishedUiManifest = uiManifest as UiAtlasManifest;

/** Layout Style CSS spacing-density settings supported by `data-ly-density`. */
export const LAYOUT_DENSITIES = ["compact", "normal", "spacious"] as const;

/**
 * Provides manifest-backed coverage lists for every contract represented by
 * the Component Atlas. Display modes remain available at runtime but are not
 * treated as distinct design combinations.
 */
export const ATLAS_COVERAGE = Object.freeze({
  layout: Object.freeze({
    areas: layoutManifest.areas,
    personalities: layoutManifest.personalities,
    primitives: layoutManifest.primitives,
    recipes: layoutManifest.recipes,
    wrappers: layoutManifest.wrappers,
  }),
  ui: Object.freeze({
    nativeElements: publishedUiManifest.nativeElements,
    nativeParts: publishedUiManifest.nativeParts,
    presetExtras: publishedUiManifest.classApi.presetExtras,
    presets: publishedUiManifest.presets,
    semanticSelectors: Object.values(
      publishedUiManifest.semanticComponentApi.selectorsByRole,
    ).flat(),
    themes: publishedUiManifest.themes,
    universalVisualSuffixes:
      publishedUiManifest.classApi.universalVisualSuffixes,
  }),
  interaction: Object.freeze({
    ariaHooks: interactionManifest.states.ariaHooks,
    dataHooks: interactionManifest.selectors.dataHooks,
    levels: interactionManifest.states.levels,
    sizes: interactionManifest.states.sizes,
    stableSelectors: interactionManifest.selectors.stable,
    stateClasses: interactionManifest.selectors.stateClasses,
    variants: interactionManifest.states.variants,
  }),
});

/**
 * Manifest-derived factors shared by the public explanation and total.
 * Each preset supports the shared themes plus one native color scheme.
 */
export const COMBINATION_FACTORS = Object.freeze({
  layouts: ATLAS_COVERAGE.layout.personalities.length,
  recipes: ATLAS_COVERAGE.layout.recipes.length,
  densities: LAYOUT_DENSITIES.length,
  presets: ATLAS_COVERAGE.ui.presets.length,
  sharedThemes: ATLAS_COVERAGE.ui.themes.length,
  nativeSchemesPerPreset: 1,
});

/**
 * Number of layout, recipe, density, visual-preset, and color-scheme
 * combinations.
 */
export const SUPPORTED_COMBINATIONS =
  COMBINATION_FACTORS.layouts *
  COMBINATION_FACTORS.recipes *
  COMBINATION_FACTORS.densities *
  COMBINATION_FACTORS.presets *
  (COMBINATION_FACTORS.sharedThemes +
    COMBINATION_FACTORS.nativeSchemesPerPreset);

/** Locale-formatted combination count used in public product copy. */
export const SUPPORTED_COMBINATIONS_LABEL =
  SUPPORTED_COMBINATIONS.toLocaleString("en-US");
