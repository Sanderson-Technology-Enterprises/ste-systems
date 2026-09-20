import { ECOSYSTEM_PACKAGES } from "../data/ecosystem";
import { SITE, withBasePath } from "../lib/site";
import { ExternalLinkIcon } from "./Icons";

type SiteFooterProps = {
  companyUrl: string;
};

export function SiteFooter({ companyUrl }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner ly-wrapper ly-stack ly-gap-6">
        <div className="footer-brand ly-cluster ly-gap-4">
          {/* The explicit helper keeps this rendered asset correct in local and Pages builds. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="footer-logo"
            src={withBasePath(`/${SITE.brandLogoPath}`)}
            width="144"
            height="108"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
          <p className="ly-stack ly-gap-2">
            <strong>{SITE.name}</strong>
            <small>{SITE.productLine}</small>
            <small>One semantic interface. Three focused CSS libraries.</small>
          </p>
        </div>

        <div className="ly-cluster ly-gap-4 ly-items-start">
          <a href={companyUrl} target="_blank" rel="noreferrer noopener">
            {SITE.owner.legalName}
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
          <a
            href={SITE.customizedPlatforms.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            {SITE.customizedPlatforms.name}
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
          <a href={SITE.repository} target="_blank" rel="noreferrer noopener">
            GitHub repository
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>

        <nav
          className="footer-package-links ly-cluster ly-gap-4"
          aria-label="Package links"
        >
          {ECOSYSTEM_PACKAGES.map((pkg) => (
            <a
              key={pkg.name}
              href={pkg.links.npm}
              target="_blank"
              rel="noreferrer noopener"
            >
              {pkg.name}
              <span className="ly-visually-hidden">
                {" "}
                on npm (opens in a new tab)
              </span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
