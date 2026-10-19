# Three-site website roadmap implementation

Implemented locally on October 19, 2026 in `site`, `customized-platforms`, and
`ste-systems`. The supplied roadmap and three app plans define the work; their
embedded workflow suggestions are not separate authorization to publish.
This record describes the local implementation checkpoint. Subsequent publication,
merge and deployment evidence belongs to the associated pull requests and deployment records.

## What changed

| Site                 | Completed work                                                                                                                                                                                                                                                                                                                                  | Changed public routes                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Main company         | Shorter opening message, representative product screen, proof-first page order, customer fit, shared engagement stages, Workflow Review boundaries, founder attribution, monetary budgets, legacy creator context, repaired proof links, transcript link, muted automatic video previews, inquiry concurrency guard and honest timeout recovery | `/`, `/about.html`, `/salvage-yard-system.html`, `/content-creator-platform.html`, and the three legal pages' shared Lab links |
| Customized Platforms | Real inventory screen, consistent evidence/status cards, customer fit, three-stage engagement, founder link, scoped technical claims, task summaries, optional qualification fields and editable service/project context                                                                                                                        | `/`, `/work`, all three `/work/*` case studies, `/contact`, service-detail CTAs, and the shared footer                         |
| STE Systems          | Manifest-derived counting explanation, practical purpose, Lab directions, adoption comparison and accurate public-package/private-source distinction                                                                                                                                                                                            | `/`, `/lab/`; links to existing `/components/#atlas-react`                                                                     |

The three sites retain their own installed library versions, source assets,
stylesheet boundaries, routes, and deployment setup. No dependencies, backend,
tracking destination, private repository visibility, or customer configuration
were changed. Customized Platforms' configured JSDoc and responsive-image
generators were used. The other two sites have no jsdoc2md generator configured;
new helpers/components carry compatible source comments.

## Stable technical destinations

- `https://stesystems.com/#configuration-reference` is the new canonical count
  explanation. Its factors and headline share `COMBINATION_FACTORS` from the
  installed manifests: layouts × recipes × densities × presets × (shared themes
  - native scheme). Display modes are excluded. This anchor exists in the local
    exports and becomes public only after release.
- `https://stesystems.com/components/#atlas-react` is the existing public React
  overview for the main company's CTA. It does not invite readers into private
  source. Anonymous registry inspection confirmed STE USK React 2.1.0 is publicly
  distributed; that does not make the source repository public.
- Customized Platforms retains its accurately scoped, pinned 70,000 inventory
  only in technical context. Commercial hero and proof cards no longer carry
  conflicting-looking totals or count-bearing artwork. Its new reference link
  should be released after, or together with, the Systems anchor.

## Verification record

Checks were run individually or through the affected build/contract command.
The complete test suites and aggregate `quality`/`verify` scripts were not run,
following the user's explicit scoped-testing instruction.

Final formatting checks pass for authored changes in all three repositories.
Customized Platforms lint and Systems scoped lint pass; the static company site
has no configured lint runner, and its changed JavaScript passes syntax checks.
Customized Platforms generated-JSDoc drift checks and all three `git diff
--check` inspections pass.

