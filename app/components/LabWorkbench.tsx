"use client";

import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  Button,
  Form,
  InterfaceRoot,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { presets } from "@sanderson-technology-enterprises/motion-style-css";
import {
  LAYOUT_PERSONALITIES,
  LAYOUT_RECIPES,
  UI_PRESETS,
  UI_THEMES,
  getUiPrefix,
  type UiPreset,
} from "../data/catalog";
import {
  animationPreset,
  createDesignPlan,
  designDifferences,
  parseDesignPlan,
  saveAlternative,
  SCENARIOS,
  serializeDesignPlan,
  selectAlternative,
  type DesignPlan,
  type VisualDesign,
} from "../lib/design-plan";
import { encodeVisualLink } from "../lib/design-sharing";
import { previewModel } from "../lib/preview-protocol";
import {
  buildThemeExport,
  colorToHex,
  hexToChannels,
} from "../lib/playground-options";
import { configurationMarkup } from "../lib/configuration";
import { MOTION_EASINGS } from "../lib/motion-settings";
import { withBasePath } from "../lib/site";
import type { InspectorGroup } from "../lib/inspector-state";
import { describeContrast, type ContrastCheck } from "../lib/contrast";
import { useDesignPlan } from "./DesignPlanProvider";
import { WorkbenchInspector } from "./WorkbenchInspector";
import { PreviewFrame, type PreviewFrameHandle } from "./studio/PreviewFrame";

const DIRECTIONS = [
  {
    name: "Clean",
    ui: "minimal-saas",
    theme: "native",
    recipe: "split-hero",
    description: "Open space and clear action.",
  },
  {
    name: "Warm",
    ui: "organic-modern",
    theme: "walnut-clay",
    recipe: "card-grid",
    description: "A human, welcoming feel.",
  },
  {
    name: "Editorial",
    ui: "paper-editorial",
    theme: "native",
    recipe: "gallery",
    description: "Strong stories and hierarchy.",
  },
  {
    name: "Bold",
    ui: "bauhaus",
    theme: "native",
    recipe: "split-hero",
    description: "Graphic confidence.",
  },
  {
    name: "Industrial",
    ui: "industrial-utility",
    theme: "native",
    recipe: "dashboard",
    description: "Practical, precise structure.",
  },
] as const;
/** Gallery labels and representative native swatches for all published style presets. */
const STYLE_DETAILS: Record<
  UiPreset,
  { description: string; swatches: readonly [string, string, string] }
> = {
  "minimal-saas": {
    description: "Clear interfaces with generous space.",
    swatches: ["#f6f8fc", "#18283d", "#5552e8"],
  },
  bento: {
    description: "Modular cards and soft contrast.",
    swatches: ["#eef2f8", "#24374f", "#6496c5"],
  },
  maximalist: {
    description: "Energetic layers and expressive color.",
    swatches: ["#1b1533", "#f0b823", "#dc4a8c"],
  },
  bauhaus: {
    description: "Geometric forms and primary color.",
    swatches: ["#f8f4e7", "#1859b9", "#d64034"],
  },
  tactile: {
    description: "Warm surfaces with physical detail.",
    swatches: ["#eee5d7", "#624d3c", "#c07e50"],
  },
  neumorphism: {
    description: "Soft relief and quiet controls.",
    swatches: ["#e7edf3", "#59718b", "#a6c0d5"],
  },
  retrofuturism: {
    description: "Optimistic forms with bright accents.",
    swatches: ["#222947", "#f09b7d", "#86d8e0"],
  },
  brutalism: {
    description: "Direct hierarchy and sharp edges.",
    swatches: ["#f5f0e6", "#161616", "#f03d2b"],
  },
  cyberpunk: {
    description: "Electric contrast and technical energy.",
    swatches: ["#10101f", "#d8f33f", "#e149cf"],
  },
  y2k: {
    description: "Playful gloss and turn-of-century color.",
    swatches: ["#ece9ff", "#6e40b9", "#eb70b8"],
  },
  "retro-glass": {
    description: "Translucent panels with nostalgic glow.",
    swatches: ["#182343", "#79c9d7", "#eab1cb"],
  },
  "editorial-luxe": {
    description: "Refined typography and elegant pacing.",
    swatches: ["#f8f5ee", "#282420", "#b3926c"],
  },
  "organic-modern": {
    description: "Natural shapes and welcoming warmth.",
    swatches: ["#f3eee3", "#435e4a", "#b68163"],
  },
  "industrial-utility": {
    description: "Functional surfaces and clear status.",
    swatches: ["#202a30", "#e1a02f", "#8da5a3"],
  },
  "technical-blueprint": {
    description: "Precise grid and schematic clarity.",
    swatches: ["#142947", "#9cc1d6", "#f2f6f8"],
  },
  "art-deco": {
    description: "Symmetry and richly framed accents.",
    swatches: ["#161d2b", "#cda859", "#efe8d9"],
  },
  clay: {
    description: "Rounded forms with friendly depth.",
    swatches: ["#f4e5d7", "#da8a6a", "#557b8f"],
  },
  "data-terminal": {
    description: "Dense information and high signal.",
    swatches: ["#0a1716", "#71c9a1", "#d6e5d7"],
  },
  "paper-editorial": {
    description: "Print-like rhythm and content focus.",
    swatches: ["#f7f4ec", "#272725", "#a84d3c"],
  },
  "neo-noir": {
    description: "Dark atmosphere and dramatic highlights.",
    swatches: ["#10121d", "#ddd0bd", "#8d78ce"],
  },
};
const SIMPLE_COLORS = ["primary", "accent", "bg", "surface", "text"] as const;
const EXTRA_COLORS =
  "surface-strong surface-soft text-muted border primary-hover primary-text secondary secondary-hover secondary-text accent-text success success-text warning warning-text danger danger-text link focus".split(
    " ",
  );
