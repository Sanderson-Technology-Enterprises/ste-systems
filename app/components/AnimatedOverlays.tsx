"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  Modal,
  Tooltip,
  type ModalProps,
  type TooltipProps,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { Motion } from "@sanderson-technology-enterprises/ste-usk-react/motion";
import {
  cancel,
  enter,
  exit,
} from "@sanderson-technology-enterprises/motion-style-css";
import {
  resolveMotionSettings,
  type MotionSettings,
} from "../lib/motion-settings";
import { useMotionPreferences } from "./MotionPreferences";

/** Resolve an overlay cycle without overriding the user's reduced-motion preference. */
function overlayOptions(settings: MotionSettings) {
  const options = resolveMotionSettings(settings);
  if (!settings.enabled) {
    options.in.duration = 0;
    options.in.delay = 0;
    options.out.duration = 0;
    options.out.delay = 0;
  }
  return options;
}

/**
 * Retain the public native Modal until its selected exit finishes.
 * The dialog root has no library-owned transform, so its ref is the motion shell.
 * @param props Controlled visibility and the shared Modal's public props.
 * @returns A focus-managed modal with real entrance/exit controller phases.
 */
export function AnimatedModal({ open = false, ...props }: ModalProps) {
  const { settings } = useMotionPreferences();
  const currentSettings = useRef(settings);
  const dialog = useRef<HTMLDialogElement>(null);
  const generation = useRef({ request: 0 });
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  useEffect(() => {
    currentSettings.current = settings;
  }, [settings]);
  useEffect(() => {
    const target = dialog.current;
    if (!present || !target) return;
    const operation = generation.current;
    const request = ++operation.request;
    const options = overlayOptions(currentSettings.current);
    if (!open) target.focus({ preventScroll: true });
    void (async () => {
      try {
        await (open ? enter : exit)(target, open ? options.in : options.out);
      } catch (error) {
        console.error("Modal motion could not complete.", error);
      } finally {
        if (request === operation.request && !open)
          flushSync(() => setPresent(false));
      }
    })();
    return () => {
      operation.request++;
      cancel(target);
      target.removeAttribute("data-ms-exited");
    };
  }, [open, present]);
  return (
    <Modal {...props} ref={dialog} open={present} data-overlay-motion="modal" />
  );
}

/**
 * Keep Tooltip positioning and ARIA ownership in the library while retaining its
 * dedicated content motion shell until exit completes. Hover, focus, and Escape
 * continue to use the public Tooltip controller.
 * @param props Public Tooltip content, trigger, placement, and description props.
 * @returns A controlled tooltip with reversible motion and no positioning overrides.
 */
export function AnimatedTooltip({
  content,
  children,
  anchorProps,
  placement = "top",
  ...props
}: Omit<TooltipProps, "open" | "defaultOpen" | "onOpenChange">) {
  const { settings } = useMotionPreferences();
  const [visible, setVisible] = useState(false);
  const [present, setPresent] = useState(false);
  const anchor = useRef<HTMLElement | null>(null);
  const [fittedPlacement, setFittedPlacement] = useState(placement);
  const requested = useRef(false);
  const [options, setOptions] = useState<ReturnType<
    typeof overlayOptions
  > | null>(null);
  const change = (next: boolean) => {
    if (next && !requested.current) setOptions(overlayOptions(settings));
    requested.current = next;
    setPresent(next);
    if (next) setVisible(true);
  };
  /** Select a public placement inside the preview's scrollport before paint.
   * The library retains tooltip positioning, ARIA, and interaction ownership. */
  useLayoutEffect(() => {
    if (!visible || !anchor.current) return;
    const element = anchor.current;
    const tooltip = element.querySelector<HTMLElement>('[role="tooltip"]');
    const host = element.closest<HTMLElement>(".workbench-preview-scroll");
    if (!tooltip || !host || getComputedStyle(host).overflowY !== "auto") {
      setFittedPlacement(placement);
      return;
    }
    const box = element.getBoundingClientRect();
    const tip = tooltip.getBoundingClientRect();
    const clip = host.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const horizontal =
      x - tip.width / 2 >= clip.left + 4 && x + tip.width / 2 <= clip.right - 4;
    const vertical =
      y - tip.height / 2 >= clip.top + 4 &&
      y + tip.height / 2 <= clip.bottom - 4;
    const fits = {
      top: horizontal && box.top - tip.height - 16 >= clip.top,
      bottom: horizontal && box.bottom + tip.height + 16 <= clip.bottom,
      left: vertical && box.left - tip.width - 16 >= clip.left,
      right: vertical && box.right + tip.width + 16 <= clip.right,
    };
    setFittedPlacement(
      ([placement, "bottom", "top", "right", "left"].find(
        (side) => fits[side as keyof typeof fits],
      ) as typeof placement) ?? placement,
    );
  }, [visible, placement]);
  return (
    <Tooltip
      {...props}
      placement={fittedPlacement}
      anchorProps={{
        ...anchorProps,
        onPointerEnter: (event) => {
          anchor.current = event.currentTarget;
          anchorProps?.onPointerEnter?.(event);
        },
        onFocus: (event) => {
          anchor.current = event.currentTarget;
          anchorProps?.onFocus?.(event);
        },
      }}
      open={visible}
      onOpenChange={change}
      content={
        <Motion
          present={present}
          enter={options?.in}
          exit={options?.out}
          data-tooltip-motion
          onMotionComplete={(phase) => {
            if (phase === "out" && !requested.current) setVisible(false);
          }}
        >
          {content}
        </Motion>
      }
    >
      {children}
    </Tooltip>
  );
}
