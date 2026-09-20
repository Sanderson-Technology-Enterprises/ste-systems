import type { NavigationItem } from "../data/navigation";
import { SITE, withBasePath } from "../lib/site";
import { ResponsiveNavigation } from "./ResponsiveNavigation";

type SiteHeaderProps = {
  actionItems: readonly NavigationItem[];
  brandHref: string;
  menuLabel: string;
  navigationItems: readonly NavigationItem[];
  presentation: "responsive" | "disclosure";
};

export function SiteHeader({
  actionItems,
  brandHref,
  menuLabel,
  navigationItems,
  presentation,
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

        <ResponsiveNavigation
          actionItems={actionItems}
          items={navigationItems}
          menuLabel={menuLabel}
          presentation={presentation}
        />
      </div>
    </header>
  );
}