const scopeOf = (design: VisualDesign) =>
  `${design.configuration.ui}:${design.configuration.theme}:${design.configuration.mode}`;

/** Downloads a frozen client artifact without requiring an account or server. */
function download(
  name: string,
  data: Blob | string,
  type = "application/octet-stream",
) {
  const url = URL.createObjectURL(
    typeof data === "string" ? new Blob([data], { type }) : data,
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/** Provides the guided client workflow while keeping durable choices in DesignPlan. */
export function LabWorkbench() {
  const {
    plan,
    ready,
    saveStatus,
    notice,
    canUndo,
    update,
    updateDesign,
    open,
    undo,
    announce,
  } = useDesignPlan();
  const [contrast, setContrast] = useState<ContrastCheck[]>([]);
  const [compare, setCompare] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [briefImage, setBriefImage] = useState("");
  const [briefPlan, setBriefPlan] = useState<DesignPlan | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [advancedColors, setAdvancedColors] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const frame = useRef<PreviewFrameHandle>(null);
  const full = useRef<HTMLDivElement>(null);
  const fullOpener = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const changed = () => {
      if (document.fullscreenElement !== full.current) {
        setFullscreen(false);
        fullOpener.current?.focus();
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        document.fullscreenElement === full.current
      ) {
        event.preventDefault();
        void document.exitFullscreen();
      }
    };
    document.addEventListener("fullscreenchange", changed);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("fullscreenchange", changed);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const model = useMemo(() => previewModel(plan), [plan]);
  const design = plan.design,
    config = design.configuration;
  const brief = briefPlan ?? plan;
  const scope = scopeOf(design),
    palette = design.palettes[scope];
  const prefix = config.theme === "native" ? getUiPrefix(config.ui) : "usk";
  const configuration = (patch: Partial<typeof config>) =>
    updateDesign({ configuration: { ...config, ...patch } });
  const project = (key: keyof DesignPlan["project"], value: string) =>
    update((p) => ({ ...p, project: { ...p.project, [key]: value } }));
  const preview = (patch: Partial<DesignPlan["preview"]>) =>
    update((p) => ({ ...p, preview: { ...p.preview, ...patch } }));
  const note = (key: keyof DesignPlan["notes"], value: string) =>
    update((p) => ({ ...p, notes: { ...p.notes, [key]: value } }));
  const resetSection = (section: "appearance" | "layout" | "animation") => {
    const defaults = createDesignPlan().design;
    if (section === "appearance")
      updateDesign({
        configuration: {
          ...config,
          ui: defaults.configuration.ui,
          theme: defaults.configuration.theme,
          mode: defaults.configuration.mode,
        },
        palettes: {},
      });
    if (section === "layout")
      updateDesign({
        configuration: {
          ...config,
          layout: defaults.configuration.layout,
          recipe: defaults.configuration.recipe,
          density: defaults.configuration.density,
        },
        wrapper: defaults.wrapper,
        primitive: defaults.primitive,
      });
    if (section === "animation") updateDesign({ motion: defaults.motion });
  };
  const color = (role: string) => {
    const token = `--${prefix}-${role}-rgb`,
      stored = palette?.variables[token];
    if (stored) return colorToHex(stored);
    const root = frame.current?.getRoot();
    try {
      if (root)
        return colorToHex(getComputedStyle(root).getPropertyValue(token));
    } catch {
      /* A material can use a non-solid expression. */
    }
    return (
      (
        {
          primary: "#335d91",
          accent: "#ba7924",
          bg: "#ffffff",
          surface: "#f2f4f7",
          text: "#172235",
        } as Record<string, string>
      )[role] ?? "#777777"
    );
  };
  const setColor = (role: string, value: string) =>
    update((p) => {
      const key = scopeOf(p.design),
        variables = {
          ...p.design.palettes[key]?.variables,
          [`--${prefix}-${role}-rgb`]: hexToChannels(value),
        };
      return {
        ...p,
        design: {
          ...p.design,
          palettes: {
            ...p.design.palettes,
            [key]: {
              name: p.design.palettes[key]?.name || "My colors",
              variables,
            },
          },
        },
        favorite: null,
      };
    });
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error("Design files must be smaller than 2 MiB.");
      const result = parseDesignPlan(await file.text());
      open(result.plan, `Design file opened. ${result.warnings.join(" ")}`);
    } catch (error) {
      announce(
        `Design file was not opened: ${error instanceof Error ? error.message : "Invalid file."} Your working design is unchanged.`,
      );
    }
  };
  const makeLink = async () => {
    try {
      const link = await encodeVisualLink(plan, location.href);
      setShareLink(link);
      await navigator.clipboard.writeText(link);
      announce(
        "Visual link copied. It contains no project copy or consultation notes.",
      );
    } catch (error) {
      announce(
        `${error instanceof Error ? error.message : "Could not create a link."} Download the complete design file.`,
      );
    }
  };
  const capture = async () => {
    setBusy(true);
    try {
      const result = await frame.current?.capture();
      if (!result || result.revision !== plan.revision)
        throw new Error("Design changed during capture. Try again.");
      setBriefImage(result.dataUrl);
      download(
        `ste-preview-r${result.revision}.png`,
        await (await fetch(result.dataUrl)).blob(),
      );
      announce(`Preview image downloaded from revision ${result.revision}.`);
    } catch (error) {
      announce(
        `Image capture failed: ${error instanceof Error ? error.message : "Unknown error."}`,
      );
    } finally {
      setBusy(false);
    }
  };
  const printBrief = async () => {
    setBusy(true);
    try {
      const frozen = structuredClone(plan),
        result = await frame.current?.capture();
      if (!result || result.revision !== frozen.revision)
        throw new Error(
          "The design changed while preparing the brief. Try again.",
        );
      setBriefPlan(frozen);
      setBriefImage(result.dataUrl);
      requestAnimationFrame(() => setTimeout(() => window.print(), 100));
      announce(`Brief prepared from revision ${frozen.revision}.`);
    } catch (error) {
      announce(
        `Brief preview image failed: ${error instanceof Error ? error.message : "Unknown error."} Download the design file for a complete handoff.`,
      );
    } finally {
      setBusy(false);
    }
  };
  const toggleFull = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      fullOpener.current?.focus();
      setFullscreen(false);
    } else if (full.current) {
      await full.current.requestFullscreen();
      setFullscreen(true);
    }
  };
  const field = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    multiline = false,
  ) =>
    multiline ? (
      <Form.TextArea
        label={label}
        className="studio-field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
      />
    ) : (
      <Form.Input
        label={label}
        className="studio-field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  const select = (
    label: string,
    value: string,
    choices: readonly (string | { value: string; label: string })[],
    onChange: (value: string) => void,
  ) => (
    <Form.Select
      className="studio-field"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {choices.map((item) => {
        const choice =
          typeof item === "string"
            ? { value: item, label: item.replaceAll("-", " ") }
            : item;
        return (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        );
      })}
    </Form.Select>
  );
  const colors = (roles: readonly string[]) => (
    <div className="studio-colors">
      {roles.map((role) => (
        <div key={role} className="studio-color">
          <Form.Input
            label={`${role.replaceAll("-", " ")} color`}
            type="color"
            value={color(role)}
            onChange={(event) => setColor(role, event.target.value)}
          />
          <code>{color(role)}</code>
        </div>
      ))}
    </div>
  );
  const controls = (group: InspectorGroup): ReactNode => (
    <div className="studio-controls">
      {group === "Preview" && (
        <>
          <p>
            Choose a sample site and explore how your design works. Sample
            actions stay local.
          </p>
          {select(
            "Preview scenario",
            plan.preview.scenario,
            SCENARIOS.map((item) => ({ value: item.id, label: item.label })),
            (value) =>
              preview({
                scenario: value as DesignPlan["preview"]["scenario"],
                screen: SCENARIOS.find((item) => item.id === value)!.screens[0],
              }),
          )}
          {select(
            "Screen",
            plan.preview.screen,
            SCENARIOS.find((item) => item.id === plan.preview.scenario)!
              .screens,
            (screen) => preview({ screen }),
          )}
          <h3>Your website</h3>
          {field("Business name", plan.project.name, (value) =>
            project("name", value),
          )}
          {field(
            "Headline",
            plan.project.headline,
            (value) => project("headline", value),
            true,
          )}
          {field("Main action", plan.project.action, (value) =>
            project("action", value),
          )}
          {field(
            "Website purpose",
            plan.project.purpose,
            (value) => project("purpose", value),
            true,
          )}
          {field(
            "Who is it for?",
            plan.project.audience,
            (value) => project("audience", value),
            true,
          )}
        </>
      )}
      {group === "Style and colors" && (
        <>
          <p>Choose a visual direction, then personalize its colors.</p>
          {select(
            "Visual style",
            config.ui,
            UI_PRESETS.map((item) => ({ value: item.id, label: item.label })),
            (ui) => configuration({ ui: ui as typeof config.ui }),
          )}
          {select(
            "Palette",
            config.theme,
            [
              { value: "native", label: "Style colors" },
              ...UI_THEMES.map((theme) => ({
                value: theme,
                label: theme.replaceAll("-", " "),
              })),
            ],
            (theme) => configuration({ theme: theme as typeof config.theme }),
          )}
          {select(
            "Display mode",
            config.mode,
            ["light", "dark", "contrast"],
            (mode) => configuration({ mode: mode as typeof config.mode }),
          )}
          <h3>Starting directions</h3>
          <div className="studio-directions">
            {DIRECTIONS.map((item) => (
              <Button
                variant="secondary"
                key={item.name}
                onClick={() =>
                  configuration({
                    ui: item.ui,
                    theme: item.theme,
                    recipe: item.recipe,
                  })
                }
              >
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </Button>
            ))}
          </div>
          <h3>Design gallery</h3>
          <Button
            variant="secondary"
            className="studio-text-button"
            onClick={() => setGalleryOpen((value) => !value)}
            aria-expanded={galleryOpen}
          >
            {galleryOpen ? "Hide" : "Browse"} all {UI_PRESETS.length} styles
          </Button>
          {galleryOpen && (
            <div className="studio-gallery">
              {UI_PRESETS.map((item) => (
                <div key={item.id} className="studio-gallery-card">
                  <div className="studio-gallery-image">
                    <PreviewFrame
                      thumbnail
                      readOnly
                      model={{
                        ...model,
                        specimen: true,
                        design: {
                          ...design,
                          configuration: { ...config, ui: item.id },
                        },
                      }}
                      title={`${item.label} sample`}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => configuration({ ui: item.id })}
                    aria-pressed={config.ui === item.id}
                    aria-label={`Use ${item.label} visual style`}
                  >
                    <strong>{item.label}</strong>
                    <span className="studio-style-description">
                      {STYLE_DETAILS[item.id].description}
                    </span>
                    <span
                      className="studio-gallery-swatches"
                      aria-label="Representative palette colors"
                    >
                      {STYLE_DETAILS[item.id].swatches.map((swatch) => (
                        <i
                          key={swatch}
                          className="studio-gallery-swatch"
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          )}
          <h3>Colors</h3>
          {field("Palette name", palette?.name || "My colors", (value) =>
            update((p) => ({
              ...p,
              design: {
                ...p.design,
                palettes: {
                  ...p.design.palettes,
                  [scope]: {
                    name: value,
                    variables: p.design.palettes[scope]?.variables || {},
                  },
                },
              },
            })),
          )}
          {colors(SIMPLE_COLORS)}
          <Button
            variant="secondary"
            className="studio-text-button"
            onClick={() => setAdvancedColors((value) => !value)}
            aria-expanded={advancedColors}
          >
            Advanced colors
          </Button>
          {advancedColors && colors(EXTRA_COLORS)}
          <p>Light and dark colors are stored in separate palette scopes.</p>
          <h3>Contrast</h3>
          <p>
            Measured solid text and background pairs. Textures and gradients
            need a manual review.
          </p>
          <ul>
            {contrast.slice(0, 8).map((check, index) => (
              <li key={index}>{describeContrast(check)}</li>
            ))}
          </ul>
          <Button onClick={() => resetSection("appearance")}>
            Reset appearance
          </Button>
        </>
      )}
      {group === "Page layout" && (
        <>
          <p>Choose the structure and room your content needs.</p>
          {select(
            "Content width",
            design.wrapper,
            [
              "compact",
              "prose",
              "content",
              "workspace",
              "wide",
              "full",
              "breakout",
            ],
            (value) =>
              updateDesign({ wrapper: value as typeof design.wrapper }),
          )}
          {select(
            "Page arrangement",
            config.recipe || "split-hero",
            LAYOUT_RECIPES,
            (value) => configuration({ recipe: value as typeof config.recipe }),
          )}
          <div className="studio-arrangements">
            {LAYOUT_RECIPES.map((item) => (
              <Button
                variant="secondary"
                key={item}
                className="studio-arrangement"
                aria-pressed={config.recipe === item}
                onClick={() => configuration({ recipe: item })}
              >
                <span className="studio-arrangement-art" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                {item.replaceAll("-", " ")}
              </Button>
            ))}
          </div>
          {select(
            "Spacing",
            config.density || "normal",
            [
              { value: "compact", label: "Compact" },
              { value: "normal", label: "Comfortable" },
              { value: "spacious", label: "Spacious" },
            ],
            (value) =>
              configuration({ density: value as typeof config.density }),
          )}
          <details>
            <summary>Advanced layout geometry</summary>
            {select(
              "Layout personality",
              config.layout,
              LAYOUT_PERSONALITIES,
              (value) =>
                configuration({ layout: value as typeof config.layout }),
            )}
            {select(
              "Primitive",
              design.primitive.primitive,
              [
                "grid",
                "stack",
                "cluster",
                "sidebar",
                "mosaic",
                "split",
                "panes",
                "media",
                "reel",
                "frame",
                "page",
                "header",
                "footer",
                "main",
                "section",
                "surface",
                "readable",
                "center",
                "cover",
                "switcher",
                "action-bar",
                "scroll",
              ],
              (value) =>
                updateDesign({
                  primitive: {
                    ...design.primitive,
                    primitive: value as typeof design.primitive.primitive,
                  },
                }),
            )}
          </details>
          <Button onClick={() => resetSection("layout")}>
            Reset page layout
          </Button>
        </>
      )}
      {group === "Effects" && (
        <>
          <p>Set the energy of the design. Reduced motion is respected.</p>
          <div className="studio-row">
            {(["none", "subtle", "expressive"] as const).map((name) => (
              <Button
                key={name}
                variant={
                  JSON.stringify(design.motion) ===
                  JSON.stringify(animationPreset(name))
                    ? "primary"
                    : "secondary"
                }
                onClick={() => updateDesign({ motion: animationPreset(name) })}
              >
                {name[0].toUpperCase() + name.slice(1)}
              </Button>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              updateDesign({
                motion: {
                  ...design.motion,
                  enabled: true,
                  entrance: presets[Math.floor(Math.random() * presets.length)],
                  exit: presets[Math.floor(Math.random() * presets.length)],
                  direction: (["up", "down", "left", "right"] as const)[
                    Math.floor(Math.random() * 4)
                  ],
                },
              })
            }
          >
            Surprise me
          </Button>
          <h3>Animation playback</h3>
          <div className="studio-row">
            {(["in", "out", "stagger", "cancel", "restore"] as const).map(
              (phase) => (
                <Button
                  key={phase}
                  variant="secondary"
                  onClick={() => frame.current?.play(phase)}
                >
                  {phase}
                </Button>
              ),
            )}
          </div>
          <details>
            <summary>Advanced animation · {presets.length} effects</summary>
            <Form.Checkbox
              label="Animate design changes"
              checked={design.motion.animateConfigurationChanges}
              onChange={(event) =>
                updateDesign({
                  motion: {
                    ...design.motion,
                    animateConfigurationChanges: event.target.checked,
                  },
                })
              }
            />
            {select(
              "Entrance effect",
              design.motion.entrance,
              presets,
              (value) =>
                updateDesign({
                  motion: {
                    ...design.motion,
                    entrance: value as typeof design.motion.entrance,
                  },
                }),
            )}
            {select("Exit effect", design.motion.exit, presets, (value) =>
              updateDesign({
                motion: {
                  ...design.motion,
                  exit: value as typeof design.motion.exit,
                },
              }),
            )}
            {select(
              "Direction",
              design.motion.direction,
              ["up", "down", "left", "right"],
              (value) =>
                updateDesign({
                  motion: {
                    ...design.motion,
                    direction: value as typeof design.motion.direction,
                  },
                }),
            )}
            {select("Easing", design.motion.easing, MOTION_EASINGS, (value) =>
              updateDesign({
                motion: {
                  ...design.motion,
                  easing: value as typeof design.motion.easing,
                },
              }),
            )}
            {(["duration", "delay", "interval"] as const).map((key) => (
              <Form.Input
                key={key}
                label={`${key[0].toUpperCase() + key.slice(1)} (ms)`}
                type="number"
                min="0"
                max="60000"
                value={design.motion[key]}
                onChange={(event) =>
                  updateDesign({
                    motion: {
                      ...design.motion,
                      [key]: Number(event.target.value),
                    },
                  })
                }
              />
            ))}
          </details>
          <h3>Interaction and elevation</h3>
          {select(
            "Hover strength",
            design.intensity,
            ["none", "subtle", "balanced", "strong"],
            (value) =>
              updateDesign({ intensity: value as typeof design.intensity }),
          )}
          {select(
            "Elevation",
            String(design.level),
            [
              { value: "mixed", label: "Show all three levels" },
              ...([1, 2, 3] as const).map((level) => ({
                value: String(level),
                label: `Level ${level}`,
              })),
            ],
            (value) =>
              updateDesign({
                level:
                  value === "mixed" ? "mixed" : (Number(value) as 1 | 2 | 3),
              }),
          )}
          <h3>Icons</h3>
          {select(
            "Icon family",
            design.iconPack,
            [
              { value: "auto", label: "Follow visual style" },
              ...UI_PRESETS.map((item) => ({
                value: item.id,
                label: item.label,
              })),
            ],
            (value) =>
              updateDesign({ iconPack: value as typeof design.iconPack }),
          )}
          {select(
            "Icon treatment",
            design.iconVariant,
            ["themed", "monochrome"],
            (value) =>
              updateDesign({ iconVariant: value as typeof design.iconVariant }),
          )}
          <Button onClick={() => resetSection("animation")}>
            Reset animation
          </Button>
        </>
      )}
      {group === "Compare" && (
        <>
          <p>
            Save two independent directions. They use the same content, screen,
            and viewport.
          </p>
          {(["A", "B"] as const).map((key) => (
            <section key={key} className="studio-option">
              <h3>Option {key}</h3>
              {plan.alternatives[key] &&
                field("Name", plan.alternatives[key]!.name, (value) =>
                  update((p) => ({
                    ...p,
                    alternatives: {
                      ...p.alternatives,
                      [key]: { ...p.alternatives[key]!, name: value },
                    },
                  })),
                )}
              <Button
                onClick={() =>
                  update((p) =>
                    saveAlternative(
                      p,
                      key,
                      p.alternatives[key]?.name || `Option ${key}`,
                    ),
                  )
                }
              >
                Save as option {key}
              </Button>
              {plan.alternatives[key] && (
                <>
                  <p>
                    {plan.alternatives[key]!.design.configuration.ui} ·{" "}
                    {plan.alternatives[key]!.design.configuration.theme}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => update((p) => selectAlternative(p, key))}
                  >
                    Use option {key}
                  </Button>
                </>
              )}
            </section>
          ))}
          <Button
            onClick={() => setCompare((value) => !value)}
            disabled={!plan.alternatives.A || !plan.alternatives.B}
          >
            Compare options
          </Button>
          {compare && plan.alternatives.A && plan.alternatives.B && (
            <ul>
              {designDifferences(
                plan.alternatives.A.design,
                plan.alternatives.B.design,
              ).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {field(
            "Why this direction?",
            plan.notes.rationale,
            (value) => note("rationale", value),
            true,
          )}
        </>
      )}
      {group === "Review and save" && (
        <>
          <p>
            Review your choices and bring a complete preference brief to your
            consultation.
          </p>
          {field("Plan title", plan.title, (value) =>
            update((p) => ({ ...p, title: value })),
          )}
          <p>
            Revision {plan.revision} · {saveStatus}
          </p>
          <p>
            {config.ui} · {config.theme} · {config.recipe} · {design.wrapper}{" "}
            width
          </p>
          {field(
            "What you like",
            plan.notes.likes,
            (value) => note("likes", value),
            true,
          )}
          {field(
            "What you would change",
            plan.notes.dislikes,
            (value) => note("dislikes", value),
            true,
          )}
          {field(
            "Requests for STE",
            plan.notes.requests,
            (value) => note("requests", value),
            true,
          )}
          {field(
            "Open decisions",
            plan.notes.decisions,
            (value) => note("decisions", value),
            true,
          )}
          <div className="studio-actions">
            <Button
              onClick={() =>
                download(
                  `${plan.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "ste-design"}.ste-design.json`,
                  serializeDesignPlan(plan),
                  "application/json",
                )
              }
            >
              Download design file
            </Button>
            <Form.Input
              label="Open design file"
              type="file"
              accept=".json,.ste-design.json,application/json"
              onChange={handleFile}
            />
            <Button variant="secondary" onClick={() => void makeLink()}>
              Copy visual link
            </Button>
            {shareLink && (
              <Form.TextArea label="Visual link" readOnly value={shareLink} />
            )}
            <Button onClick={() => void capture()} disabled={busy}>
              Download preview image
            </Button>
            <Button onClick={() => void printBrief()} disabled={busy}>
              Print design preference brief / PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                download(
                  `ste-technical-r${plan.revision}.json`,
                  JSON.stringify(
                    {
                      revision: plan.revision,
                      packages: plan.packages,
                      design: plan.design,
                    },
                    null,
                    2,
                  ),
                  "application/json",
                )
              }
            >
              Download technical appendix
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                download(
                  `ste-theme-r${plan.revision}.css`,
                  buildThemeExport({
                    name: palette?.name || plan.title,
                    preset: config.ui,
                    theme: config.theme,
                    mode: config.mode,
                    variables: palette?.variables || {},
                  }).css,
                  "text/css",
                )
              }
            >
              Download theme CSS
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                download(
                  `ste-markup-r${plan.revision}.html`,
                  configurationMarkup(config),
                  "text/html",
                )
              }
            >
              Download starter markup
            </Button>
            <Button variant="secondary" onClick={undo} disabled={!canUndo}>
              Undo
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                open(
                  createDesignPlan(),
                  "Started a new design. Undo restores the previous draft.",
                )
              }
            >
              Start over
            </Button>
          </div>
        </>
      )}
    </div>
  );
  if (!ready) return <p role="status">Opening design plan…</p>;
  return (
    <section
      className="unified-workbench studio-workbench"
      aria-label="Client design studio"
    >
      <header className="studio-intro">
        <div>
          <p className="studio-eyebrow">STE design studio</p>
          <h1>Plan the look and feel of your STE website</h1>
          <p>
            Choose a starting direction, try sample pages, and save the choices
            you want STE to implement.
          </p>
        </div>
        <div className="studio-meta">
          <strong>
            {config.ui.replaceAll("-", " ")} ·{" "}
            {config.theme.replaceAll("-", " ")}
          </strong>
          <span role="status">{saveStatus}</span>
        </div>
      </header>
      {notice && (
        <p role="status" className="studio-notice">
          {notice}
        </p>
      )}
      <WorkbenchInspector controls={controls}>
        <InterfaceRoot
          preset="minimal-saas"
          theme="midnight-gold"
          mode="dark"
          iconAssetBase={withBasePath("/vendor/ui-style-kit-icons/")}
          className="studio-canvas"
          ref={full}
        >
          <div className="studio-toolbar">
            <div
              className="studio-device-controls"
              role="group"
              aria-label="Preview viewport"
            >
              {(["fit", "desktop", "tablet", "phone"] as const).map(
                (device) => (
                  <Button
                    key={device}
                    variant={
                      plan.preview.device === device ? "primary" : "secondary"
                    }
                    aria-label={`${device[0].toUpperCase() + device.slice(1)} preview`}
                    onClick={() => preview({ device })}
                  >
                    {device}
                  </Button>
                ),
              )}
            </div>
            <Button
              ref={fullOpener}
              variant="secondary"
              onClick={() => void toggleFull()}
            >
              {fullscreen ? "Exit fullscreen" : "Fullscreen preview"}
            </Button>
          </div>
          <PreviewFrame
            ref={frame}
            model={model}
            onScreenChange={(screen) => preview({ screen })}
            onContrast={setContrast}
            onReport={announce}
            onFocusBeforeExit={() => fullOpener.current?.focus()}
          />
          <p className="studio-canvas-help">
            Interactive sample. Nothing sends messages, places orders, books
            appointments, or approves a design.
          </p>
        </InterfaceRoot>
        {compare && plan.alternatives.A && plan.alternatives.B && (
          <div className="studio-compare-canvas">
            <h2>Compare options on the same screen and device</h2>
            <div className="studio-compare-grid">
              {(["A", "B"] as const).map((key) => (
                <section key={key}>
                  <h3>{plan.alternatives[key]!.name}</h3>
                  <PreviewFrame
                    readOnly
                    model={{ ...model, design: plan.alternatives[key]!.design }}
                    title={`Option ${key} preview`}
                  />
                </section>
              ))}
            </div>
          </div>
        )}
      </WorkbenchInspector>
      <section className="studio-brief" aria-label="Design preference brief">
        <h1>Design preference brief</h1>
        <p>
          {brief.title} · Revision {brief.revision} ·{" "}
          {new Date(brief.updatedAt).toLocaleDateString()}
        </p>
        <p>
          Business: {brief.project.name || "To discuss"} · Purpose:{" "}
          {brief.project.purpose || "To discuss"} · Audience:{" "}
          {brief.project.audience || "To discuss"}
        </p>
        {briefImage && (
          <Image
            unoptimized
            src={briefImage}
            alt="Representative website preview"
            width={1200}
            height={900}
          />
        )}
        <h2>Selected direction</h2>
        <p>
          {brief.design.configuration.ui} · {brief.design.configuration.theme} ·{" "}
          {brief.design.configuration.mode} ·{" "}
          {brief.design.configuration.recipe} · {brief.design.wrapper} width
        </p>
        <h2>Consultation notes</h2>
        <p>Likes: {brief.notes.likes || "—"}</p>
        <p>Changes: {brief.notes.dislikes || "—"}</p>
        <p>Rationale: {brief.notes.rationale || "—"}</p>
        <p>Requests: {brief.notes.requests || "—"}</p>
        <p>Open decisions: {brief.notes.decisions || "—"}</p>
        <h2>Alternatives</h2>
        <p>
          {Object.entries(brief.alternatives)
            .map(([key, value]) => `${key}: ${value.name}`)
            .join(" · ") || "None saved"}
        </p>
        <h2>Technical appendix</h2>
        <pre>{JSON.stringify(brief, null, 2)}</pre>
      </section>
    </section>
  );
}
