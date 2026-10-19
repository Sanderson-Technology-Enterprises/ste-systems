# Audit improvements delivery

Date: October 19, 2026

Scope: the current working tree, retaining the earlier copy, spacing, client-system descriptions, and public business links. No dependency upgrade, commit, push, merge, or deployment is included in this delivery.

## Results

| Finding                       | Delivery                                                                                                                                                                                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1: Oversized logo            | Added transparent 64, 128, 256, and 384px WebP variants, responsive image sources, and a reproducible asset build. The header typically selects a 2,582–6,750 byte image; the largest variant is 31,612 bytes. The 1,087,286 byte master remains unchanged for metadata and other uses. |
| A2: Configuration semantics   | Removed the incorrect menu popup declaration. The form disclosure retains its expanded state, controlled panel, normal Tab order, Escape dismissal, and focus return.                                                                                                                   |
| A3: Repeated copy feedback    | Each result replaces a keyed announcement inside the same atomic status region. Identical consecutive success or error messages can produce a fresh accessibility update. Selectable source remains available when clipboard access fails.                                              |
| A4: Mobile guide discovery    | All four installed package tabs appear in a two-column grid at widths up to 60rem. Logical tab order, fragment selection, and 44px-or-larger targets are retained.                                                                                                                      |
| A5: Early client-service path | Added a Customized Platforms link immediately after the developer hero actions. The full company name and public company link remain in the footer; private projects have no outbound access links.                                                                                     |
| A6: Stylesheet weight         | Investigated and measured; reduction remains open. Added per-route raw/gzip/Brotli reporting and a compressed-size regression ceiling. The supported aggregate stylesheet is unchanged. See the limitation below.                                                                       |
| A7: Native palettes           | Added “Preset default” using `theme=native` in URL/storage. Native selection removes `data-theme` from the Lab root, copied markup, and synchronized integration fixture. Named themes, reset defaults, and the existing ecosystem inventory remain intact.                             |
| A8: Labels and spacing        | Increased header attribution and fixed-page section/eyebrow labels to 12px. Shortened header attribution while retaining the legal name elsewhere. Removed the extra bottom margin from the client-systems introduction.                                                                |
| A9: Documentation fallback    | Added `/components/reference/`, linked above the interactive guides. It renders all four guides and the actual JSX example from shared source data using native HTML, with no JavaScript dependency. Internal links respect the Pages base path.                                        |

## Stylesheet limitation

STE USK React 2.1.0 exports one aggregate stylesheet. It includes UI Style Kit's visual layer, component composition, React compatibility corrections, the interaction bridge/state layer, and Layout Style CSS. The compatibility corrections are not independently exported. Replacing the aggregate with a public preset stylesheet would omit those corrections; copying private files or deleting rules from generated CSS would create a maintenance contract this app cannot guarantee.

The next step is an upstream, supported preset-specific React stylesheet that retains those corrections. It can then be used for fixed pages while the Lab retains the full aggregate. Next.js also retains global styles across client navigation, so such a split needs navigation and cascade testing, not just an initial-load screenshot.

`npm run measure:styles` reports unique CSS files referenced by each exported route. `npm run test:styles` checks a 480 KiB gzip ceiling against the current export. This is a guard against growth, **not a claimed reduction**. Compression numbers are local estimates; they do not establish production transfer encoding, field performance, or Core Web Vitals.

The final Pages artifact references 2,596,817 raw CSS bytes per measured route,
estimated at 445,515 gzip bytes or 309,716 Brotli bytes. The package chunk itself
remains 2,488,030 raw bytes. The small increase in application CSS implements the
visible mobile tabs and static reference presentation.

## Verification

Focused checks were run individually, without the full test suite:

- Native palette URL/storage round trips, copied markup, and the unchanged named-default markup contract.
- Transparent logo dimensions and per-size budgets; scoped source assertions for the updated branding.
- Configuration disclosure keyboard behavior, repeated-copy live-region updates, visible mobile guide choices, native palette persistence/share/reset, and the early client path.
- JavaScript-disabled navigation to all four reference guides in a production export.
- Root and Pages production builds, type checking, scoped lint/format, and the Pages export contract.
- Rendered checks across 36 route/viewport combinations (320–1920px), four clean axe scans, all 20 native presets, native/named integration-fixture synchronization, and 200% text reflow at 390px. The detailed matrix is in the evidence below.

The native palette diagnostic reads the package's `--usk-native-primary` token. Shared named-theme RGB tokens are intentionally absent when no named override is applied. An initial diagnostic queried the wrong token; the package behavior was verified before correcting the diagnostic.

Browser evidence uses Chromium. Live-region DOM changes were verified; actual speech output with a screen reader was not tested. This delivery does not claim a fresh cross-browser or live-production audit.

During PR verification, the client-systems check was also run with the Pixel 7
browser profile. Its navigation assertion now opens the mobile disclosure before
querying its links, then closes it before measuring the content. The focused
mobile check passed; application navigation behavior did not require a change.

The first completed PR workflow passed 184 browser checks and exposed six checks
that failed in both desktop and mobile profiles. Five used stale expectations for
the revised headings, palette choices, or optimized logo. Those assertions now
match the authored content and retain the complete published theme inventory.
The remaining failure came from a native text input's default intrinsic width in
the layout-only fixture. The shared generator now specifies `size="12"`, allowing
the standalone field to fit narrow embedded previews without importing UI paint
or hiding overflow. A focused 180px preview check verifies the input remains
inside its parent and accepts text.

## Review artifacts

- [Phone homepage](../output/audit-improvements/home390.png)
- [Phone guide choices](../output/audit-improvements/guide-tabs-390.png)
- [Desktop guides](../output/audit-improvements/components-1440.png)
- [Native palette configuration](../output/audit-improvements/native-configuration-desktop.png)
- [Enlarged text](../output/audit-improvements/home-phone-enlarged-text.png)
- [Responsive, accessibility, and preset results](../output/audit-improvements/visual-results.json)
- [Exported stylesheet sizes](../output/audit-improvements/stylesheet-sizes.json)

Artifacts are local review output and are ignored by Git. Application comments remain JSDoc compatible. No jsdoc2md generator is configured in this repository; this scoped document records the implementation and its limits.
