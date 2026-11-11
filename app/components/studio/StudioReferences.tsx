"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Keeps technical references available without crowding the client workspace.
 * Legacy fragments also reveal ancestors of lazily mounted integration examples.
 * The browser may open this uncontrolled details element before React hydrates a bookmark.
 * @param props Existing guides, installation options, and advanced examples.
 * @returns A native disclosure that honors direct reference bookmarks.
 */
export function StudioReferences({ children }: { children: ReactNode }) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const follow = () => {
      let fragment: string;
      try {
        fragment = decodeURIComponent(location.hash.slice(1));
      } catch {
        return;
      }
      if (!fragment || !disclosure.current) return;
      if (
        fragment === "integrate" ||
        disclosure.current.querySelector(`#${CSS.escape(fragment)}`)
      )
        disclosure.current.open = true;
    };
    follow();
    addEventListener("hashchange", follow);
    return () => removeEventListener("hashchange", follow);
  }, []);
  return (
    <details
      ref={disclosure}
      className="studio-reference ly-wrapper"
      suppressHydrationWarning
    >
      <summary className="interactive-surface">
        Explore the design system
        <span>Component guides, advanced examples, and installation</span>
      </summary>
      {children}
    </details>
  );
}
