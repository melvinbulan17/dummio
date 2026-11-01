import { describe, expect, it } from "vitest";
import { PLACES } from "@/src/generate/data/places";

describe("PLACES", () => {
  it("has a large spread of Philippine and US places", () => {
    expect(PLACES.ph.length).toBeGreaterThan(1500);
    expect(
      new Set(PLACES.ph.map((place) => place.province)).size,
    ).toBeGreaterThan(75);
    expect(PLACES.us.length).toBeGreaterThan(2500);
    expect(new Set(PLACES.us.map((place) => place.province)).size).toBe(51);
  });

  it("uses 4-digit ZIPs in the Philippines and 5-digit ZIPs in the US", () => {
    expect(PLACES.ph.every((place) => /^\d{4}$/.test(place.zip))).toBe(true);
    expect(PLACES.us.every((place) => /^\d{5}$/.test(place.zip))).toBe(true);
  });

  it("gives every Philippine place at least one barangay", () => {
    expect(PLACES.ph.every((place) => place.districts.length > 0)).toBe(true);
  });

  it.each([
    ["Kapitolyo", "Pasig City", "Metro Manila", "1603"],
    ["Adlaon", "Cebu City", "Cebu", "6000"],
  ])(
    "keeps %s, %s, %s with ZIP %s together",
    (district, city, province, zip) => {
      expect(PLACES.ph).toContainEqual(
        expect.objectContaining({
          city,
          province,
          zip,
          districts: expect.arrayContaining([district]),
        }),
      );
    },
  );

  it("gives every US place a real area code for its state", () => {
    expect(
      PLACES.us.every((place) => /^\d{3}$/.test(place.areaCode ?? "")),
    ).toBe(true);
  });
});
