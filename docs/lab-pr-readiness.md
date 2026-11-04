# Lab pull-request handoff

This handoff includes the accumulated workbench, motion showcase, start/install,
homepage, spacing and responsive-composition corrections. The implementation uses
the installed public STE React adapters and four CSS libraries; no shared-library
release or deployment is part of the handoff.

## Integration findings resolved before commit

- Client-mounted examples used the server-only base-path variable. Pages fixtures
  therefore requested root URLs and returned 404 after opening their disclosure.
  `withBasePath` now prefers the build-inlined public variable, preserves explicit
  overrides and the Node fallback, and has a focused regression test.
- Embedded fixture main/region landmarks lacked unique names. Generated fixture
  markup now supplies them; the expanded full-page accessibility check passes.
- Normal Lab fragments still used the previous assumed header height. They now
  share measured header clearance. WebKit and native menu-to-Guides replays passed.
- Branded anchors retained 2px horizontal padding, and the neutral application
  Stack defaulted to zero padding. The brand observes the 3px inline floor; the
  Stack/Recipe use public zero-step padding with the reviewed 2px safety clamp.
  The application/primitive sweep across all presets and the recipe geometry
  matrix passed after these changes.

Tests now target the final public UI contract: disclosures mount before querying
their content, docked cases establish their starting viewport, compact paths use
the real Drawer, card recipes inspect the actual content grid, and short windows
verify normal-flow access. Hover tests respect device capabilities and settle
scroll position. No tests are disabled to obtain a pass.

## Local verification

- Clean locked install in an ignored temporary directory: 355 packages; installed
  direct pins verified. STE package versions remain unchanged. Earlier install
  repairs retain Next/eslint-config-next 16.4.5 and Sharp 0.35.5.
- Fourteen focused unit cases, eighteen artifact/fixture/brand/style contracts,
  and sixty selected browser cases passed through individual sequential commands.
  Passing cases were retained; failures stopped the chain for focused diagnosis.
- The seven-recipe/twenty-personality matrix passed at wide and constrained widths
  after the wrapper correction. Viewport, maximum inspector expansion, final
  content access, cancellation, storage denial, exports, motion phases, overlays,
  contrast and text-clearance checks passed.
- Both normal and Pages production exports generated all ten routes. Development
  hydration passed through the repository command without diagnostics.
- WebKit's sticky-header/anchor replay passed. Local Firefox failed creating a
  blank page before visiting the app; a minimal application-independent probe
  reproduced the runtime failure. The unchanged PR workflow supplies the Linux
  Firefox check; local Chromium results are not represented as Firefox proof.

Gnomie Browser Commander reviewed the final production Pages build in native
Chrome on 2026-11-04, 20:43–20:47 UTC. It verified readable application reflow,
resize/snap/restore, menu-to-Guides focus and clearance, a healthy opened canonical
fixture, light-mode logo/count/copy, compact page flow, Drawer opening, Escape and
focus restoration. The task transcript retains native screenshots; ignored local
journals retain the action record. No credentials or external messages were used.

The repository has no jsdoc2md generation command. Reusable APIs retain
JSDoc-compatible comments, and applicable documentation/composition records are
updated without introducing a generator dependency.

Remote commit, PR checks and merge readiness must be verified against the pushed
SHA separately. This record does not claim deployment or a merge.

## Remote integration contract follow-up

The first runnable integration job passed formatting, lint and type checking, then
found four source-contract assertions that still described the previous Lab. Those
assertions now require the stable editor provider, public density props on their
owning roots, the single workbench, retained resource landmarks and the concise
Guides menu. Each affected case passed individually; no test was disabled and no
application code or styling changed. Existing rendered legacy-anchor coverage
continues to verify inspector routing and the integration disclosure.

The organization-controlled Actions policy initially rejected the workflow. The
user approved its four exact action pins and separately approved the sole nested
upload-artifact pin. Readback verified all five additions while retaining existing
entries and both broad-action restrictions. Verification runs on the feature
branch preserve the independently verified main-only deployment guards.
