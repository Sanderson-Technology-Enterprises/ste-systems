import assert from "node:assert/strict";
import test from "node:test";
import {
  consultationReturn,
  retainedConsultationSearch,
} from "../app/lib/consultation-bridge";

/** Commercial returns accept only a known source and public service context. */
test("consultation return links never accept an arbitrary destination or private text", () => {
  assert.equal(
    consultationReturn(
      "?source=customized-platforms&service=website-design-development",
    ),
    "https://customizedplatforms.com/contact?context=website-design-development",
  );
  assert.equal(consultationReturn("?returnTo=https://evil.example"), null);
  assert.equal(
    consultationReturn("?source=customized-platforms&service=private%20note"),
    "https://customizedplatforms.com/contact",
  );
  assert.equal(
    consultationReturn(
      "?source=customized-platforms&source=other&service=dashboards",
    ),
    null,
  );
  assert.equal(
    consultationReturn(
      "?source=customized-platforms&service=dashboards&service=web-applications",
    ),
    "https://customizedplatforms.com/contact",
  );
});

/** Consuming shared or legacy settings must retain only validated public consultation provenance. */
test("restoring a direction retains public consultation context without retaining private query values", () => {
  assert.equal(
    retainedConsultationSearch(
      "?source=customized-platforms&service=web-applications&email=private%40example.com&returnTo=https://evil.example&ui=organic",
    ),
    "?source=customized-platforms&service=web-applications",
  );
  assert.equal(
    retainedConsultationSearch(
      "?source=customized-platforms&service=private-note",
    ),
    "?source=customized-platforms",
  );
  assert.equal(
    retainedConsultationSearch("?source=other&service=web-applications"),
    "",
  );
  assert.equal(
    retainedConsultationSearch(
      "?source=customized-platforms&notes=" + "x".repeat(2000),
    ),
    "",
  );
});
