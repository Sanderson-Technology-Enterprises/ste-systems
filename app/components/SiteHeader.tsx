import type { ReactNode } from "react";

import type { NavigationItem } from "../data/navigation";
import { SITE, withBasePath } from "../lib/site";
import { ResponsiveNavigation } from "./ResponsiveNavigation";

type SiteHeaderProps = {
  actionItems: readonly NavigationItem[];
  brandHref: string;
  menuLabel: string;
  navigationItems: readonly NavigationItem[];
  presentation: "responsive" | "disclosure";
  tools?: ReactNode;
};

/**
 * Renders the shared brand, primary navigation, and optional route tools.
 *
 * @param props Component properties.
 * @param props.actionItems Navigation actions displayed after the primary links.
 * @param props.brandHref Destination for the brand lockup.
 * @param props.menuLabel Accessible label for the responsive navigation trigger.
 * @param props.navigationItems Primary navigation destinations.
 * @param props.presentation Responsive or always-disclosed navigation behavior.
 * @param props.tools Optional route-specific controls placed in the header toolbar.
 * @returns The shared STE Systems site header.
 */
export function SiteHeader({
  actionItems,
  brandHref,
  menuLabel,
  navigationItems,
  presentation,
  tools,
}: SiteHeaderProps) {
  const resolvedBrandHref = brandHref.startsWith("/")
    ? withBasePath(brandHref)
    : brandHref;

  return (
    <header
      className={`site-header site-header--${presentation} ly-header ly-header--sticky`}
    >
      <div className="site-header-inner ly-wrapper">
        <a
          className="brand ly-cluster ly-gap-2"
          href={resolvedBrandHref}
          aria-label="STE Systems home"
        >
          {/* The explicit helper keeps this rendered asset correct in local and Pages builds. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="brand-logo"
            src={withBasePath(`/${SITE.brandLogoPath}`)}
            width="72"
            height="54"
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="high"
          />
          <span className="brand-copy ly-stack ly-gap-2">
            <span className="brand-title">{SITE.name}</span>
            <span className="brand-owner">{SITE.productLine}</span>
          </span>
        </a>

        <div className="site-header-tools">
          <ResponsiveNavigation
            actionItems={actionItems}
            items={navigationItems}
            menuLabel={menuLabel}
            presentation={presentation}
          />
          {tools}
        </div>
      </div>
    </header>
  );
}
