import { websiteTemplate } from "../data/studio-scenarios";
import type { DesignPlan } from "./design-plan";

/**
 * Applies a website's structural starting point without changing client-owned styling.
 * @param plan Current document; never mutated.
 * @param id Catalog identifier received from a card, file, or validated URL intent.
 * @param options Fresh plans receive the selected template's editable sample copy.
 * @returns A separate document, ready for the provider's revision and autosave boundary.
 */
export function applyWebsiteTemplate(
  plan: DesignPlan,
  id: string,
  options: { fresh?: boolean } = {},
): DesignPlan {
  const template = websiteTemplate(id);
  if (!template)
    throw new Error("Unknown website type. Choose one of the six starters.");
  const next = structuredClone(plan);
  next.preview = {
    ...next.preview,
    scenario: template.id,
    screen: template.screens[0],
  };
  next.design.configuration.recipe = template.starter.recipe;
  next.design.wrapper = template.starter.wrapper;
  next.favorite = null;
  if (options.fresh) {
    next.project.headline = template.starter.headline;
    next.project.action = template.starter.action;
  }
  return next;
}
