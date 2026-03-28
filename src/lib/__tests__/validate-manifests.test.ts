/**
 * validate-manifests — unit tests
 *
 * Tests cover:
 *  - Returns empty array when all manifests present
 *  - Returns entries for missing manifests
 *  - Handles entries from multiple portfolio types
 *  - Correctly constructs the expected manifest path
 */

import fs from "fs";
import path from "path";
import { findMissingManifests, type ManifestEntry } from "@/lib/validate-manifests";

jest.mock("fs");

const ASSETS_BASE = "/fake/assets";

const ALL_PRESENT: ManifestEntry[] = [
  { type: "photography", slug: "event-photography" },
  { type: "video", slug: "stuck-low-pay" },
  { type: "social-media", slug: "ig-motivational" },
];

beforeEach(() => {
  (fs.existsSync as jest.Mock).mockReturnValue(true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("findMissingManifests()", () => {
  it("returns an empty array when all manifests exist", () => {
    const result = findMissingManifests(ALL_PRESENT, ASSETS_BASE);
    expect(result).toEqual([]);
  });

  it("returns the entry when its manifest is missing", () => {
    (fs.existsSync as jest.Mock).mockImplementation((p: string) =>
      !p.includes("stuck-low-pay")
    );
    const result = findMissingManifests(ALL_PRESENT, ASSETS_BASE);
    expect(result).toEqual([{ type: "video", slug: "stuck-low-pay" }]);
  });

  it("returns all missing entries when multiple manifests are absent", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    const result = findMissingManifests(ALL_PRESENT, ASSETS_BASE);
    expect(result).toHaveLength(3);
  });

  it("checks the correct manifest path for each entry", () => {
    findMissingManifests(
      [{ type: "photography", slug: "event-photography" }],
      ASSETS_BASE
    );
    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join(ASSETS_BASE, "photography", "event-photography", "images.json")
    );
  });

  it("returns an empty array for an empty entry list", () => {
    const result = findMissingManifests([], ASSETS_BASE);
    expect(result).toEqual([]);
  });
});
