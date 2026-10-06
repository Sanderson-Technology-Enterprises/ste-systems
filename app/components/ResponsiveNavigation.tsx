"use client";

import { useEffect, useRef, useState } from "react";

import type { NavigationItem } from "../data/navigation";
import { withBasePath } from "../lib/site";
import { ExternalLinkIcon, MenuIcon } from "./Icons";

const DESKTOP_NAVIGATION_QUERY = "(min-width: 64.0625rem)";
const PRIMARY_NAVIGATION_PANEL_ID = "primary-navigation-panel";

type ResponsiveNavigationProps = {
  actionItems: readonly NavigationItem[];
  items: readonly NavigationItem[];
  menuLabel: string;
  presentation: "responsive" | "disclosure";
};

const REQUESTED_BASE_PATH = process.env.NEXT_PUBLIC_PAGES_BASE_PATH ?? "";

function resolveHref(href: string): string {
  return href.startsWith("/") ? withBasePath(href, REQUESTED_BASE_PATH) : href;
}

function NavigationAnchor({
  item,
  onClick,
}: {
  item: NavigationItem;
  onClick: () => void;
}) {
  return (
    <a
      className="navigation-link interactive-surface site-action"
      data-surface-variant={item.variant ?? "subtle"}
      data-surface-level={item.variant === "accent" ? "2" : "1"}
      href={resolveHref(item.href)}
      {...(item.external
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
      onClick={onClick}
    >
      <span>{item.label}</span>
      {item.external ? (
        <>
          <ExternalLinkIcon />
          <span className="ly-visually-hidden"> (opens in a new tab)</span>
        </>
      ) : null}
    </a>
  );
}

export function ResponsiveNavigation({
  actionItems,
  items,
  menuLabel,
  presentation,
}: ResponsiveNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeFromOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !navigationRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setIsOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (presentation === "disclosure") return;

    const desktopNavigation = window.matchMedia(DESKTOP_NAVIGATION_QUERY);
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    desktopNavigation.addEventListener("change", closeAtDesktop);
    return () => {
      desktopNavigation.removeEventListener("change", closeAtDesktop);
    };
  }, [presentation]);

  const closeNavigation = () => setIsOpen(false);
  const toggleLabel = `${isOpen ? "Close" : "Open"} ${menuLabel.toLowerCase()}`;

  return (
    <div
      className="site-navigation"
      data-presentation={presentation}
      ref={navigationRef}
    >
      <button
        ref={menuButtonRef}
        className="navigation-toggle interactive-surface site-action"
        data-surface-variant="subtle"
        data-surface-level="1"
        type="button"
        aria-controls={PRIMARY_NAVIGATION_PANEL_ID}
        aria-expanded={isOpen}
        aria-label={toggleLabel}
        onClick={() => setIsOpen((currentState) => !currentState)}
      >
        <MenuIcon />
      </button>

      <div
        className="navigation-panel"
        id={PRIMARY_NAVIGATION_PANEL_ID}
        data-open={isOpen}
      >
        <nav className="primary-nav" aria-label="Primary navigation">
          {items.map((item) => (
            <NavigationAnchor
              item={item}
              key={`${item.href}-${item.label}`}
              onClick={closeNavigation}
            />
          ))}
        </nav>

        <div className="navigation-actions">
          {actionItems.map((item) => (
            <NavigationAnchor
              item={item}
              key={`${item.href}-${item.label}`}
              onClick={closeNavigation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
