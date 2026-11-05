# Motion showcase and configuration transitions

The STE Systems Motion Lab (`/lab/#motion`) and its embedded guide
(`/components/#atlas-motion`) render the same six-panel component workspace.
The supplied references informed component variety and density. Their artwork,
branding, and sample copy were not added to the site.

## Component and ownership decisions

| Need                 | Verified owner and public hook                                                                                                         | Implementation                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Responsive specimens | Layout Style CSS 3.2.3 through STE USK React 2.3.0 layout adapters                                                                     | All 20 personalities, seven recipes, three densities, seven wrapper sizes, and 22 primitives; intrinsic specimen grid reflows in narrow guide contexts |
| Appearance           | UI Style Kit CSS 2.7.1 through `InterfaceRoot`                                                                                         | All 20 presets, 25 named palettes plus native schemes, and light/dark/high-contrast modes; explicit scope prevents outer palette inheritance           |
| Working specimens    | STE USK React `Button`, `Card`, `Form`, `Badge`, `Alert`, `Table`, `Slider`, `ProgressBar`, `Stepper`, `SegmentedControl`, and `Modal` | Local form updates, filter/empty state, progress changes, pressed/loading/disabled examples, and keyboard-accessible confirmation                      |
| Interaction depth    | Interactive Surface CSS 1.7.3 through `surfaceLevel`, public motion tokens and `data-surface-feedback`                                 | Three elevation levels; none/subtle/balanced/strong hover intensity; success, error, and attention reflexes                                            |
| Lifecycle effects    | Motion Style CSS 1.0.0 `enter`, `exit`, `stagger`, and `cancel`                                                                        | Dedicated workspace/panel shells; global configuration paints swap between exit and entrance                                                           |

The shared React stylesheet and motion stylesheet remain imported once at
`app/layout.tsx`. Browser chrome, containment, and specimen margin resets are the
only new local CSS. Component paint, control geometry, and interaction states
remain library-owned. The composition record reports the final local CSS byte count.

## Client configuration and exports

Every counted factor comes from the installed catalogs: 20 personalities × seven
recipes × three densities × 20 presets × (25 named themes + one native scheme) =
218,400. The preview exposes every factor independently. The count describes the
selectable inventory; it does not claim exhaustive browser or accessibility testing
of every product of those choices. Modes, wrappers, primitives, custom colors,
hover intensity, and motion settings are additional controls outside the count.

Recipes use canonical named areas and actual library geometry. Main Lab recipe
and density choices also apply to the workbench and round-trip through query
parameters and the existing configuration storage. Previously saved four-field
configurations remain valid. The primitive explorer exposes every installed
primitive, common gap/padding/alignment/distribution controls, grid columns, frame
ratios, and scroll limits. Its copy action exports the rendered library markup.

The color editor reads concrete RGB tokens from the active preview. Named schemes
use the 23 shared color roles; native schemes retain the preset's own public RGB
and material roles. Invalid hex values disable apply/copy. JSON includes the theme
name, preset, scheme, mode, and real CSS variables; CSS exports the same variables
in `.client-custom-theme`. Apply that class to the matching themed root after the
library styles. The manual output switches to the requested format even if browser
clipboard permission is unavailable. Custom palettes and motion overrides are
session-local and are not included in configuration URLs or persisted across reloads.

The modal adapter retains the public native dialog until its selected exit ends;
the library still owns focus trapping, Escape, backdrop dismissal, and focus
restoration. Tooltip positioning and ARIA remain library-owned; a dedicated
content shell uses the public React Motion presence adapter for reversible
entrance and exit. These overlays use the shared motion settings, including
random defaults, fixed overrides, off, and reduced motion.

## Automatic motion

The application-level `MotionPreferences` provider shares settings between the
unified workbench and its embedded component guide.
Overrides last for the current app session and are not written to browser storage.
Reloading restores enabled, randomized playback/overlay defaults with configuration animation disabled.

When explicitly enabled, changing layout, recipe, density, visual style, palette,
or mode runs an exit and entrance around the preview content shell. The editor,
inspector and navigation remain outside that shell. The embedded guide follows the
same opt-in policy. Automatic effects never run during initial
hydration, and reduced-motion preference or the off switch applies changes
directly.

| Setting           | Random default per change                              | Fixed override            |
| ----------------- | ------------------------------------------------------ | ------------------------- |
| Entrance and exit | Independently selected from all ten installed presets  | Separate effect selectors |
| Direction         | Left, right, up, or down                               | Direction selector        |
| Easing            | Ease, ease-in-out, ease-out, or linear                 | Easing selector           |
| Duration          | 200–700ms, in 50ms steps, independently for each phase | 200–1200ms slider         |
| Delay             | 0–150ms, in 25ms steps, independently for each phase   | 0–300ms slider            |
| Stagger interval  | 30–120ms, in 10ms steps                                | 0–200ms slider            |

Each timing slider has its own Random checkbox, enabled by default. Turn it off
to use the slider. Random bounds keep automatic changes brief, while fixed
overrides allow slower inspection. Interval controls coordinated panel playback;
an atomic whole-workspace configuration swap has no repeated-item interval.

The transition runner cancels prior owners and commits only the newest requested
configuration. A cancelled phase cannot discard that newest choice. Explicit
manual playback interrupts automatic work, applies the latest pending appearance,
then uses the current motion settings. Reset reveals all exited panels. Cleanup
cancels owned work on unmount. Modal focus behavior remains owned by the shared
Modal component.

## Verification and delivery boundary

Focused coverage lives in `tests/motion-settings.test.ts`, `tests/playground-options.test.ts`,
the recipe/density case in `tests/configuration.test.ts`, `tests/browser/client-playground.spec.ts`,
`tests/browser/configuration-motion.spec.ts`, `tests/browser/motion-showcase.spec.ts`,
and the affected cases in `tests/browser/motion.spec.ts`. Run individual cases
with `--test-name-pattern` or `--grep`; a full suite is unnecessary for this change.

The composition record is `motion-showcase-composition.json`; the reproducible
ownership audit configuration is `motion-showcase-audit.json`. Production screenshots
are local ignored output under `output/client-playground-*.png`. Element screenshots
exclude fixed site navigation and Next.js development chrome to show the complete
specimen without screenshot-stitching overlays.

The local Gnomie browser profile was busy and the in-app browser unavailable;
the repository's Playwright runner supplied rendered and interaction evidence.
Cloud browser/native desktop checks and live deployment are outside this local
verification. No remote CI, publication, push, or deployment is implied.

This repository has no jsdoc2md generation command. Changed APIs carry
JSDoc-compatible source comments; no generated public package API changed.
