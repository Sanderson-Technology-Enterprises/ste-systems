"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Form,
  InterfaceRoot,
  Layout,
  type LayoutRecipeName,
  type LayoutWrapperMeasure,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  cancel,
  enter,
  exit,
  stagger,
} from "@sanderson-technology-enterprises/motion-style-css";
import { MotionShowcase } from "./MotionShowcase";
import { MotionSettings } from "../MotionSettings";
import { useMotionPreferences } from "../MotionPreferences";
import { useConfigurationMotion } from "../useConfigurationMotion";
import { resolveMotionSettings } from "../../lib/motion-settings";
import {
  UI_THEMES,
  UI_PRESETS,
  LAYOUT_PERSONALITIES,
  LAYOUT_RECIPES,
  type UiPreset,
  type LayoutPersonality,
} from "../../data/catalog";
import {
  LAYOUT_DENSITIES,
  SUPPORTED_COMBINATIONS_LABEL,
} from "../../data/atlas";
import { formatThemeLabel, type LabTheme } from "../../lib/configuration";
import { CustomThemeEditor, SHARED_COLOR_ROLES } from "../CustomThemeEditor";
import {
  interactionIntensity,
  type HoverIntensity,
} from "../../lib/playground-options";
import { LayoutExplorer } from "./LayoutExplorer";

/** Appearance choices are applied together between the two motion phases. */
interface PreviewAppearance {
  style: UiPreset;
  theme: LabTheme;
  mode: "light" | "dark" | "contrast";
  layout: LayoutPersonality;
  recipe: LayoutRecipeName;
  density: "compact" | "normal" | "spacious";
  wrapper: LayoutWrapperMeasure;
}

/** Options for the standalone Lab section or its embedded guide specimen. */
interface MotionLabProps {
  embedded?: boolean;
}

/**
 * Exercises the installed motion controller on separate shells. Controls remain
 * outside the animated content, own focus before exit, and stay usable while a
 * phase runs. Cleanup cancels every controller owner and stale status update.
 * @param props Whether to render the compact guide specimen.
 * @returns An interactive entrance, exit, cancellation, and choreography Lab.
 */
