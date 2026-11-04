# Homepage presentation corrections

This review addresses the supplied 2026-11-04 screenshots, preserving the existing
Lab implementation and installed package versions. Changes remain local.

## Causes and repairs

- **H1 — inert tablet menu:** the earlier `qa-logo-light.html` was a logo-only
  snapshot with scripts removed. Its hamburger and orbit controls could not
  hydrate. The live homepage now accepts `?site-mode=light`, `dark`, or `contrast`
  through the public `InterfaceRoot`. It keeps real client interactions and does
  not consume Lab configuration storage. Existing `?mode=...` Lab redirects remain
  intact. The obsolete local fixture redirects to the live light-mode page.
- **H2 — wrapped count:** a 30% circle combined with viewport-sized type and
  arbitrary word breaking split `218,400`. The circle now has a readable inset,
  stage-relative type, and a single-line numeral. Tests measure actual text ranges
  at 320–1920px rather than assuming that declared dimensions fit.
- **H3 — invisible text:** fixed dark orbit surfaces inherited light-mode ink,
  while a transparent core gradient exposed the pale page underneath. The orbit
  artwork now pairs opaque navy surfaces with light ink; the resource card uses
  the selected theme's surface and text roles. Accessible link ink replaces
  decorative gold for small labels and highlighted homepage copy. The count
  exceeds 7:1 contrast against every gradient stop; its caption exceeds 4.5:1.
- **H4 — compressed comparison cards:** the Bento layout's small intrinsic grid
  minimum admitted four roughly 196px cards at the reported tablet width. The
  public `--ly-grid-min` hook is now 20rem for this comparison, yielding two roomy
  columns there. Public Stack utilities arrange equal-width actions with complete
  labels. Package identifiers can wrap; title words and button labels stay intact.
- **H5 — footer artwork:** the same silver logo lacked the navigation backing in
  the footer. Its light-mode backing now uses the same navy and 6px inset, while
  retaining the original 128×96px rendered image and separate brand text.

## Verification boundary

Focused tests are in `tests/browser/home-presentation.spec.ts`. They cover live
tablet navigation, Escape/focus restoration, orbit selection, legacy URLs, actual
count geometry, intrinsic card widths, complete action labels, all three modes'
contrast, hover, gradient-stop contrast, footer logo geometry and containment.

Use the real homepage for native Gnomie visual/manual checks, including tablet
menu interaction, number/caption legibility, the two-column comparison, action
labels and footer artwork. Keep screenshot and manual outcomes separate from
automated assertions. The composition record tracks the actual result.

Gnomie's native Chrome replay passed on 2026-11-04 at 17:36–17:37 UTC in a
975px-wide tablet window. The settled page showed the unwrapped count and readable
copy; a native hamburger click opened the menu, and selecting Packages closed it
and navigated to the two-column comparison. Full-width, single-line actions and
the padded footer logo were visually verified. Native screenshots are retained
in the task transcript, with action timestamps in the local activity journal.

Browser Use's cloud surface cannot reach this localhost-only change; no public
deployment is authorized. Gnomie native tools own the requested local Windows
check. No video, remote API contract, package release or Notion sync is in scope.
There is no jsdoc2md generator in this repository; changed reusable APIs have
JSDoc-compatible comments. Existing orbit keyframes and reduced-motion fallbacks
are retained; this patch does not migrate the illustration's animation system.
