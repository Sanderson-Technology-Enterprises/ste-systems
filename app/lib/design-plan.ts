import manifest from "../../package.json";
import { SCENARIOS, type Scenario } from "../data/studio-scenarios";
export { SCENARIOS, type Scenario } from "../data/studio-scenarios";
import colorTokens from "../data/ui-color-tokens.json";
import { presets } from "@sanderson-technology-enterprises/motion-style-css";
import {
  LAYOUT_PERSONALITIES,
  LAYOUT_RECIPES,
  UI_MODES,
  UI_PRESETS,
  getUiPrefix,
} from "../data/catalog";
import {
  isLabTheme,
  parseConfiguration,
  type LabConfiguration,
} from "./configuration";
import {
  resolveMotionSettings,
  MOTION_EASINGS,
  type MotionSettings,
} from "./motion-settings";
import type { HoverIntensity } from "./playground-options";
import type { PrimitiveConfiguration } from "../components/labs/LayoutExplorer";

/** Canonical storage is independent from the legacy six-field configuration. */
export const PLAN_STORAGE_KEY = "ste-systems:design-plan:v1";
export const MAX_PLAN_BYTES = 2 * 1024 * 1024;
export type PreviewDevice = "fit" | "desktop" | "tablet" | "phone";
export type PaletteScope = { name: string; variables: Record<string, string> };

/** All durable rendering choices; editor and sample transaction state stay outside. */
export interface VisualDesign {
  configuration: LabConfiguration;
  wrapper:
    | "compact"
    | "prose"
    | "content"
    | "workspace"
    | "wide"
    | "full"
    | "breakout";
  intensity: HoverIntensity;
  level: "mixed" | 1 | 2 | 3;
  primitive: PrimitiveConfiguration;
  palettes: Record<string, PaletteScope>;
  modePreferences: LabConfiguration["mode"][];
  motion: MotionSettings;
  iconPack: "auto" | LabConfiguration["ui"];
  iconVariant: "themed" | "monochrome";
}

/** Portable client preference document, shared by every studio output. */
export interface DesignPlan {
  schemaVersion: 1;
  rendererVersion: 2;
  packages: Record<string, string>;
  id: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  project: {
    name: string;
    purpose: string;
    audience: string;
    action: string;
    headline: string;
  };
  preview: { scenario: Scenario; screen: string; device: PreviewDevice };
  design: VisualDesign;
  alternatives: Partial<
    Record<"A" | "B", { name: string; design: VisualDesign }>
  >;
  favorite: "A" | "B" | null;
  notes: {
    likes: string;
    dislikes: string;
    rationale: string;
    requests: string;
    decisions: string;
  };
}

/** Actual package pins are recorded rather than maintaining another version list. */
export const RENDERER_PACKAGES = Object.fromEntries(
  Object.entries(manifest.dependencies).filter(([name]) =>
    [
      "@sanderson-technology-enterprises/ste-usk-react",
      "@sanderson-technology-enterprises/motion-style-css",
      "ui-style-kit-css",
      "ui-style-kit-icons",
      "layout-style-css",
      "interactive-surface-css",
      "next",
      "react",
      "react-dom",
    ].includes(name),
  ),
);

/** Fixed client presets never resample during replay or document restoration. */
export function animationPreset(
  name: "none" | "subtle" | "expressive",
): MotionSettings {
  return {
    enabled: name !== "none",
    animateConfigurationChanges: false,
    entrance: name === "expressive" ? "origami" : "form",
    exit: "form",
    direction: "up",
    duration: name === "expressive" ? 500 : 240,
    delay: 0,
    interval: name === "expressive" ? 70 : 35,
    easing: "ease-out",
  };
}

/** Samples legacy random controls once so a saved plan replays the same motion. */
export function fixMotionSettings(
  settings: MotionSettings,
  random: () => number = Math.random,
): MotionSettings {
  const fixed = resolveMotionSettings(settings, random);
  return {
    enabled: settings.enabled,
    animateConfigurationChanges: settings.animateConfigurationChanges,
    entrance: fixed.in.preset,
    exit: fixed.out.preset,
    direction: fixed.in.direction,
    duration: fixed.in.duration,
    delay: fixed.in.delay,
    interval: fixed.interval,
    easing: fixed.in.easing,
  };
}

