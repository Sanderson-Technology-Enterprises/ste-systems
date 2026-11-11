"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  isPreviewMessage,
  previewMessage,
  type PreviewRenderModel,
} from "../../lib/preview-protocol";
import { withBasePath } from "../../lib/site";
import type { ContrastCheck } from "../../lib/contrast";

export interface PreviewFrameHandle {
  capture: () => Promise<{ dataUrl: string; revision: number }>;
  play: (phase: "in" | "out" | "stagger" | "cancel" | "restore") => void;
  getRoot: () => HTMLElement | null;
}

/** Hosts the actual responsive viewport; screenshots and playback execute in its own realm. */
export const PreviewFrame = forwardRef<
  PreviewFrameHandle,
  {
    model: PreviewRenderModel;
    title?: string;
    thumbnail?: boolean;
    thumbnailKind?: "style" | "template";
    readOnly?: boolean;
    onReport?: (message: string) => void;
    onScreenChange?: (screen: string) => void;
    onContrast?: (checks: ContrastCheck[]) => void;
    onFocusBeforeExit?: () => void;
  }
>(function PreviewFrame(
  {
    model,
    title = "Website design preview",
    thumbnail = false,
    thumbnailKind = "style",
    readOnly = false,
    onReport,
    onScreenChange,
    onContrast,
    onFocusBeforeExit,
  },
  ref,
) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const latest = useRef(model);
  latest.current = model;
  const report = useRef(onReport);
  report.current = onReport;
  const screenChange = useRef(onScreenChange);
  screenChange.current = onScreenChange;
  const contrast = useRef(onContrast);
  contrast.current = onContrast;
  const focusBeforeExit = useRef(onFocusBeforeExit);
  focusBeforeExit.current = onFocusBeforeExit;
  // Correlation is scoped to this frame and its pending map; no secure-origin API is needed.
  const requestSequence = useRef(0);
  const pending = useRef(
    new Map<
      string,
      {
        resolve: (data: Record<string, unknown>) => void;
        reject: (error: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >(),
  );
  const send = useCallback(
    (kind: string, fields: Record<string, unknown> = {}) =>
      iframe.current?.contentWindow?.postMessage(
        previewMessage(kind, fields),
        location.origin,
      ),
    [],
  );
  const request = useCallback(
    (kind: string, fields: Record<string, unknown>) =>
      new Promise<Record<string, unknown>>((resolve, reject) => {
        const requestId = `preview-${++requestSequence.current}`;
        const timer = setTimeout(() => {
          pending.current.delete(requestId);
          reject(
            new Error(
              "Preview did not respond. Reopen the preview and try again.",
            ),
          );
        }, 20000);
        pending.current.set(requestId, { resolve, reject, timer });
        send(kind, { ...fields, requestId });
      }),
    [send],
  );
  useEffect(() => {
    const requests = pending.current;
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== iframe.current?.contentWindow ||
        !isPreviewMessage(event.data)
      )
        return;
      const data = event.data;
      if (data.kind === "ready") {
        setReady(true);
        send("render", { model: latest.current });
      }
      if (data.kind === "screen" && typeof data.screen === "string")
        screenChange.current?.(data.screen);
      if (data.kind === "contrast" && Array.isArray(data.checks))
        contrast.current?.(data.checks as ContrastCheck[]);
      if (data.kind === "focus-before-exit") focusBeforeExit.current?.();
      if (typeof data.requestId === "string") {
        const operation = requests.get(data.requestId);
        if (operation) {
          clearTimeout(operation.timer);
          requests.delete(data.requestId);
          if (data.kind === "error")
            operation.reject(new Error(String(data.message)));
          else operation.resolve(data);
        }
      }
      if (
        (data.kind === "status" || data.kind === "error") &&
        typeof data.message === "string"
      )
        report.current?.(data.message);
    };
    addEventListener("message", receive);
    return () => {
      removeEventListener("message", receive);
      for (const p of requests.values()) {
        clearTimeout(p.timer);
        p.reject(new Error("Preview closed."));
      }
      requests.clear();
    };
  }, [send]);
  useEffect(() => {
    if (ready) send("render", { model });
  }, [ready, model, send]);
  useEffect(() => {
    if (ready) return;
    // Either realm may hydrate first. Retry the idempotent hello until both listeners exist.
    const timer = setInterval(() => send("hello"), 250);
    send("hello");
    return () => clearInterval(timer);
  }, [ready, send]);
  useImperativeHandle(
    ref,
    () => ({
      capture: async () => {
        if (!ready)
          throw new Error(
            "The preview is still opening. Try again in a moment.",
          );
        const frozen = structuredClone(latest.current);
        await request("render", { model: frozen });
        const result = await request("capture", { revision: frozen.revision });
        return {
          dataUrl: String(result.dataUrl),
          revision: Number(result.revision),
        };
      },
      play: (phase) => send("play", { phase }),
      getRoot: () =>
        iframe.current?.contentDocument?.querySelector<HTMLElement>(
          "[data-scenario-root]",
        ) ?? null,
    }),
    [ready, request, send],
  );
  const width = thumbnail
    ? thumbnailKind === "template"
      ? 960
      : 480
    : { desktop: 1280, tablet: 768, phone: 390, fit: undefined }[
        model.preview.device
      ];
  return (
    <div
      className={
        thumbnail
          ? `studio-thumbnail-viewport${thumbnailKind === "template" ? " studio-template-thumbnail" : ""}`
          : "studio-frame-viewport"
      }
    >
      <iframe
        ref={iframe}
        src={withBasePath("/studio-preview/")}
        title={title}
        loading={thumbnail ? "lazy" : "eager"}
        tabIndex={thumbnail || readOnly ? -1 : undefined}
        aria-hidden={thumbnail || undefined}
        inert={thumbnail || readOnly}
        className={
          thumbnail ? "studio-thumbnail-frame" : "studio-preview-frame"
        }
        style={
          width
            ? {
                width,
                ...(thumbnail && thumbnailKind === "template"
                  ? { height: 640 }
                  : {}),
              }
            : undefined
        }
        onLoad={() => send("hello")}
      />
    </div>
  );
});
