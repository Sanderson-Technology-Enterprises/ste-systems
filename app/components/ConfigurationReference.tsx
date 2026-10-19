import {
  COMBINATION_FACTORS as factors,
  SUPPORTED_COMBINATIONS_LABEL,
} from "../data/atlas";
import { ECOSYSTEM_PACKAGES } from "../data/ecosystem";

/** Publishes the count scope from the same manifest factors used by the total. */
export function ConfigurationReference() {
  return (
    <section
      id="configuration-reference"
      className="section-band ly-section"
      aria-labelledby="configuration-reference-title"
    >
      <div className="ly-wrapper ly-stack ly-gap-6">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">Technical reference</p>
          <h2 id="configuration-reference-title">
            How this count is calculated
          </h2>
          <p>
            {SUPPORTED_COMBINATIONS_LABEL} combinations describe the choices
            supported by this showcase’s installed libraries.
          </p>
        </div>
        <p className="ly-stack ly-gap-2">
          <strong>
            {factors.layouts} layouts × {factors.recipes} recipes ×{" "}
            {factors.densities} spacing densities × {factors.presets} visual
            presets × ({factors.sharedThemes} shared themes +{" "}
            {factors.nativeSchemesPerPreset} native scheme per preset) ={" "}
            {SUPPORTED_COMBINATIONS_LABEL}.
          </strong>
          <span>
            Light, dark, and high-contrast display modes are excluded. A
            narrower count that omits spacing densities and native schemes will
            differ, even with the same layout and preset inventory.
          </span>
        </p>
        <div className="ly-stack ly-gap-3">
          <h3>Versions used by this showcase</h3>
          <ul>
            {ECOSYSTEM_PACKAGES.map((pkg) => (
              <li key={pkg.name}>
                <code>
                  {pkg.name}@{pkg.version}
                </code>
              </li>
            ))}
          </ul>
          <p>
            These are installed versions, not a claim about the latest registry
            release. The total is an inventory of supported choices, not proof
            that every combination has passed end-to-end accessibility or
            production testing.
          </p>
          <p>
            Install examples pin these versions so you can reproduce the setup.
            Review the guides, exercise the controls your application uses, and
            verify them in your own browsers and workflows before release.
          </p>
        </div>
      </div>
    </section>
  );
}