/**
 * Creates a UUID with browser cryptography, including ordinary HTTP LAN previews.
 * `getRandomValues` remains available where the secure-context-only UUID API does not.
 * @returns A random version 4 UUID suitable for a locally owned design document.
 */
function createPlanId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Creates a separate editable plan with the agreed client-facing defaults. */
export function createDesignPlan(): DesignPlan {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    rendererVersion: 2,
    packages: { ...RENDERER_PACKAGES },
    id: createPlanId(),
    revision: 1,
    createdAt: now,
    updatedAt: now,
    title: "My website design",
    project: {
      name: "",
      purpose: "",
      audience: "",
      action: "Request a quote",
      headline: "Good work starts with a clear direction.",
    },
    preview: { scenario: "business", screen: "home", device: "fit" },
    design: {
      configuration: {
        layout: "minimal-saas",
        ui: "minimal-saas",
        theme: "native",
        mode: "light",
        recipe: "split-hero",
        density: "normal",
      },
      wrapper: "content",
      intensity: "balanced",
      level: "mixed",
      palettes: {},
      modePreferences: ["light", "dark"],
      primitive: {
        primitive: "grid",
        gap: 3,
        padding: 2,
        align: "stretch",
        justify: "start",
        columns: "auto",
        ratio: "16x9",
        scroll: "bounded",
      },
      motion: animationPreset("subtle"),
      iconPack: "auto",
      iconVariant: "themed",
    },
    alternatives: {},
    favorite: null,
    notes: {
      likes: "",
      dislikes: "",
      rationale: "",
      requests: "",
      decisions: "",
    },
  };
}

