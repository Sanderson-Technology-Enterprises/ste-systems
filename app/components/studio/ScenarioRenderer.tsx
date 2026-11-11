"use client";

import {
  Badge,
  Button,
  Card,
  Form,
  Layout,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { LegacyScenarioRenderer } from "./LegacyScenarioRenderer";
import { NewsletterTemplate } from "./scenarios/NewsletterTemplate";
import { BlogTemplate } from "./scenarios/BlogTemplate";
import { IndustrialTemplate } from "./scenarios/IndustrialTemplate";
import { InventoryTemplate } from "./scenarios/InventoryTemplate";
import { MarketingTemplate } from "./scenarios/MarketingTemplate";
import { StorefrontTemplate } from "./scenarios/StorefrontTemplate";
import { ScenarioIcon, type ScenarioProps } from "./scenarios/ScenarioScaffold";

/** Dispatches the same template components for live views, thumbnails, comparisons, and captures. */
export function ScenarioRenderer(props: ScenarioProps) {
  if (props.model.specimen)
    return (
      <Layout.Stack gap={3}>
        <Badge>Website preview</Badge>
        <h2>Your next chapter.</h2>
        <Card spacing="comfortable">
          <Layout.Stack gap={3}>
            <p>A consistent specimen in every visual style.</p>
            <Button>
              <ScenarioIcon model={props.model} name="arrow-right" /> Explore
            </Button>
          </Layout.Stack>
        </Card>
        <Form.Input
          className="interactive-surface"
          label="Your email"
          placeholder="hello@example.com"
        />
      </Layout.Stack>
    );
  if (props.model.preview.scenario === "newsletter")
    return <NewsletterTemplate {...props} />;
  if (props.model.preview.scenario === "business")
    return <MarketingTemplate {...props} />;
  if (props.model.preview.scenario === "storefront")
    return <StorefrontTemplate {...props} />;
  if (props.model.preview.scenario === "blog")
    return <BlogTemplate {...props} />;
  if (props.model.preview.scenario === "industrial")
    return <IndustrialTemplate {...props} />;
  if (props.model.preview.scenario === "inventory")
    return <InventoryTemplate {...props} />;
  return <LegacyScenarioRenderer {...props} />;
}
