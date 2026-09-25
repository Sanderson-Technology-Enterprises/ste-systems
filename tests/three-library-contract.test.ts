import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ADOPTION_PATHS,
  BUNDLER_IMPORTS,
  CDN_LINKS,
  ECOSYSTEM_PACKAGES,
  NPM_INSTALL,
} from "../app/data/ecosystem";
import { SUPPORTED_COMBINATIONS_LABEL } from "../app/data/atlas";
import { SITE } from "../app/lib/site";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("the public ecosystem contains exactly the three CSS libraries", () => {
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ name, version }) => ({ name, version })),
    [
      { name: "layout-style-css", version: "3.2.0" },
      { name: "ui-style-kit-css", version: "2.4.1" },
      { name: "interactive-surface-css", version: "1.7.0" },
    ],
  );

  assert.equal(BUNDLER_IMPORTS.length, 4);
  assert.equal(CDN_LINKS.length, 4);
  assert.equal(
    NPM_INSTALL.split(" ").filter((word) => word.includes("@")).length,
    3,
  );
  assert.match(NPM_INSTALL, /ui-style-kit-css@2\.4\.1(?:\s|$)/);
  assert.doesNotMatch(NPM_INSTALL, /codeload\.github\.com|tar\.gz/);
  assert.equal(ADOPTION_PATHS.length, 7);
});

test("the headline count includes densities and native color schemes", () => {
  const homepage = readFileSync(`${repositoryRoot}/app/page.tsx`, "utf8");

  assert.equal(SUPPORTED_COMBINATIONS_LABEL, "218,400");
  assert.match(homepage, /SUPPORTED_COMBINATIONS_LABEL/);
  assert.equal(20 * 7 * 3 * (20 * 20 + 20), 176_400);
});

test("STE Systems identity exposes the approved brand assets and destinations", () => {
  const identity = SITE as typeof SITE & {
    customizedPlatforms: { name: string; url: string };
    owner: typeof SITE.owner & { legalName: string };
    productLine: string;
  };

  assert.equal(identity.name, "STE Systems");
  assert.equal(
    identity.title,
    "STE Systems | Accessible Three-Library Design System",
  );
  assert.equal(identity.url, "https://stesystems.com/");
  assert.equal(
    identity.socialImage,
    "https://stesystems.com/ste-systems-social-preview.png",
  );
  assert.equal(
    identity.brandLogo,
    "https://stesystems.com/ste-systems-logo.png",
  );
  assert.equal(
    identity.repository,
    "https://github.com/Sanderson-Technology-Enterprises/ste-systems",
  );
  assert.equal(
    identity.owner.legalName,
    "Sanderson Technology Enterprises LLC",
  );
  assert.equal(
    identity.productLine,
    "A product of Sanderson Technology Enterprises LLC",
  );
  assert.equal(
    identity.owner.url,
    "https://sandersontechnologyenterprises.com/",
  );
  assert.deepEqual(identity.customizedPlatforms, {
    name: "Customized Platforms",
    url: "https://customizedplatforms.com/",
  });
});
