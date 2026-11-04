# Unified client workbench

The Lab presents one configuration source through Appearance, Layout, Interaction,
Motion, and Export groups. The default view is the six-panel component board;
application and primitive views remain mounted so their sample data survives view
changes. Detailed developer examples mount only when their disclosure is opened
and follow the same configuration. Existing section fragments open the matching
inspector group; `#integrate` opens the integration proofs.

## Inspector behavior

Desktop editing uses a viewport-height frame below the measured site header,
with 16px top and bottom gutters. Header and viewport changes recalculate it.
The borderless activity rail, inspector boundary and divider share one height.
The inspector has one outer border and a 16px interior. Its controls and the
preview content have separate public Layout.Scroll hosts; toolbar, browser chrome
and status remain outside those hosts. Introduction and guides remain in normal
document flow. Below 1024px, or below 600px viewport height, preview content uses
page flow. Short desktop windows keep the rail; narrow windows use the Drawer.

The editor uses the installed public Layout Sidebar and Drawer components. The
packages do not publish a resize controller, so pointer capture, snapping, keyboard
handling and preference storage are site-owned composition.

- Activity rail: 48px; default expanded inspector: 320px; readable minimum: 240px.
- A half-minimum 120px pointer threshold snaps closed and reopens from the rail.
- The maximum reserves 360px for the preview, with measured safety insets; there
  is no arbitrary 480px cap. Resizing the viewport clamps display without replacing
  the remembered preference.
- Toggle-open restores the remembered width. Double-click resets to 320px.
- Arrow keys resize by 16px; Shift changes the step to 64px. Home collapses, End
  expands to the available maximum, Enter toggles, and Escape cancels a drag.
- Below 1024px, the public Drawer owns focus trapping, Escape, backdrop dismissal
  and restoration. Mobile group changes preserve desktop dimensions and visibility.
- `ste-systems:inspector:v1` stores width, visibility and group. Invalid or blocked
  storage falls back safely. Inspector preferences never enter client exports.

## Paint, motion and exports

Stable editor roots are siblings of the selected preview root, preventing a
selected preset from repainting its editing controls. All 20 layouts, seven
recipes, three densities, 20 presets and 26 schemes remain selectable. Modes,
seven wrappers, 22 primitives, hover strength, three surface levels, reflexes,
custom colors and motion remain additional controls outside the 218,400 count.

`MotionSettings.animateConfigurationChanges` defaults to false. The separate
enabled flag still controls manual playback and overlay motion; all effects and
timings default to random. Editor resizing/group navigation never animates the
preview. Reduced motion takes priority. Optional configuration effects use one
cancellation owner and commit only the newest request.

The existing four-field URLs and storage remain valid, including optional recipe
and density fields. Exports include the effective recipe and density even when
an older URL omits them. Links carry those catalog choices. Configuration JSON also
includes wrapper, interaction, primitive, motion and applied custom-variable
settings. Theme CSS/JSON exports retain their native/shared token ownership and
manual clipboard fallback.

## Site spacing and logo

Wrapper padding is at least 2px; visible control, href-anchor and text-span padding is at
least 2px vertically and 3px horizontally. Larger preset values remain in place.
Technical Blueprint receives the compact floor explicitly. Unsupported `ly-pad-3`
uses were replaced with the installed padding API. Browser chrome and inspector
interiors use 16px. Zero-step primitive padding exports its effective 2px inset.

Rendered tests exposed zero block padding in Bento and Industrial Utility, plus
flush table wrappers in five presets. Scoped site policy restores only the missing
axes/regions; no installed package is patched. The contrast review also found the
Blueprint light danger badge at 4.26:1. A scoped 90% danger/10% body-ink mix restores
AA; remove that exception when an admitted upstream version corrects it.
The public stepper has no orientation prop. A site-owned stage class removes its
horizontal fixed flex basis when composed as a vertical Layout stack, keeping
rows content-sized while allowing descriptions to wrap on phones.

Light-mode navigation places the unchanged logo artwork on `#07111f` with 6px
padding, retaining its proportions and leaving adjacent brand text on the header.

Workspace navigation links use 8px vertical and 12px horizontal padding with 44px
minimum targets. Prose links retain inline flow. Local workspace fragments scroll
and focus their destination inside a bounded preview without moving the editor.
The published inline-link reset is handled separately in its own cascade layer.

## Application recipe composition

Application sample state stays in CombinedWorkbench. Reusable overview, KPI,
design-system, activity and configuration sections adapt to the selected recipe.
Card-grid and Gallery place header/navigation above five real content cards and
the footer below. Structured recipes retain canonical recipe areas; List-detail
and Split-hero group header/navigation with primary content and keep configuration
in the supporting region. Public Cards, Layout.Grid/Recipe/Surface/Header/Footer,
Button, Badge, ProgressBar and Text own the component implementation.

Narrative grid tracks reserve 22rem plus the public card margins. Compact metrics
remain separate. A prepaint fit guard first evaluates the public automatic recipe,
then selects its documented manual stacked mode if main is below the smaller of
28rem and available width, or the recipe overflows. Width and configuration changes
re-probe; height-only notifications do not. Scrollbar gutters remain stable. The
scoped public shell-min token removes inherited full-page height. Frame and fit
state never enter client exports. Changing views resets preview scrolling; ordinary
configuration edits preserve it.

Tooltip fitting selects a public placement inside the preview scrollport before
paint. Library positioning and ARIA stay intact; native modal top-layer behavior
escapes the scroll boundary. Existing entrance/exit motion is retained.

## Verification and delivery

The accumulated pre-commit integration review is recorded in
[lab-pr-readiness.md](lab-pr-readiness.md), including Pages asset-path repairs,
fixture landmark names, final spacing corrections and the native rendered replay.

Focused cases live in `tests/inspector-state.test.ts`, `tests/motion-settings.test.ts`,
`tests/browser/workbench.spec.ts`, `tests/browser/site-spacing.spec.ts`, and the
updated motion/route cases. Run individual cases rather than a full suite. The
spacing sweep covers all 20 presets, both native and named schemes, and all three
modes; this is not exhaustive testing of 218,400 combinations.
The additional frame correction is documented in
[workbench-frame-correction.md](workbench-frame-correction.md), including focused
geometry, anchor, overlay and responsive checks and the separate final native gate.

Retain the composition audit and record with actual rendered evidence. Gnomie
Browser Commander's native browser check passed on 2026-11-04: pointer resizing,
snapping closed, restoring the remembered width, and light-mode logo inspection.
That initial logo-only check used a static fixture and did not prove homepage
interaction or complete light-mode contrast. The follow-up
[homepage presentation review](home-presentation-review.md) replaces it with the
live `/?site-mode=light` page and separately verifies its menu, number, card
geometry, text contrast and footer logo. Earlier profile/focus failures remain
in the local activity journal.
Local, CI, commit, publication and deployment proof stay separate.

This repository has no jsdoc2md generation command. Changed reusable APIs carry
JSDoc-compatible comments; no generator or shared-library release is introduced.
