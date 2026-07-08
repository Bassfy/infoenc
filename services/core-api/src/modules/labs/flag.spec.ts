import { describe, expect, it } from "vitest";
import { deriveFlag, validateSubmission, flagsEqual } from "./flag.js";

/**
 * Dynamic-flag tests (FR-AC-050). Locks the core anti-cheat property: a flag derived for one
 * session's secret does not validate against another's — flag sharing is worthless.
 */
describe("dynamic flags", () => {
  it("derives a stable, formatted flag for a given secret+target", () => {
    const f = deriveFlag("secret-A", "lab-1:root");
    expect(f).toMatch(/^FLAG\{[0-9a-f]{24}\}$/);
    expect(deriveFlag("secret-A", "lab-1:root")).toBe(f); // deterministic
  });

  it("produces different flags for different session secrets (anti-sharing)", () => {
    expect(deriveFlag("secret-A", "lab-1:root")).not.toBe(deriveFlag("secret-B", "lab-1:root"));
  });

  it("produces different flags per target within a session", () => {
    expect(deriveFlag("secret-A", "lab-1:task-1")).not.toBe(deriveFlag("secret-A", "lab-1:task-2"));
  });

  it("validates a correct submission and rejects a shared/foreign flag", () => {
    const target = "lab-1:root";
    const mine = deriveFlag("my-secret", target);
    // my own flag validates against my secret
    expect(validateSubmission({ submitted: mine, sessionSecret: "my-secret", target })).toBe(true);
    // a flag someone else captured (derived from their secret) does NOT validate against mine
    const theirs = deriveFlag("their-secret", target);
    expect(validateSubmission({ submitted: theirs, sessionSecret: "my-secret", target })).toBe(false);
  });

  it("trims whitespace on submission", () => {
    const target = "lab-1:root";
    const f = deriveFlag("s", target);
    expect(validateSubmission({ submitted: `  ${f}\n`, sessionSecret: "s", target })).toBe(true);
  });

  it("constant-time compare rejects different-length inputs safely", () => {
    expect(flagsEqual("FLAG{abc}", "FLAG{abcd}")).toBe(false);
  });
});
