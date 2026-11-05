"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SurfaceFeedback } from "@sanderson-technology-enterprises/ste-usk-react";

/** Pending browser resources owned by one transient feedback demonstration. */
type FeedbackWork = { frame: number; timer?: number };

/**
 * Replay the public Interactive Surface feedback hook and clear it after the demo.
 * @returns A replay handler that owns and cleans up every animation frame/timer.
 */
export function useSurfaceFeedback() {
  const active = useRef(new Map<HTMLElement, FeedbackWork>());
  useEffect(() => {
    const work = active.current;
    return () => {
      for (const [element, pending] of work) {
        cancelAnimationFrame(pending.frame);
        window.clearTimeout(pending.timer);
        element.removeAttribute("data-surface-feedback");
      }
      work.clear();
    };
  }, []);
  return useCallback((element: HTMLElement, outcome: SurfaceFeedback) => {
    const previous = active.current.get(element);
    if (previous) {
      cancelAnimationFrame(previous.frame);
      window.clearTimeout(previous.timer);
    }
    element.removeAttribute("data-surface-feedback");
    const work: FeedbackWork = { frame: 0 };
    active.current.set(element, work);
    work.frame = requestAnimationFrame(() => {
      work.frame = requestAnimationFrame(() => {
        if (active.current.get(element) !== work) return;
        element.setAttribute("data-surface-feedback", outcome);
        work.timer = window.setTimeout(() => {
          if (active.current.get(element) !== work) return;
          element.removeAttribute("data-surface-feedback");
          active.current.delete(element);
        }, 650);
      });
    });
  }, []);
}
