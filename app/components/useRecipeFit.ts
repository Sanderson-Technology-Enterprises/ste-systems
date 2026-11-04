"use client";

import { useLayoutEffect, type RefObject } from "react";

/**
 * Probe a public recipe's automatic topology before paint and stack it when needed.
 * This guard owns only the documented data-ly-responsive attribute; the React
 * recipe deliberately leaves that optional prop unset. Width changes and layout
 * selections trigger probes, while height changes cannot start a feedback loop.
 * @param rootRef The mounted application recipe, including its main region.
 * @param signature Layout-affecting selections, excluding editor preferences.
 * @param enabled Whether the presentation uses named regions rather than cards.
 */
export function useRecipeFit(
  rootRef: RefObject<HTMLElement | null>,
  signature: string,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    let previousWidth = -1;
    const probe = (force = false) => {
      const width = root.getBoundingClientRect().width;
      if (width === 0 || (!force && Math.abs(width - previousWidth) < 0.5))
        return;
      previousWidth = width;
      root.setAttribute("data-ly-responsive", "auto");
      const style = getComputedStyle(root);
      const available =
        root.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const required = Math.min(
        28 * parseFloat(getComputedStyle(document.documentElement).fontSize),
        available,
      );
      const main = root.querySelector<HTMLElement>(".workbench-main");
      if (
        main &&
        (main.getBoundingClientRect().width < required - 0.5 ||
          root.scrollWidth > root.clientWidth + 1)
      )
        root.setAttribute("data-ly-responsive", "manual");
    };
    probe(true);
    const observer = new ResizeObserver(() => probe());
    observer.observe(root);
    return () => {
      observer.disconnect();
      root.removeAttribute("data-ly-responsive");
    };
  }, [rootRef, signature, enabled]);
}
