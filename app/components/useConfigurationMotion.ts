"use client";

import { useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import {
  cancel,
  enter,
  exit,
} from "@sanderson-technology-enterprises/motion-style-css";
import { resolveMotionSettings } from "../lib/motion-settings";
import { useMotionPreferences } from "./MotionPreferences";

/**
 * Coordinate an exit, atomic configuration swap, and entrance on a dedicated shell.
 * Superseded changes never apply stale state; controls live outside this shell.
 * @param getShell Stable lookup of the application's painted-content shell.
 * @returns A transition runner and an interrupt that commits the latest request.
 */
export function useConfigurationMotion(getShell: () => HTMLElement | null) {
  const { settings } = useMotionPreferences();
  const request = useRef(0);
  const pending = useRef<(() => void) | null>(null);

  /** Cancel the active owner and optionally apply the most recent pending choice. */
  const interrupt = useCallback(
    (commitPending = true) => {
      request.current++;
      const shell = getShell();
      if (shell) {
        cancel(shell);
        shell.removeAttribute("data-ms-exited");
        shell.dataset.configurationMotionState = "idle";
      }
      const apply = pending.current;
      pending.current = null;
      if (commitPending && apply) flushSync(apply);
    },
    [getShell],
  );

  useEffect(() => () => interrupt(false), [interrupt]);

  /**
   * Apply only the latest visual change, with reduced-motion and off shortcuts.
   * @param apply Synchronous React state update for the requested configuration.
   * @returns Resolves after entrance or cancellation, without leaving content hidden.
   */
  const transition = useCallback(
    async (apply: () => void) => {
      interrupt(false);
      const operation = request.current;
      const shell = getShell();
      if (
        !shell ||
        !settings.enabled ||
        !settings.animateConfigurationChanges ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        apply();
        return;
      }
      pending.current = apply;
      const effects = resolveMotionSettings(settings);
      try {
        shell.dataset.configurationMotionState = "out";
        await exit(shell, effects.out);
        // Cancellation of a phase cannot discard the newest configuration request.
        if (operation !== request.current) return;
        pending.current = null;
        flushSync(apply);
        shell.dataset.configurationMotionState = "in";
        await enter(shell, effects.in);
      } catch (error) {
        if (operation === request.current && pending.current) {
          const latest = pending.current;
          pending.current = null;
          flushSync(latest);
        }
        console.error("Configuration motion could not complete.", error);
      } finally {
        if (operation === request.current) {
          shell.removeAttribute("data-ms-exited");
          shell.dataset.configurationMotionState = "idle";
        }
      }
    },
    [getShell, interrupt, settings],
  );
  return { transition, interrupt };
}
