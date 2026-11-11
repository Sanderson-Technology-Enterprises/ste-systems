"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  InterfaceRoot,
  Layout,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  cancel,
  enter,
  exit,
  stagger,
} from "@sanderson-technology-enterprises/motion-style-css";
import {
  isPreviewMessage,
  previewMessage,
  validatePreviewModel,
  type PreviewRenderModel,
} from "../../lib/preview-protocol";
import { interactionIntensity } from "../../lib/playground-options";
import { resolveMotionSettings } from "../../lib/motion-settings";
import { withBasePath } from "../../lib/site";
import { measureContrast } from "../../lib/contrast";
import { SHARED_COLOR_ROLES } from "../CustomThemeEditor";
import { ScenarioRenderer } from "./ScenarioRenderer";
import { MotionPreferences } from "../MotionPreferences";

/** Runs the isolated renderer and accepts commands only from its same-origin parent. */
export function StudioPreviewClient() {
  const [model, setModel] = useState<PreviewRenderModel | null>(null);
  const latest = useRef(model);
  useEffect(() => {
    latest.current = model;
  }, [model]);
  const root = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const renderRequest = useRef<string | undefined>(undefined);
  const playback = useRef(0);
  const reply = useCallback(
    (kind: string, fields: Record<string, unknown> = {}) => {
      if (window.parent !== window)
        window.parent.postMessage(
          previewMessage(kind, fields),
          location.origin,
        );
    },
    [],
  );
  const restore = useCallback(() => {
    playback.current++;
    if (!shell.current) return;
    [
      shell.current,
      ...shell.current.querySelectorAll<HTMLElement>("[data-motion-item]"),
    ].forEach((node) => {
      cancel(node);
      node.removeAttribute("data-ms-exited");
    });
  }, []);
  useEffect(() => {
    const receive = async (event: MessageEvent) => {
      if (
        event.source !== window.parent ||
        event.origin !== location.origin ||
        !isPreviewMessage(event.data)
      )
        return;
      const data = event.data;
      try {
        if (data.kind === "hello") reply("ready");
        if (data.kind === "render") {
          restore();
          renderRequest.current =
            typeof data.requestId === "string" ? data.requestId : undefined;
          setModel(validatePreviewModel(data.model as PreviewRenderModel));
        }
        if (data.kind === "capture") {
          if (
            !root.current ||
            !latest.current ||
            data.revision !== latest.current.revision
          )
            throw new Error(
              "Preview revision changed. Capture the current design again.",
            );
          restore();
          await document.fonts.ready;
          await Promise.all(
            Array.from(root.current.querySelectorAll("usk-icon")).map(
              (icon) =>
                new Promise<void>((resolve) => {
                  if (icon.shadowRoot?.querySelector("svg")) return resolve();
                  const timer = setTimeout(resolve, 3000);
                  icon.addEventListener(
                    "usk-icon-load",
                    () => {
                      clearTimeout(timer);
                      resolve();
                    },
                    { once: true },
                  );
                  icon.addEventListener(
                    "usk-icon-error",
                    () => {
                      clearTimeout(timer);
                      resolve();
                    },
                    { once: true },
                  );
                }),
            ),
          );
          if (
            root.current.querySelector("usk-icon") &&
            Array.from(root.current.querySelectorAll("usk-icon")).some(
              (icon) => !icon.shadowRoot?.querySelector("svg"),
            )
          )
            throw new Error(
              "An icon could not load. Wait for the artwork, then capture again.",
            );
          const { domToPng } = await import("modern-screenshot");
          const revision = latest.current.revision;
          const dataUrl = await domToPng(root.current, {
            scale: 1,
            backgroundColor: getComputedStyle(root.current).backgroundColor,
          });
          if (revision !== latest.current?.revision)
            throw new Error("Design changed during capture. Try again.");
          reply("image", { requestId: data.requestId, dataUrl, revision });
        }
        if (data.kind === "play" && shell.current && latest.current) {
          restore();
          if (data.phase === "restore" || data.phase === "cancel") {
            reply("status", {
              message: "Animation cancelled; preview restored.",
            });
            return;
          }
          if (!latest.current.design.motion.enabled) {
            reply("status", { message: "Animation is off." });
            return;
          }
          const operation = ++playback.current;
          const options = resolveMotionSettings(latest.current.design.motion);
          if (data.phase === "out")
            window.parent.postMessage(
              previewMessage("focus-before-exit"),
              location.origin,
            );
          const result =
            data.phase === "stagger"
              ? await stagger(
                  shell.current.querySelectorAll<HTMLElement>(
                    "[data-motion-item]",
                  ),
                  { ...options.in, interval: options.interval },
                )
              : await (data.phase === "out" ? exit : enter)(
                  shell.current,
                  data.phase === "out" ? options.out : options.in,
                );
          if (operation === playback.current)
            reply("status", {
              message: `Animation ${Array.isArray(result) ? result.map((r) => r.status).join(", ") : result.status}.`,
            });
        }
      } catch (error) {
        restore();
        reply("error", {
          requestId: data.requestId,
          message:
            error instanceof Error
              ? error.message
              : "Preview could not complete this action.",
        });
      }
    };
    addEventListener("message", receive);
    reply("ready");
    return () => {
      removeEventListener("message", receive);
      restore();
    };
  }, [reply, restore]);
  useEffect(() => {
    if (!model || !root.current) return;
    const requestId = renderRequest.current;
    let disposed = false;
    const frame = requestAnimationFrame(() => {
      if (disposed || !root.current) return;
      reply("rendered", { requestId, revision: model.revision });
      reply("contrast", {
        checks: measureContrast(root.current),
        message:
          "Solid text/background pairs checked. Hover, press or focus a control to inspect that state. Textures and gradients remain unverified.",
      });
      if (
        shell.current &&
        model.design.motion.enabled &&
        model.design.motion.animateConfigurationChanges &&
        !model.specimen
      )
        void enter(
          shell.current,
          resolveMotionSettings(model.design.motion).in,
        ).catch(() => restore());
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
    };
  }, [model, reply, restore]);
  if (!model) return <p className="ly-pad-4">Opening design preview…</p>;
  const c = model.design.configuration;
  const scope = `${c.ui}:${c.theme}:${c.mode}`;
  const style = {
    ...(c.theme === "native"
      ? Object.fromEntries(
          SHARED_COLOR_ROLES.map((role) => [`--usk-${role}-rgb`, "initial"]),
        )
      : {}),
    ...model.design.palettes[scope]?.variables,
    ...interactionIntensity(model.design.intensity),
  } as CSSProperties;
  const inspectState = (target: EventTarget, state: string) => {
    const element = (target as HTMLElement).closest<HTMLElement>(
      "button,input,select,a",
    );
    if (element && root.current)
      requestAnimationFrame(() => {
        if (root.current)
          reply("contrast", {
            checks: measureContrast(root.current, state, element),
            message: `Measured ${state} state; other interaction states have not been checked.`,
          });
      });
  };
  return (
    <MotionPreferences value={model.design.motion}>
      <InterfaceRoot
        ref={root}
        preset={c.ui}
        theme={c.theme === "native" ? undefined : c.theme}
        mode={c.mode}
        layout={c.layout}
        density={c.density}
        iconAssetBase={withBasePath("/vendor/ui-style-kit-icons/")}
        style={style}
        className="studio-render-root"
        data-scenario-root
        data-website-type={model.preview.scenario}
        onPointerOver={(e) => inspectState(e.target, "hover")}
        onPointerDown={(e) => inspectState(e.target, "pressed")}
        onFocus={(e) => inspectState(e.target, "focus")}
      >
        <div ref={shell} data-preview-motion className="ly-pad-4">
          <Layout.Wrapper measure={model.design.wrapper}>
            <ScenarioRenderer
              key={model.preview.scenario}
              model={model}
              navigate={(screen) => {
                setModel((current) =>
                  current
                    ? { ...current, preview: { ...current.preview, screen } }
                    : current,
                );
                reply("screen", { screen });
              }}
            />
          </Layout.Wrapper>
        </div>
      </InterfaceRoot>
    </MotionPreferences>
  );
}