/** Rejects malformed data at the import boundary without modifying a working plan. */
function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${field}: expected an object.`);
  if (
    Object.keys(value).some((key) =>
      ["__proto__", "constructor", "prototype"].includes(key),
    )
  )
    throw new Error(`${field}: unsafe property.`);
  return value as Record<string, unknown>;
}
function text(value: unknown, field: string, max = 10000): string {
  if (typeof value !== "string" || value.length > max)
    throw new Error(`${field}: expected text up to ${max} characters.`);
  return value;
}
function choice<T>(value: unknown, options: readonly T[], field: string): T {
  if (!options.includes(value as T))
    throw new Error(`${field}: unsupported choice ${String(value)}.`);
  return value as T;
}
function numeric(
  value: unknown,
  field: string,
  min: number,
  max: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    throw new Error(`${field}: expected a number from ${min} to ${max}.`);
  return value;
}
function boolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean")
    throw new Error(`${field}: expected true or false.`);
  return value;
}

/** Validates public configuration identifiers against the installed catalogs. */
export function validateConfiguration(value: unknown): LabConfiguration {
  const c = record(value, "configuration");
  if (!isLabTheme(c.theme))
    throw new Error(`Color palette: unsupported choice ${String(c.theme)}.`);
  return {
    layout: choice(c.layout, LAYOUT_PERSONALITIES, "Layout style"),
    ui: choice(
      c.ui,
      UI_PRESETS.map((p) => p.id),
      "Visual style",
    ),
    theme: c.theme,
    mode: choice(c.mode, UI_MODES, "Display mode"),
    recipe: choice(c.recipe, LAYOUT_RECIPES, "Page arrangement"),
    density: choice(
      c.density,
      ["compact", "normal", "spacious"] as const,
      "Spacing",
    ),
  };
}

/** Validates fixed playback, RGB palette scopes, geometry, and supported icon choices. */
export function validateVisualDesign(value: unknown): VisualDesign {
  const d = record(value, "design");
  const m = record(d.motion, "Animation");
  const p = record(d.primitive, "Advanced layout");
  const palettes: VisualDesign["palettes"] = {};
  for (const [scope, raw] of Object.entries(
    record(d.palettes, "Custom palettes"),
  )) {
    const [ui, theme, mode, extra] = scope.split(":");
    const preset = choice(
      ui,
      UI_PRESETS.map((item) => item.id),
      "Palette style",
    );
    if (
      extra ||
      !isLabTheme(theme) ||
      !UI_MODES.includes(mode as LabConfiguration["mode"])
    )
      throw new Error(`Unsupported palette scope: ${scope}.`);
    const palette = record(raw, scope);
    const prefix = theme === "native" ? getUiPrefix(preset) : "usk";
    const variables: Record<string, string> = {};
    const accepted =
      theme === "native" ? colorTokens.native[preset] : colorTokens.shared;
    for (const [key, color] of Object.entries(
      record(palette.variables, "Palette variables"),
    )) {
      if (
        !accepted.includes(key) ||
        !key.startsWith(`--${prefix}-`) ||
        !/^--[a-z][a-z0-9-]*-rgb$/.test(key) ||
        typeof color !== "string" ||
        !/^\d{1,3} \d{1,3} \d{1,3}$/.test(color) ||
        color.split(" ").some((c) => +c > 255)
      )
        throw new Error(`Invalid public RGB color: ${key}.`);
      variables[key] = color;
    }
    palettes[scope] = {
      name: text(palette.name, "Palette name", 200),
      variables,
    };
  }
  if (!Array.isArray(d.modePreferences) || d.modePreferences.length > 3)
    throw new Error("Invalid display-mode preferences.");
  return {
    configuration: validateConfiguration(d.configuration),
    wrapper: choice(
      d.wrapper,
      [
        "compact",
        "prose",
        "content",
        "workspace",
        "wide",
        "full",
        "breakout",
      ] as const,
      "Content width",
    ),
    intensity: choice(
      d.intensity,
      ["none", "subtle", "balanced", "strong"] as const,
      "Hover effects",
    ),
    level: choice(d.level, ["mixed", 1, 2, 3] as const, "Elevation"),
    palettes,
    modePreferences: d.modePreferences.map((mode) =>
      choice(mode, UI_MODES, "Mode preference"),
    ),
    motion: {
      enabled: boolean(m.enabled, "Animation enabled"),
      animateConfigurationChanges: boolean(
        m.animateConfigurationChanges,
        "Animate changes",
      ),
      entrance: choice(m.entrance, presets, "Entrance"),
      exit: choice(m.exit, presets, "Exit"),
      direction: choice(
        m.direction,
        ["left", "right", "up", "down"] as const,
        "Direction",
      ),
      duration: numeric(m.duration, "Duration", 0, 60000),
      delay: numeric(m.delay, "Delay", 0, 60000),
      interval: numeric(m.interval, "Interval", 0, 60000),
      easing: choice(m.easing, MOTION_EASINGS, "Easing"),
    },
    primitive: {
      primitive: choice(
        p.primitive,
        [
          "page",
          "header",
          "footer",
          "main",
          "section",
          "surface",
          "readable",
          "stack",
          "cluster",
          "center",
          "cover",
          "switcher",
          "sidebar",
          "grid",
          "mosaic",
          "action-bar",
          "split",
          "panes",
          "media",
          "reel",
          "frame",
          "scroll",
        ] as const,
        "Primitive",
      ),
      gap: choice(p.gap, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const, "Gap"),
      padding: choice(p.padding, [0, 2, 4, 6, 8] as const, "Padding"),
      align: choice(
        p.align,
        ["start", "center", "end", "stretch"] as const,
        "Alignment",
      ),
      justify: choice(
        p.justify,
        ["start", "center", "end", "between"] as const,
        "Distribution",
      ),
      columns: choice(
        p.columns,
        ["auto", 1, 2, 3, 4, 6, 12] as const,
        "Columns",
      ),
      ratio: choice(
        p.ratio,
        ["1x1", "3x2", "4x3", "16x9", "21x9"] as const,
        "Ratio",
      ),
      scroll: choice(
        p.scroll,
        ["none", "bounded", "viewport"] as const,
        "Scroll limit",
      ),
    },
    iconPack: choice(
      d.iconPack,
      ["auto", ...UI_PRESETS.map((item) => item.id)],
      "Icon family",
    ),
    iconVariant: choice(
      d.iconVariant,
      ["themed", "monochrome"] as const,
      "Icon treatment",
    ),
  };
}

/** Validates one portable document or migrates the previous workbench's JSON export. */
export function parseDesignPlan(input: unknown): {
  plan: DesignPlan;
  warnings: string[];
} {
  if (
    typeof input === "string" &&
    new TextEncoder().encode(input).length > MAX_PLAN_BYTES
  )
    throw new Error("Design files must be smaller than 2 MiB.");
  const value = record(
    typeof input === "string" ? JSON.parse(input) : input,
    "Design file",
  );
  if (value.schemaVersion === undefined && value.configuration)
    return migrateLegacyPlan(value);
  if (
    value.schemaVersion !== 1 ||
    ![1, 2].includes(value.rendererVersion as number)
  )
    throw new Error(
      "This design uses an unsupported document or renderer version. Keep the original file and contact STE.",
    );
  const project = record(value.project, "Project");
  const preview = record(value.preview, "Preview");
  const notes = record(value.notes, "Notes");
  const scenario = choice(
    preview.scenario,
    SCENARIOS.map((item) => item.id),
    "Scenario",
  );
  const screens: readonly string[] = SCENARIOS.find(
    (item) => item.id === scenario,
  )!.screens;
  const alternatives: DesignPlan["alternatives"] = {};
  for (const [key, raw] of Object.entries(
    record(value.alternatives, "Alternatives"),
  )) {
    choice(key, ["A", "B"], "Alternative");
    const option = record(raw, key);
    alternatives[key as "A" | "B"] = {
      name: text(option.name, "Option name", 200),
      design: validateVisualDesign(option.design),
    };
  }
  const favorite = choice(
    value.favorite,
    [null, "A", "B"] as const,
    "Preferred direction",
  );
  if (favorite && !alternatives[favorite])
    throw new Error("The preferred direction is missing from this file.");
  const packages = Object.fromEntries(
    Object.entries(record(value.packages, "Packages")).map(
      ([name, version]) => [name, text(version, "Package version", 100)],
    ),
  );
  const warnings = Object.entries(RENDERER_PACKAGES).some(
    ([name, version]) => packages[name] !== version,
  )
    ? [
        "This plan was saved with different library versions. The renderer contract is supported; review its appearance before your consultation.",
      ]
    : [];
  if (value.rendererVersion === 1)
    warnings.push(
      "Migrated renderer 1 to renderer 2. Your saved scenario, styling, and project details have been preserved.",
    );
  const timestamp = (raw: unknown, label: string) => {
    const s = text(raw, label, 100);
    if (!Number.isFinite(Date.parse(s)))
      throw new Error(`${label}: invalid date.`);
    return s;
  };
  const plan: DesignPlan = {
    schemaVersion: 1,
    rendererVersion: 2,
    packages,
    id: text(value.id, "Plan ID", 200),
    revision: numeric(value.revision, "Revision", 1, Number.MAX_SAFE_INTEGER),
    createdAt: timestamp(value.createdAt, "Created date"),
    updatedAt: timestamp(value.updatedAt, "Updated date"),
    title: text(value.title, "Plan title", 200),
    project: {
      name: text(project.name, "Business name", 200),
      purpose: text(project.purpose, "Website purpose"),
      audience: text(project.audience, "Audience"),
      action: text(project.action, "Main action", 200),
      headline: text(project.headline, "Headline", 500),
    },
    preview: {
      scenario,
      screen: choice(preview.screen, screens, "Preview screen"),
      device: choice(
        preview.device,
        ["fit", "desktop", "tablet", "phone"] as const,
        "Preview device",
      ),
    },
    design: validateVisualDesign(value.design),
    alternatives,
    favorite,
    notes: {
      likes: text(notes.likes, "Likes"),
      dislikes: text(notes.dislikes, "Dislikes"),
      rationale: text(notes.rationale, "Rationale"),
      requests: text(notes.requests, "Requests"),
      decisions: text(notes.decisions, "Open decisions"),
    },
  };
  return { plan, warnings };
}

/** Migrates known legacy values and explicitly discloses unavailable session-only choices. */
export function migrateLegacyPlan(value: Record<string, unknown>): {
  plan: DesignPlan;
  warnings: string[];
} {
  const plan = createDesignPlan();
  const c = record(value.configuration, "Legacy configuration");
  const configuration = {
    ...parseConfiguration(new URLSearchParams()),
    ...c,
    recipe: c.recipe ?? "card-grid",
    density: c.density ?? "normal",
  };
  plan.design.configuration = validateConfiguration(configuration);
  plan.design.wrapper = (value.wrapper ?? "full") as VisualDesign["wrapper"];
  plan.design.intensity = (value.intensity ?? "balanced") as HoverIntensity;
  plan.design.level = (value.level ?? "mixed") as VisualDesign["level"];
  if (value.primitive)
    plan.design.primitive = value.primitive as PrimitiveConfiguration;
  if (value.motion) {
    const old = record(value.motion, "Legacy motion");
    const resolved = resolveMotionSettings({
      ...plan.design.motion,
      ...old,
    } as MotionSettings);
    plan.design.motion = {
      enabled: old.enabled !== false,
      animateConfigurationChanges: old.animateConfigurationChanges === true,
      entrance: resolved.in.preset,
      exit: resolved.out.preset,
      direction: resolved.in.direction,
      duration: resolved.in.duration,
      delay: resolved.in.delay,
      interval: resolved.interval,
      easing: choice(resolved.in.easing, MOTION_EASINGS, "Legacy easing"),
    };
  }
  if (value.variables) {
    const c = plan.design.configuration;
    plan.design.palettes[`${c.ui}:${c.theme}:${c.mode}`] = {
      name: "Imported client palette",
      variables: value.variables as Record<string, string>,
    };
  }
  plan.design = validateVisualDesign(plan.design);
  return {
    plan,
    warnings: [
      "Legacy configuration restored. Fields absent from the old export use documented defaults; session-only colors and choices cannot be recovered. Random animation values were fixed for repeatable playback.",
    ],
  };
}

/** Emits only the validated, portable document, preserving every represented setting. */
export function serializeDesignPlan(plan: DesignPlan): string {
  return JSON.stringify(parseDesignPlan(plan).plan, null, 2);
}

/** Saves an independent alternative without retaining references to mutable draft data. */
export function saveAlternative(
  plan: DesignPlan,
  key: "A" | "B",
  name: string,
): DesignPlan {
  return {
    ...plan,
    alternatives: {
      ...plan.alternatives,
      [key]: { name, design: structuredClone(plan.design) },
    },
  };
}

/** Selects a saved direction by copying it into the working design. */
export function selectAlternative(
  plan: DesignPlan,
  key: "A" | "B",
): DesignPlan {
  const option = plan.alternatives[key];
  if (!option) throw new Error(`Save option ${key} before choosing it.`);
  return { ...plan, favorite: key, design: structuredClone(option.design) };
}

/** Produces a readable difference list without comparing temporary editor preferences. */
export function designDifferences(
  left: VisualDesign,
  right: VisualDesign,
): string[] {
  const differences = Object.keys(left.configuration)
    .filter(
      (key) =>
        left.configuration[key as keyof LabConfiguration] !==
        right.configuration[key as keyof LabConfiguration],
    )
    .map(
      (key) =>
        `${key}: ${left.configuration[key as keyof LabConfiguration]} → ${right.configuration[key as keyof LabConfiguration]}`,
    );
  for (const key of [
    "wrapper",
    "intensity",
    "level",
    "palettes",
    "motion",
    "primitive",
    "iconPack",
    "iconVariant",
    "modePreferences",
  ] as const)
    if (JSON.stringify(left[key]) !== JSON.stringify(right[key]))
      differences.push(`${key} differs`);
  return differences;
}
