"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  InterfaceRoot,
  Layout,
} from "@sanderson-technology-enterprises/ste-usk-react";

/**
 * Composes the three CSS libraries through React APIs with preview-only state.
 * Import ste-usk-react/styles.css once at your application entry point.
 * This module is also displayed verbatim as the guide's copyable JSX example.
 */
export function ReactProjectExample() {
  const [name, setName] = useState("Customer portal");
  const [savedName, setSavedName] = useState("");

  return (
    <InterfaceRoot preset="minimal-saas" theme="midnight-gold" mode="dark">
      <Layout.Stack gap={4}>
        <Card>
          <Card.Header>
            <h4>Project settings</h4>
            <p>A shared home for your team’s latest work.</p>
          </Card.Header>
          <Card.Body>
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                if (name.trim()) setSavedName(name.trim());
              }}
            >
              <Layout.Stack gap={4}>
                <Form.Input
                  label="Project name"
                  name="projectName"
                  value={name}
                  required
                  onChange={(event) => {
                    setName(event.target.value);
                    setSavedName("");
                  }}
                  helpText="Changes stay in this preview."
                />
                <Button type="submit" disabled={!name.trim()}>
                  Save preview
                </Button>
              </Layout.Stack>
            </Form>
          </Card.Body>
        </Card>
        {savedName ? (
          <Alert variant="success" role="status" title="Preview updated">
            Saved “{savedName}” in this preview. No data was sent.
          </Alert>
        ) : null}
      </Layout.Stack>
    </InterfaceRoot>
  );
}
