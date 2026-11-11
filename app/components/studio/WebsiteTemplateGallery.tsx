"use client";

import { useMemo } from "react";
import {
  Badge,
  Button,
  Card,
  Icon,
  Layout,
  Link,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  WEBSITE_TEMPLATES,
  type WebsiteTemplateId,
} from "../../data/studio-scenarios";
import { createDesignPlan, type DesignPlan } from "../../lib/design-plan";
import { applyWebsiteTemplate } from "../../lib/website-templates";
import { previewModel } from "../../lib/preview-protocol";
import { withBasePath } from "../../lib/site";
import { PreviewFrame } from "./PreviewFrame";

/**
 * Presents functional website types using the actual isolated template renderer.
 * Homepage links and in-studio selection share the same canonical catalog and copy.
 */
export function WebsiteTemplateGallery({
  plan,
  onChoose,
  compact = false,
}: {
  plan?: DesignPlan;
  onChoose?: (id: WebsiteTemplateId) => void;
  compact?: boolean;
}) {
  const previews = useMemo(
    () =>
      WEBSITE_TEMPLATES.map((template) => {
        const sample = applyWebsiteTemplate(
          plan ?? createDesignPlan(),
          template.id,
          { fresh: true },
        );
        return { template, model: previewModel(sample) };
      }),
    [plan],
  );
  return (
    <section
      className={`website-template-gallery${compact ? " website-template-gallery-compact" : ""}`}
      aria-label="Choose your website type"
    >
      <Layout.Stack gap={4}>
        <div>
          <p className="studio-eyebrow">Start with a purpose</p>
          <h2>Choose your website type</h2>
          <p>
            Pick the pages and everyday interactions that fit your project. Make
            the style your own next.
          </p>
        </div>
        <Layout.Grid minColumnWidth={compact ? "15rem" : "20rem"} gap={4}>
          {previews.map(({ template, model }) => (
            <article className="website-template-card" key={template.id}>
              <Card spacing="compact" surfaceLevel={2}>
                <Layout.Sidebar
                  sideSize="var(--template-thumbnail-width)"
                  minContentWidth="6rem"
                  gap={3}
                >
                  <Layout.SidebarItem position="side">
                    <PreviewFrame
                      model={model}
                      thumbnail
                      thumbnailKind="template"
                      readOnly
                      title={`${template.label} starter preview`}
                    />
                  </Layout.SidebarItem>
                  <Layout.SidebarItem position="content">
                    <Layout.Stack gap={3}>
                      <h3>
                        {!compact && (
                          <Icon name={template.icon} suppressHydrationWarning />
                        )}{" "}
                        {template.label}
                      </h3>
                      <p className="website-template-description">
                        {template.description}
                      </p>
                      {plan?.preview.scenario === template.id && (
                        <Badge>Current website type</Badge>
                      )}
                      {onChoose ? (
                        <Button
                          variant="secondary"
                          aria-label={`Start with ${template.label}`}
                          onClick={() => onChoose(template.id)}
                        >
                          <span className="website-template-action-full">
                            Start with {template.label}
                          </span>
                          <span className="website-template-action-short">
                            Choose
                          </span>
                        </Button>
                      ) : (
                        <Link
                          className="interactive-surface"
                          presentation="control"
                          aria-label={`Start with ${template.label}`}
                          href={withBasePath(`/lab/?template=${template.id}`)}
                          icon={
                            compact ? undefined : (
                              <Icon
                                name="arrow-right"
                                suppressHydrationWarning
                              />
                            )
                          }
                        >
                          {compact ? "Choose" : `Start with ${template.label}`}
                        </Link>
                      )}
                    </Layout.Stack>
                  </Layout.SidebarItem>
                </Layout.Sidebar>
              </Card>
            </article>
          ))}
        </Layout.Grid>
      </Layout.Stack>
    </section>
  );
}
