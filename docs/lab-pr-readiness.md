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

## Rendered CI follow-up

The next integration run passed all 73 unit tests, fixture/brand checks, development
hydration, production export and 12 export contracts. Its browser phase exposed
stale disclosure, target and keyboard-modality assumptions, plus two real defects:
unannounced workbench configuration changes and narrow fixture headings that
overflowed their text area. The centralized configuration callback now announces
all six counted configuration fields. Fixture headings wrap naturally and use
language-aware hyphenation without clipping or shrinking type.

Loading all nine lazy fixture documents before Axe also exposed WebKit's white
text on native silver buttons in UI-only proofs. The shared buttons now compose
the public `usk-button` primary/secondary variants with `interactive-surface`.
No custom paint replaces a package owner; unloaded hooks remain inert. The
ownership truth table and canonical hover/focus/geometry contracts still pass.

Browser cases now disclose their destination after every reload, use the real
UI-only pill target, and establish keyboard modality before checking
`:focus-visible`. The legacy-anchor case starts with a cold bookmark, then checks
hydrated same-document fragments; history tracing confirmed that the previous
test navigated again before Next's initial router hydration completed. The preset
matrix is split into five independently timed cases, retaining all three modes,
five viewport widths and Axe assertions. No accessibility rule or case is skipped.

Focused replays passed individually, including all originally failed cases,
the split preset matrices, strict fixture overflow and default WebKit Axe after
all nine frame documents loaded. Final formatting, lint, type checking, ownership
records and production builds are verified before the follow-up commit. Remote
CI must still be checked against that commit; this is not a green-CI claim.

Gnomie Browser Commander repeated native Chrome review on the refreshed Pages
preview at 23:55–23:58 UTC on 2026-11-04. Cold `#layouts` opened Layout;
application cards remained readable while expanding, snapping closed and dragging
outward to reopen the inspector. The isolated UI-only proof showed readable
primary and secondary buttons. Screenshots and the local activity journal retain
the observations; the managed profile lock was not bypassed. The earlier complete
manual review remains evidence for unchanged Drawer, overlay and guide flows.

## Local hover-test correction

A complete local verification run exercised all 310 browser cases and exposed one
desktop hover-test failure. The strong/subtle intensity tokens were correct, but
document smooth scrolling continued after Playwright positioned the pointer,
moving the button away and clearing `:hover`. Instant centering alone did not
prevent Playwright's subsequent hover scroll from continuing.

That case now uses instant document scrolling in its own browser page. Surface
transitions and feedback animations remain enabled. Both lift assertions also
require the button to match `:hover`, preserving the exact -8px and -2px values
and the existing real-reflex-animation checks. Application code, package versions,
and production scrolling behavior are unchanged. A fresh full local verification
loop is required on this test/documentation change before committing.
