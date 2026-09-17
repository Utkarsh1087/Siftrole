import { describe, it } from "node:test";
import assert from "node:assert";
import { computeRawJdHash, computeNormalizedKey, extractSkillsFromText, stripHtml } from "../src/lib/sync/dedup";

describe("Deduplication & Normalization Logic", () => {
  it("computes deterministic SHA-256 hash irrespective of whitespace differences", () => {
    const text1 = "Software   Engineer at Figma.   \n\nMust know React and TypeScript.";
    const text2 = "software engineer at figma. Must know react and typescript.";

    const hash1 = computeRawJdHash(text1);
    const hash2 = computeRawJdHash(text2);

    assert.strictEqual(hash1, hash2, "Hashes should match when text has only whitespace/casing variations");
    assert.strictEqual(typeof hash1, "string");
    assert.strictEqual(hash1.length, 64, "SHA-256 hash length should be 64 characters");
  });

  it("produces different hashes for materially different job descriptions", () => {
    const text1 = "Frontend Engineer at Stripe with React experience.";
    const text2 = "Backend Engineer at Stripe with Go and Postgres experience.";

    const hash1 = computeRawJdHash(text1);
    const hash2 = computeRawJdHash(text2);

    assert.notStrictEqual(hash1, hash2);
  });

  it("generates consistent normalized keys stripped of punctuation", () => {
    const key1 = computeNormalizedKey("Figma, Inc.", "Sr. Software Engineer (Full-Time)", "San Francisco, CA.");
    const key2 = computeNormalizedKey("figma inc", "sr software engineer fulltime", "san francisco ca");

    assert.strictEqual(key1, key2);
  });

  it("extracts tech skills accurately from job text", () => {
    const text = "We are seeking a Fullstack Developer experienced in React, Next.js, TypeScript, PostgreSQL, and Docker on AWS.";
    const skills = extractSkillsFromText(text);

    assert.ok(skills.includes("React"));
    assert.ok(skills.includes("Next.js"));
    assert.ok(skills.includes("TypeScript"));
    assert.ok(skills.includes("PostgreSQL"));
    assert.ok(skills.includes("Docker"));
    assert.ok(skills.includes("AWS"));
  });

  it("strips HTML tags cleanly from rich JD content", () => {
    const html = "<p>Join <strong>Linear</strong> as a <em>Product Engineer</em>.<br/>Requirements: &amp; skills.</p>";
    const clean = stripHtml(html);

    assert.strictEqual(clean, "Join Linear as a Product Engineer. Requirements: & skills.");
  });
});
