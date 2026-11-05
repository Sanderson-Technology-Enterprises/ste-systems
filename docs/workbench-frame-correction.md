# Lab frame and recipe correction

The supplied desktop failure put five application shell regions into equal card
columns. Main measured about 259px wide and 2,000px high. An inner inspector border
also began 8px below the activity rail. Plain workspace anchors had roughly 30px
targets and the published inline-link reset removed their vertical clearance.

The corrected desktop frame measures the header, aligns the borderless rail,
single inspector boundary and divider, and separates control/content scrolling.
It retains all resize, snap, restore, keyboard and persistence contracts. Narrow
and short screens return preview content to normal page flow. Intro and guides
remain accessible outside the editor frame.

Application recipes now compose reusable content sections rather than five shell
columns. Public sizing tokens reserve readable cards; structured recipes use a
prepaint automatic-to-manual fit guard. Fit and frame measurements are internal
presentation state. No configuration, URL, storage or export schema changed.

## Focused evidence

Each browser case is invoked individually against the real local Lab.

- `workbench-frame.spec.ts`: measured frame height, aligned edges, border ownership,
  separate scrolling and fixed preview toolbar.
- `workbench-recipes.spec.ts`: original 1920px failure, five readable cards, retained
  actions/save state, constrained stacking and automatic recovery at wider widths.
- `workbench-geometry.spec.ts`: seven recipes × twenty personalities at 1920px and
  1280px; page-flow/Drawer at 320, 390, 768, 1023px, desktop at 1024, 1440, 1920px,
  500px-height fallback, preferences and scroll/sample retention.
- `workbench-links.spec.ts`: real text-range clearance, 44px targets, fragment focus
  and preview scrolling, five representative presets, three modes and densities,
  focused/hovered contrast, inline prose flow and homepage anchor floors.
- `workbench-overlays.spec.ts`: tooltip at the upper scroll boundary, native modal
  top-layer visibility, dismissal and restored focus with reduced motion.
- Existing focused inspector divider case: pointer drag, snap in/out, 240/320px,
  remembered width, Escape cancellation, reload and mobile/desktop restoration.
- Existing blocked-storage/touch case: maximum expansion and 360px preview reserve.
- Extended spacing sweep: twenty presets, native/named palettes and all three modes,
  including visible anchors with href.

The recipe sweep caught public 2px card margins reducing a 22rem track's card width.
The public grid minimum now reserves those margins. Overlay checks caught a tooltip
clipped above the preview; the adapter now selects a fitting public placement
before paint. These are scoped site compositions; installed packages are unchanged.

## Final gates

Production build, lint and type checking passed. The ownership audit passed across
42 files with zero unapproved, obsolete, unresolved or stale findings. Production
recipe geometry and the final tooltip/modal and focused-hover contrast checks
passed. Final Prettier, type checking, changed-file lint and `git diff --check`
passed after documentation and evidence updates. The composition-record checker
passes with the final Gnomie proof included.

Production-font screenshots are retained at `output/workbench-frame-1920.png`,
`output/workbench-frame-1440-stacked.png`, `output/workbench-frame-mobile.png` and
`output/workbench-frame-mobile-drawer.png`. Runtime capture reports no page errors.
The final content remains reachable at 240px, 320px and maximum inspector widths.

The final Gnomie rendered/manual replay passed on 2026-11-04, 19:37–19:40 UTC,
after the user restored task Chrome 657166. The current production page was
hard-reloaded before inspection. Native screenshots verified the aligned frame,
borderless rail, readable cards, 320-to-480px resize, snap collapse and remembered
restore. Workspace fragments focused their destination inside the preview. Both
scroll areas reached their final content while toolbar, chrome and status stayed
visible. At a 975px window width, the public Drawer opened, changed groups and
dismissed with Escape, restoring visible focus to Open settings. The tablet site
menu also opened and closed. Returning to desktop retained the 480px preference;
double-click reset it to 320px. No source changes were needed after inspection.

Earlier busy-profile and `FOCUS_CHANGED` failures remain in
`.tmp/frame-gnomie-activity.jsonl`; the profile lock was not bypassed. The final
report is `.tmp/frame-gnomie-report.md`, and native screenshots remain in the task
transcript. The composition record clears this correction's outstanding gate.

The subsequent PR handoff and its focused integration corrections are recorded in
[lab-pr-readiness.md](lab-pr-readiness.md). That later request authorizes commit,
push and PR preparation; it does not authorize merging or deployment.

No shared-library release, upgrade or new application visual asset was introduced.
The repository has no jsdoc2md generation script. Reusable source APIs carry
JSDoc-compatible comments without adding a generator dependency.
