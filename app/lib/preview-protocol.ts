import {
  createDesignPlan,
  parseDesignPlan,
  type DesignPlan,
} from "./design-plan";

export const PREVIEW_CHANNEL = "ste-design-preview";
export const PREVIEW_PROTOCOL_VERSION = 1;

/** Minimum rendering projection; project research and consultation notes never cross the frame boundary. */
export type PreviewRenderModel = Pick<
  DesignPlan,
  "design" | "preview" | "revision"
> & {
  copy: Pick<DesignPlan["project"], "name" | "headline" | "action">;
  specimen?: boolean;
};

/** Derives identical rendering inputs for live previews, comparisons, and captures. */
export function previewModel(plan: DesignPlan): PreviewRenderModel {
  return {
    revision: plan.revision,
    design: plan.design,
    preview: plan.preview,
    copy: {
      name: plan.project.name,
      headline: plan.project.headline,
      action: plan.project.action,
    },
  };
}

/** Validates frame input with the same catalog contract used by portable documents. */
export function validatePreviewModel(
  value: PreviewRenderModel,
): PreviewRenderModel {
  const checked = parseDesignPlan({
    ...createDesignPlan(),
    revision: value.revision,
    design: value.design,
    preview: value.preview,
    project: { ...createDesignPlan().project, ...value.copy },
  }).plan;
  return { ...previewModel(checked), specimen: value.specimen === true };
}

/** Recognizes protocol metadata before either side interprets a message payload. */
export function isPreviewMessage(
  value: unknown,
): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    "channel" in value &&
    value.channel === PREVIEW_CHANNEL &&
    "version" in value &&
    value.version === PREVIEW_PROTOCOL_VERSION
  );
}

/** Envelopes app-owned messages without coupling the public STE libraries to the studio. */
export function previewMessage(
  kind: string,
  fields: Record<string, unknown> = {},
) {
  return {
    channel: PREVIEW_CHANNEL,
    version: PREVIEW_PROTOCOL_VERSION,
    kind,
    ...fields,
  };
}