export function MotionLab({ embedded = false }: MotionLabProps) {
  const preview = useRef<HTMLDivElement>(null);
  const browserRoot = useRef<HTMLDivElement>(null);
  const entrance = useRef<HTMLButtonElement>(null);
  const generation = useRef({ request: 0 });
  const [target, setTarget] = useState("workspace");
  const [appearance, setAppearance] = useState<PreviewAppearance>({
    style: "minimal-saas",
    theme: "midnight-gold",
    mode: "dark",
    layout: "minimal-saas",
    recipe: "card-grid",
    density: "compact",
    wrapper: "full",
  });
  const [requestedAppearance, setRequestedAppearance] = useState(appearance);
  const appearanceRef = useRef(appearance);
  const [intensity, setIntensity] = useState<HoverIntensity>("balanced");
  const [customThemes, setCustomThemes] = useState<
    Record<string, Record<string, string>>
  >({});
  const getBrowserRoot = useCallback(() => browserRoot.current, []);
  const { settings } = useMotionPreferences();
  const getMotionShell = useCallback(() => preview.current, []);
  const { transition, interrupt } = useConfigurationMotion(getMotionShell);
  const [status, setStatus] = useState(
    "Ready. Choose an effect and play a phase.",
  );
  useEffect(() => {
    const shell = preview.current;
    const operation = generation.current;
    return () => {
      operation.request++;
      if (shell) {
        cancel(shell);
        shell
          .querySelectorAll<HTMLElement>("[data-motion-item]")
          .forEach(cancel);
      }
    };
  }, []);

  /**
   * Run the selected shell or panel group and report only the newest outcome.
   * @param phase Entrance, exit, or coordinated entrance of the specimen panels.
   * @returns Resolves after the current controller operation settles.
   */
  async function play(phase: "in" | "out" | "stagger") {
    interrupt();
    const shell = preview.current;
    if (!shell) return;
    const request = ++generation.current.request;
    cancel(shell);
    const items = [
      ...shell.querySelectorAll<HTMLElement>("[data-motion-item]"),
    ];
    items.forEach(cancel);
    [shell, ...items].forEach((item) => item.removeAttribute("data-ms-exited"));
    if (phase === "out") entrance.current?.focus();
    setStatus("Playing motion.");
    try {
      const effects = resolveMotionSettings(settings);
      const options = phase === "out" ? effects.out : effects.in;
      const selected =
        target === "featured"
          ? (shell.querySelector<HTMLElement>("[data-motion-featured]") ??
            shell)
          : shell;
      const result =
        phase === "stagger" || target === "panels"
          ? await stagger(items, {
              ...options,
              phase: phase === "out" ? "out" : "in",
              interval: effects.interval,
            })
          : await (phase === "out" ? exit : enter)(selected, options);
      if (request === generation.current.request)
        setStatus(
          `${phase === "stagger" ? "Choreography" : phase === "out" ? "Exit" : "Entrance"}: ${Array.isArray(result) ? [...new Set(result.map((item) => item.status))].join(", ") : result.status}.`,
        );
    } catch {
      if (request === generation.current.request) {
        shell.removeAttribute("data-ms-exited");
        setStatus("The effect could not run. The preview remains available.");
      }
    }
  }

  /**
   * Cancel owned effects and optionally restore every previously exited shell.
   * @param reset Whether to reveal the workspace and all specimen panels.
   * @param commitPending Whether to apply the latest pending appearance first.
   * @returns Nothing; updates the accessible playback status.
   */
  function stop(reset: boolean, commitPending = true) {
    interrupt(commitPending);
    generation.current.request++;
    if (preview.current) {
      cancel(preview.current);
      preview.current
        .querySelectorAll<HTMLElement>("[data-motion-item]")
        .forEach((item) => {
          cancel(item);
          if (reset) item.removeAttribute("data-ms-exited");
        });
      if (reset) preview.current.removeAttribute("data-ms-exited");
    }
    setStatus(reset ? "Preview reset." : "Motion cancelled.");
  }

  /**
   * Retain the latest requested appearance while exiting the previous paint.
   * @param patch The style, palette, or mode selected by the user.
   * @returns Nothing; the shared motion runner applies the atomic update.
   */
  function configurePreview(patch: Partial<PreviewAppearance>) {
    const next = { ...appearanceRef.current, ...patch };
    appearanceRef.current = next;
    setRequestedAppearance(next);
    stop(true, false);
    void transition(() => setAppearance(next));
  }

  const id = embedded ? "motion-guide-preview" : "motion";
  const Title = embedded ? "h3" : "h2";
  const paletteScope = `${appearance.style}:${appearance.theme}:${appearance.mode}`;
  const nativeReset =
    appearance.theme === "native"
      ? Object.fromEntries(
          SHARED_COLOR_ROLES.map((role) => [`--usk-${role}-rgb`, "initial"]),
        )
      : {};
  const browserStyle = {
    ...nativeReset,
    ...customThemes[paletteScope],
    ...interactionIntensity(intensity),
  };
  return (
    <section
      id={id}
      className={
        embedded
          ? "motion-lab ly-stack ly-gap-4"
          : "motion-lab ly-wrapper ly-section ly-stack ly-gap-4"
      }
      aria-labelledby={`${id}-title`}
    >
      <header
        className={
          embedded ? "ly-stack ly-gap-3" : "section-heading ly-stack ly-gap-3"
        }
      >
        <p className="section-label">Motion Style CSS / New to STE</p>
        <Title id={`${id}-title`}>Motion with a clear beginning and end.</Title>
        <p>
          Try all 17 paired motion presets on a complete interface, a featured
          card, or six coordinated panels. Compare real controls, forms,
          feedback, and data across visual styles while the same content stays
          in place.
        </p>
      </header>
      <p>
        All {SUPPORTED_COMBINATIONS_LABEL} counted combinations are selectable:
        layout, recipe, spacing density, visual style, and color scheme. Display
        modes, motion, hover intensity, and custom colors provide additional
        controls.
      </p>
      <MotionSettings />
      <CustomThemeEditor
        preset={appearance.style}
        theme={appearance.theme}
        mode={appearance.mode}
        getRoot={getBrowserRoot}
        onApply={(variables) => {
          stop(true);
          void transition(() =>
            setCustomThemes((current) => ({
              ...current,
              [paletteScope]: variables,
            })),
          );
        }}
      />
      <Layout.Grid minColumnWidth="16rem" gap={3}>
        <Form.Select
          label="Motion target"
          value={target}
          onChange={(event) => {
            stop(true);
            setTarget(event.target.value);
          }}
        >
          <option value="workspace">Complete workspace</option>
          <option value="panels">All specimen panels</option>
          <option value="featured">Featured card</option>
        </Form.Select>
        <Form.Select
          label="Preview style"
          value={requestedAppearance.style}
          onChange={(event) => {
            configurePreview({ style: event.target.value as UiPreset });
          }}
        >
          {UI_PRESETS.map((style) => (
            <option key={style.id} value={style.id}>
              {style.label}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Preview layout"
          value={requestedAppearance.layout}
          onChange={(event) =>
            configurePreview({
              layout: event.target.value as LayoutPersonality,
            })
          }
        >
          {LAYOUT_PERSONALITIES.map((layout) => (
            <option key={layout} value={layout}>
              {layout.replaceAll("-", " ")}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Preview recipe"
          value={requestedAppearance.recipe}
          onChange={(event) =>
            configurePreview({ recipe: event.target.value as LayoutRecipeName })
          }
        >
          {LAYOUT_RECIPES.map((recipe) => (
            <option key={recipe} value={recipe}>
              {recipe.replaceAll("-", " ")}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Preview density"
          value={requestedAppearance.density}
          onChange={(event) =>
            configurePreview({
              density: event.target.value as PreviewAppearance["density"],
            })
          }
        >
          {LAYOUT_DENSITIES.map((density) => (
            <option key={density} value={density}>
              {density}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Preview palette"
          value={requestedAppearance.theme}
          onChange={(event) =>
            configurePreview({
              theme: event.target.value as PreviewAppearance["theme"],
            })
          }
        >
          <option value="native">Preset default</option>
          {UI_THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {formatThemeLabel(theme)}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Preview wrapper"
          value={requestedAppearance.wrapper}
          onChange={(event) =>
            configurePreview({
              wrapper: event.target.value as LayoutWrapperMeasure,
            })
          }
        >
          {(
            [
              "compact",
              "prose",
              "content",
              "workspace",
              "wide",
              "full",
              "breakout",
            ] as const
          ).map((wrapper) => (
            <option key={wrapper} value={wrapper}>
              {wrapper}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Hover intensity"
          value={intensity}
          onChange={(event) =>
            setIntensity(event.target.value as HoverIntensity)
          }
        >
          {(["none", "subtle", "balanced", "strong"] as const).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Preview appearance"
          value={requestedAppearance.mode}
          onChange={(event) => {
            configurePreview({
              mode: event.target.value as PreviewAppearance["mode"],
            });
          }}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="contrast">High contrast</option>
        </Form.Select>
      </Layout.Grid>
      <Layout.Cluster gap={3}>
        <Button ref={entrance} onClick={() => void play("in")}>
          Play entrance
        </Button>
        <Button variant="secondary" onClick={() => void play("out")}>
          Play exit
        </Button>
        <Button variant="secondary" onClick={() => void play("stagger")}>
          Play stagger
        </Button>
        <Button variant="secondary" onClick={() => stop(false)}>
          Cancel motion
        </Button>
        <Button variant="secondary" onClick={() => stop(true)}>
          Reset preview
        </Button>
      </Layout.Cluster>
      <InterfaceRoot
        ref={browserRoot}
        className="motion-browser"
        data-motion-browser
        preset={appearance.style}
        theme={appearance.theme === "native" ? undefined : appearance.theme}
        mode={appearance.mode}
        density={appearance.density}
        layout={appearance.layout}
        style={browserStyle}
      >
        <div className="motion-browser-chrome ly-cluster ly-justify-between ly-gap-3 ly-pad-4">
          <span className="motion-browser-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="motion-browser-address">
            preview.ste / motion / {appearance.style}
          </span>
          <span className="motion-browser-caption">
            Live component workspace
          </span>
        </div>
        <div
          ref={preview}
          className="motion-browser-page ly-stack ly-gap-4 ly-pad-4"
          data-motion-preview="lab"
        >
          <Layout.Wrapper measure={appearance.wrapper}>
            <MotionShowcase embedded={embedded} recipe={appearance.recipe} />
            <LayoutExplorer />
          </Layout.Wrapper>
        </div>
      </InterfaceRoot>
      <p role="status" aria-live="polite" data-motion-status>
        {status}
      </p>
      <p>
        Reduced motion is respected automatically. Play stagger reveals the six
        panels in sequence. Completed exits hide the selected target; reset
        brings every panel back. The preview uses UI Style Kit for appearance
        and Motion Style CSS for lifecycle effects.
      </p>
    </section>
  );
}
