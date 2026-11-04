import type { ReactNode } from "react";
import {
  Badge,
  Layout,
  type LayoutRecipeName,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { recipeAreas } from "../../lib/playground-options";

/**
 * Change real recipe geometry while keeping the editable specimen subtree mounted.
 * @param props Installed recipe and the stable grid of specimen children.
 * @returns Canonical named regions, or intrinsic gallery/card-grid flow.
 */
export function ShowcaseRecipe({
  recipe,
  children,
}: {
  recipe: LayoutRecipeName;
  children: ReactNode;
}) {
  const areas = recipeAreas(recipe);
  const structured = recipe !== "gallery" && recipe !== "card-grid";
  return (
    <div data-playground-recipe={recipe}>
      <div data-ly-recipe={structured ? recipe : undefined}>
        <div
          data-ly-area={areas.header}
          hidden={!areas.header}
          className="ly-surface ly-pad-4"
        >
          <strong>Northstar component workspace</strong>
        </div>
        <div
          data-ly-area={areas.navigation}
          hidden={!areas.navigation}
          className="ly-surface ly-pad-4 ly-stack ly-gap-2"
        >
          <Badge>Navigation region</Badge>
          <p>Overview · Activity · Review</p>
        </div>
        <div data-ly-area={areas.main}>
          <Layout.Recipe
            recipe={structured ? "card-grid" : recipe}
            style={
              {
                "--ly-card-grid-min": "22rem",
                "--ly-gallery-min": "22rem",
              } as React.CSSProperties
            }
          >
            {children}
          </Layout.Recipe>
        </div>
        <div
          data-ly-area={areas.aside}
          hidden={!areas.aside}
          className="ly-surface ly-pad-4 ly-stack ly-gap-2"
        >
          <Badge variant="success">Supporting region</Badge>
          <p>
            All edits are local. Select another recipe to compare the
            arrangement.
          </p>
        </div>
        <div
          data-ly-area={areas.footer}
          hidden={!areas.footer}
          className="ly-surface ly-pad-4"
        >
          Workspace actions · Demo data only
        </div>
      </div>
    </div>
  );
}