| Area                | Evidence and result                                                                                                                                                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main structure      | `node tests/site-smoke.mjs` passes for local assets, media metadata, canonical/structured data, routes and page contracts. Focused brand, package-stack, narrative, ecosystem and inquiry-mapping tests pass.                                                                                                                           |
| Main inquiry        | Mocked Edge checks pass for successful submission and scheduling, invalid focus, legacy preselection, monetary budget values, failed delivery with retained input, duplicate attempts, and uncertain timeout without automatic retry. No real inquiry was sent.                                                                         |
| Main media          | Edge verifies muted automatic playback, offscreen pause, one active player and preserved manual volume. The salvage commercial has the same SHA-256 in both repositories, establishing that its linked existing transcript applies. Other different masters were not assigned that transcript.                                          |
| Customized form     | Focused tests pass for optional bounded qualification, consent/message requirements, allowlisted editable context, validation focus, duplicate prevention, retained failure/timeout input and one-time analytics events. The backend contract was inspected; no backend change was needed.                                              |
| Customized build    | TypeScript and `build:seo` pass; all 15 public routes are prerendered with metadata, structured data, sitemap and 404 output. CSS is 59.39 KiB gzip, under the existing 80 KiB ceiling. Asset and library-integration contracts pass.                                                                                                   |
| Customized browsers | Engagement fragment/route-focus checks pass in Chromium, Firefox and WebKit. Narrow form/keyboard-consent checks pass in Firefox and WebKit. Local Opera manual review follows the marketplace CTA, observes its preselected category, changes it to Dashboard, and confirms visible keyboard focus.                                    |
| Systems facts       | The focused factor test verifies real manifest-derived factors and excluded display modes, rather than asserting a hard-coded headline.                                                                                                                                                                                                 |
| Systems exports     | Root and `/ste-systems` Pages production builds pass, including TypeScript. Export verification passes for base paths, metadata and resources. The route stylesheet-budget check passes.                                                                                                                                                |
| Systems interaction | Root-export guide fragments/keyboard panels and Lab configuration/pressed state/clipboard checks pass. The Pages export passes the four-tab/two-Lab-link navigation check.                                                                                                                                                              |
| Responsive review   | 78 route/viewport combinations across company home/About/products, commercial home/service/case studies/contact, and Systems home/Lab/React guide: 360×800, 390×844, 768×1024, 1366×768, 844×390, and 683×384. No page overflow, missing non-lazy images or page JavaScript errors observed. Desktop/phone captures visually inspected. |

The 683×384 viewport models the CSS space of 1366×768 at 200% zoom. A separate
native browser-zoom capture timed out, so native 200% zoom is **not verified**.
Reduced-motion preference was enabled for the responsive review. This is scoped
browser evidence, not screen-reader certification or proof of every possible
configuration. Browser Use cloud inspection is inapplicable to unpublished
localhost changes; no tunnel or public deployment was created to obtain it.

## Signed-out destinations

Anonymous checks returned HTTP 200 for the three public sites, relevant product
and guide routes, and public CSS repositories, documentation and demos.
Three npm website pages returned a bot challenge (403); website rendering there
remains unverified rather than being labeled a broken package. The React 2.1.0
registry entry returned 200. Local report files contain exact URLs/statuses.
The added salvage commercial transcript also returned 200 with its narration.

## Debugging and documentation alignment

- Repaired obsolete Lab/private-source invitations at their authored hrefs.
- The main inquiry race was reproduced as two POSTs from concurrent submissions.
  Its first divergence was awaiting origin verification before locking the form.
  `initContactForm` now holds one attempt through verification, delivery and
  recovery, with the existing `finally` releasing the guard. Its focused test
  passes with one POST.
- The timeout branch previously omitted delivery uncertainty. Its focused test
  now verifies clear uncertainty, retained content and no automatic resend.
- The media helper explicitly unmuted automatic playback. Both the request and
  play-event boundaries now keep it muted; manual volume remains controllable.
- Generated documentation reflects the optional-field/context helper contract.
  The shared API schema is unchanged; frontend validation now conforms to its
  already-optional fields. No API-version migration or Notion sync applies.

## Review artifacts

Open `output/roadmap/index.html` for before/after desktop and phone captures.
`responsive-review.json` records geometry and console observations;
`signed-out-links.json` records anonymous destination checks. These are local
review artifacts, not deployed pages. Per-site notes are in
`site/docs/website-roadmap-2026-10-19.md` and
`customized-platforms/docs/qa/website-roadmap-2026-10-19.md` in sibling checkouts.

## Business evidence held separately

- A named customer story needs current deployment confirmation, permission to
  identify the business, approved screenshots and a supported result or actual
  approved quotation. No MS Auto claim or placeholder has been published.
- Workflow Review deliverables, prices, turnaround and support availability need
  an agreed business commitment before becoming promises. Current copy describes
  discussion outcomes and separately scoped paid work.
- A later 60–90-second task recording has a brief in the commercial site's notes;
  no new recording is claimed. Existing supplied media/captions remain intact.
- Analytics remains on the existing local queue unless an approved destination
  is configured. Use the existing private received/qualified/consultation-held/
  proposal review process. No lead-quality, inbox-delivery or conversion gain is
  inferred from a successful browser request.
- Prospect comprehension feedback and post-release public/inbox verification
  require their respective real participants or designated test workflow.
