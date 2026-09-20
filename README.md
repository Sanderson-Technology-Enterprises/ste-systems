# STE Systems

[STE Systems](https://stesystems.com/) is the accessible three-library design system from Sanderson Technology Enterprises LLC. It demonstrates how structure, visual identity, and interaction can share one semantic HTML contract.

- Product owner: [Sanderson Technology Enterprises LLC](https://sandersontechnologyenterprises.com/)
- Custom platform work: [Customized Platforms](https://customizedplatforms.com/)
- Live site: [stesystems.com](https://stesystems.com/)
- Source: [Sanderson-Technology-Enterprises/ste-systems](https://github.com/Sanderson-Technology-Enterprises/ste-systems)
- Deployment target: Render Static Site

## Ecosystem resources

| Layer     | Package                         | Repository                                                      | Wiki                                                           | npm                                                          | Demo                                                           |
| --------- | ------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| Structure | `layout-style-css@3.2.0`        | [Repository](https://github.com/Foscat/Layout-Style-CSS)        | [Wiki](https://github.com/Foscat/Layout-Style-CSS/wiki)        | [npm](https://www.npmjs.com/package/layout-style-css)        | [Live demo](https://foscat.github.io/Layout-Style-CSS/)        |
| Identity  | `ui-style-kit-css@2.4.0`        | [Repository](https://github.com/Foscat/ui-style-kit-css)        | [Wiki](https://github.com/Foscat/ui-style-kit-css/wiki)        | [npm](https://www.npmjs.com/package/ui-style-kit-css)        | [Live demo](https://foscat.github.io/ui-style-kit-css/)        |
| Behavior  | `interactive-surface-css@1.7.0` | [Repository](https://github.com/Foscat/Interactive-Surface-CSS) | [Wiki](https://github.com/Foscat/Interactive-Surface-CSS/wiki) | [npm](https://www.npmjs.com/package/interactive-surface-css) | [Live demo](https://foscat.github.io/Interactive-Surface-CSS/) |

## Adoption matrix

Every package is independently useful. The showcase documents and renders all
supported combinations so teams can begin with one responsibility and add
layers without changing ownership boundaries.

| Path                 | Libraries               | Recommended entry points                                                                                                                      |
| -------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout only          | Layout                  | `layout-style-css`                                                                                                                            |
| UI only              | UI                      | `ui-style-kit-css/visual.css`                                                                                                                 |
| Interaction only     | Interaction             | `interactive-surface-css/standalone-preset.css`                                                                                               |
| Layout + UI          | Layout, UI              | `ui-style-kit-css/visual.css`, `layout-style-css`                                                                                             |
| Layout + interaction | Layout, interaction     | `interactive-surface-css/standalone-preset.css`, `layout-style-css`                                                                           |
| UI + interaction     | UI, interaction         | `ui-style-kit-css/visual.css`, `ui-style-kit-css/interactive-surface-theme.css`, `interactive-surface-css/state-core.css`                     |
| Complete stack       | Layout, UI, interaction | `ui-style-kit-css/visual.css`, `ui-style-kit-css/interactive-surface-theme.css`, `interactive-surface-css/state-core.css`, `layout-style-css` |

## Install with npm

Install the exact aligned releases:

```bash
npm install ui-style-kit-css@2.4.0 layout-style-css@3.2.0 interactive-surface-css@1.7.0
```

Then load the package entry points in ownership order. UI Style Kit establishes
paint and theme tokens, Interactive Surface adds state mechanics, and Layout
Style owns final geometry.
Layout Style CSS 3.2.0 uses the v3 structural contract and adds resilient
Mosaic and Action Bar compositions, four specialized personalities, canonical
recipe and area attributes, and application-owned container queries for
product-specific topology.

```ts
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

UI Style Kit 2.4 exposes 20 visual systems and 20 themes through stable
semantic classes such as `.ui-card`,
`.ui-field`, `.ui-input`, and `.ui-button`. Set `data-ui-variant` on semantic
buttons, badges, and alerts when a contextual treatment is required. Keep
preset-prefixed classes for advanced typography, placement, sizing, and
preset-only extras; switching `data-ui` should not require renaming semantic
component classes. Native controls now inherit each preset's geometry,
material, border, depth, and indicator language while explicit shared themes
retain precedence.

Interactive Surface CSS 1.7 adds transient
`data-surface-feedback="success|error|attention"` outcomes. Applications must
remove the attribute after the visible feedback window and announce the result
through visible status text or an `aria-live` region.

## Use the libraries locally

The site itself installs the libraries as direct dependencies. Global CSS entry
points load from `app/layout.tsx`.

```ts
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

## Use the CDN

For static HTML consumers, keep this exact order in the document head:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.4.0/dist/ui-style-kit.visual.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.4.0/styles/interactive-surface-theme.css"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.7.0/state-core.css"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/layout-style-css@3.2.0/dist/layout-style-css.min.css"
/>
```

The versions are intentionally pinned so production interfaces do not change when a package publishes a new release.

## Isolated integration fixtures

The integration laboratory builds deterministic iframe fixtures from the exact
installed package exports before local development or artifact inspection:

```bash
npm run fixtures:build
```

The `predev`, `prebuild`, and `prebuild:pages` hooks run the generator
automatically. Generated files live under `public/fixtures/generated/` and are
intentionally ignored by Git. Each fixture copies CSS from local, pinned
`node_modules` package exports; it does not load runtime styles from a CDN.

Validate the catalog, package versions, copied bytes, safe paths, semantic
hooks, and deterministic output with:

```bash
npm run test:fixtures
```

## Quality gate

Run the full source, export, and rendered browser gate before handoff:

```bash
npm run quality
```

`quality` includes formatting, linting, type checks, unit/source contracts, deterministic
fixture safety and byte-parity checks, the GitHub Pages export build, export
verification, exhaustive Chromium desktop/mobile QA, and representative Firefox
and WebKit coverage.

## Search ownership verification

Optional search-console verification is configured at build time through the
server-owned `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` variables.
Both values are blank by default in `.env.example`; the export omits each meta
tag until a real, non-empty token is supplied. Never commit production tokens.

After the Render custom-domain deployment is live, submit the canonical sitemap
directly in Google Search Console and Bing Webmaster Tools:

```text
https://stesystems.com/sitemap.xml
```

## Company and privacy

The developer path leads directly to the source, package resources, and exact
adoption recipes. Organizations can work with
[Sanderson Technology Enterprises LLC](https://sandersontechnologyenterprises.com/)
on creator-owned platforms, private systems, admin tools, and operational
workflows, or visit [Customized Platforms](https://customizedplatforms.com/)
for tailored platform delivery.

The static showcase currently includes no analytics or tracking integration and
sets no first-party cookies. It stores only the selected Lab UI configuration in
browser `localStorage`; that preference remains on the device and is not
transmitted by the site.

## Local CSS policy

This project exists to demonstrate three CSS libraries, so local CSS should stay
small. Prefer library classes such as `ly-wrapper`, `ly-section`, `ly-grid`,
`ly-card-grid`, `ly-stack`, `ly-cluster`, `ly-surface`, `ly-app-shell`, and
`interactive-surface` before adding a project-specific class.

Use `app/globals.css` only for site-specific glue: brand marks, the custom
observatory orbit, a small number of semantic helper styles, and responsive
connections that the packages cannot infer from the markup.

## Shared markup contract

The libraries coordinate through four root attributes while preserving semantic HTML:

```html
<main
  class="ly-root"
  data-ly-layout="bento"
  data-ui="minimal-saas"
  data-theme="midnight-gold"
  data-mode="dark"
>
  <!-- Semantic application content -->
</main>
```

## Hero observatory interaction

The hero's `InterfaceObservatory` is intentionally interactive. The orbit
controls select one ecosystem layer, update the package summary, and expose
repository, wiki, npm, and demo links for that selected package.

When changing this component, keep the orbit controls as real buttons with
visible focus states and `aria-pressed` state. If the visual treatment changes
back toward pure decoration, remove button affordances instead of leaving
non-functional clickable-looking dots.
