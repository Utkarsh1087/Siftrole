import { describe, it } from "node:test";
import assert from "node:assert";
import { getAdapter } from "../src/lib/scrapers";

describe("ATS Adapters Registry & Error Resilience", () => {
  it("resolves all 4 target adapters correctly", () => {
    assert.ok(getAdapter("GREENHOUSE"), "Greenhouse adapter should exist");
    assert.ok(getAdapter("LEVER"), "Lever adapter should exist");
    assert.ok(getAdapter("ASHBY"), "Ashby adapter should exist");
    assert.ok(getAdapter("SMARTRECRUITERS"), "SmartRecruiters adapter should exist");
  });

  it("returns null gracefully for unsupported ATS types", () => {
    assert.strictEqual(getAdapter("WORKDAY"), null);
    assert.strictEqual(getAdapter("UNKNOWN_ATS"), null);
  });
});
