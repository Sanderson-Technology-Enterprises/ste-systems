# Website template entry journey

The homepage and studio offer six website types before advanced configuration. Cards render the same isolated components used by the live preview, comparison, local image capture, and printed brief. Visual style, palettes, spacing, icons, and animation remain independent of website type.

| Saved ID     | Website type               | Screens                       | Starting arrangement / width |
| ------------ | -------------------------- | ----------------------------- | ---------------------------- |
| `business`   | Marketing site             | Home, inquiry                 | Split hero / Content         |
| `storefront` | E-commerce store           | Catalog, product, cart        | Card grid / Wide             |
| `newsletter` | Newsletter                 | Subscription, archive, issue  | Split hero / Content         |
| `blog`       | Blog                       | Stories, article              | Docs / Content               |
| `industrial` | Industrial dashboard / PLC | Overview, operator, alarms    | Dashboard / Workspace        |
| `inventory`  | Inventory management       | Stock, item, movement history | App shell / Workspace        |

## Entry and persistence

`/lab/?choose=type` opens the chooser. A new visitor selects a type before the first autosave. Returning clients can continue their saved plan. Change website type opens the chooser in place of the editor; selecting a type atomically updates scenario, opening screen, arrangement, and width. It preserves project copy, styling, consultation notes, and independent alternatives. Fresh plans receive template-specific copy.

`/lab/?template=<id>` applies a validated type once and removes the parameter. Existing visual-direction links and legacy configuration URLs take restoration priority. Invalid template IDs leave the saved draft intact. Legacy reference fragments still open the editor and retained technical guides. Booking, portal, component, and primitive examples are available under **More examples and advanced previews**.

Start over defers resetting the document until a template is selected. Continue your saved plan cancels that choice. Template selection, including a committed start over, can be undone in the session.

The design schema remains version 1. Renderer version 2 adds the template catalog; renderer 1 documents migrate explicitly with a notice and preserve their supported choices. Unsupported versions fail validation before replacing the draft. Complete files retain private project context; compressed visual links omit it.

## Local sample behavior

- Marketing validates an inquiry and opens a sample confirmation without sending a message.
- E-commerce searches and filters products, opens details, edits quantities, removes cart items, and reviews a sample order without purchasing anything.
- Newsletter validates email, reports a local subscription demonstration, and opens archived issues without subscribing or sending email.
- Blog filters stories and opens readable articles, author information, and related stories.
- Industrial provides fixed metrics and trends, simulated start/stop and bounded setpoints, interlock presentation, alarm filtering, acknowledgement, and reset. It never connects to equipment.
- Inventory filters stock, opens item locations, validates signed adjustments, and records movements in a local sample ledger. It never changes real stock.

Transaction and simulation state belongs to each mounted preview, outside the durable design document. Reloading or replacing the preview resets it. Independent comparison frames receive identical current copy, scenario, screen, and viewport plus the respective saved visual design.

## Rendering boundaries

`next.config.ts` disables the Next.js development indicator, removing the corner N from the editor and embedded pages while keeping normal error reporting. Preview messages validate origin, source, channel, and protocol version. The idempotent hello handshake retries until the child and parent listeners are ready, including when thumbnail frames hydrate first.

Desktop, tablet, and phone controls set actual 1280, 768, and 390 pixel frame widths. Template thumbnails render at 960 by 640 and scale inside inert, decorative frames. Style specimens retain their separate 480 by 320 mode. Public STE React components own semantics and composition; the installed libraries retain their paint, interaction, elevation, and motion responsibilities.

## Documentation and focused verification

Run `npm run docs:generate` after changing public contracts and `npm run docs:check` to check deterministic granular output. The generator includes the catalog, update helper, chooser, frame boundary, and each focused template renderer.

Behavior checks live in `tests/website-templates.test.ts` and `tests/dev-browser/template-*.spec.ts` / `website-flows.spec.ts`. Run one named behavior at a time using the development browser configuration. Retain unaffected green results. Existing studio journey checks use explicit template entry for fresh drafts, while legacy reference checks retain their original URLs.

Verification is local. Remote CI, publication, and deployment require separate evidence and are not implied by a successful local build or browser check.

### Local acceptance record — November 10, 2026

Focused checks passed for the six sample journeys; file/link round trips and renderer migration; chooser, resume, type change and undo; deferred autosave; invalid-file recovery and private-note exclusion; storage write failure; thumbnail handshake recovery and development indicator removal; phone rows, keyboard focus and fullscreen; frozen industrial handoff; retained booking and portal examples; all three elevation levels, 17 motion presets, cancellation, and reduced motion.

Gnomie Browser Commander inspected the actual desktop homepage, studio, industrial/inventory compositions, and phone chooser. The final inspected navigation reported zero console errors or warnings. Local Chrome checked every starter and its rendered thumbnail at root and GitHub Pages paths, plus all six templates at actual desktop, tablet, and phone viewports, with no failed asset requests or frame overflow.

Root and Pages production builds, export resource checks, fixture determinism, formatting, lint, TypeScript, generated-doc drift, and the 63-file composition audit passed locally. No entire test suite was launched. Git and the pull request record source delivery separately from these local results; publication and deployment require their own evidence.
