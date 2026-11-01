import { describe, expect, it } from "vitest";
import type { FieldSignals, FieldType } from "@/src/detect/types";
import { SENTENCES, SHORT_TEXT } from "@/src/generate/data/text";
import { createFaker, createPersona } from "@/src/generate/persona";
import { type FieldRequest, generateValue } from "@/src/generate/values";

const now = new Date(2026, 10, 1);

function context(seed = 3) {
  const faker = createFaker(seed);
  return { faker, persona: createPersona(faker, "ph", now), now };
}

function request(
  type: FieldType,
  extra: Partial<FieldRequest> = {},
): FieldRequest {
  return {
    type,
    format: {},
    ...extra,
    signals: { tag: "input", ...(extra.signals as Partial<FieldSignals>) },
  };
}

describe("generateValue", () => {
  it("takes every person field from the same persona", () => {
    const ctx = context();
    const { persona } = ctx;
    expect(generateValue(request("firstName"), ctx)).toBe(persona.firstName);
    expect(generateValue(request("lastName"), ctx)).toBe(persona.lastName);
    expect(generateValue(request("fullName"), ctx)).toBe(
      `${persona.firstName} ${persona.lastName}`,
    );
    expect(generateValue(request("email"), ctx)).toBe(persona.email);
    expect(generateValue(request("barangay"), ctx)).toBe(
      persona.place.district,
    );
    expect(generateValue(request("city"), ctx)).toBe(persona.place.city);
    expect(generateValue(request("province"), ctx)).toBe(
      persona.place.province,
    );
    expect(generateValue(request("zip"), ctx)).toBe(persona.place.zip);
  });

  it("shapes phones and birthdays to the field's format", () => {
    const ctx = context();
    const national = ctx.persona.phone.national;
    expect(
      generateValue(
        request("phone", { format: { phoneStyle: "local11" } }),
        ctx,
      ),
    ).toBe(`0${national}`);
    expect(
      generateValue(
        request("birthday", { format: { dateOrder: "dmy", separator: "/" } }),
        ctx,
      ),
    ).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("gives an upcoming date for plain date fields", () => {
    const value = generateValue(
      request("date", { format: { dateOrder: "ymd" } }),
      context(),
    );
    const date = new Date(`${value}T00:00:00`);
    expect(date.getTime()).toBeGreaterThan(now.getTime());
    expect(date.getTime()).toBeLessThanOrEqual(new Date(2027, 0, 31).getTime());
  });

  it.each(Array.from({ length: 10 }, (_, seed) => seed))(
    "makes a 12-character password with every character kind (seed %i)",
    (seed) => {
      const value = generateValue(request("password"), context(seed)) ?? "";
      expect(value).toHaveLength(12);
      expect(value).toMatch(/[a-z]/);
      expect(value).toMatch(/[A-Z]/);
      expect(value).toMatch(/\d/);
      expect(value).toMatch(/[!@#$%&*?]/);
    },
  );

  it("respects password length limits", () => {
    const longer = generateValue(
      request("password", { format: { length: { min: 16 } } }),
      context(),
    );
    const shorter = generateValue(
      request("password", { format: { length: { max: 8 } } }),
      context(),
    );
    expect(longer).toHaveLength(16);
    expect(shorter).toHaveLength(8);
  });

  it.each(Array.from({ length: 10 }, (_, seed) => seed))(
    "keeps numbers inside min, max and step (seed %i)",
    (seed) => {
      const value = Number(
        generateValue(
          request("number", {
            signals: { tag: "input", min: "10", max: "50", step: "5" },
          }),
          context(seed),
        ),
      );
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(50);
      expect(value % 5).toBe(0);
    },
  );

  it("cuts values to the field's max length", () => {
    expect(
      generateValue(
        request("street", { format: { length: { max: 5 } } }),
        context(),
      ),
    ).toHaveLength(5);
  });

  it("leaves dropdowns, checkboxes and radios to the fill step", () => {
    for (const type of ["select", "checkbox", "radio"] as const) {
      expect(generateValue(request(type), context())).toBeUndefined();
    }
  });

  it("uses a site preset as it is, before generating", () => {
    const ctx = { ...context(), preset: { email: "qa+login@example.com" } };
    expect(generateValue(request("email"), ctx)).toBe("qa+login@example.com");
    expect(generateValue(request("city"), ctx)).toBe(ctx.persona.place.city);
  });

  it("uses the password length from settings", () => {
    const ctx = { ...context(), passwordLength: 20 };
    expect(generateValue(request("password"), ctx)).toHaveLength(20);
  });

  it("writes realistic sentences by default", () => {
    const text = generateValue(request("textarea"), context()) ?? "";
    const used = SENTENCES.filter((sentence) => text.includes(sentence));
    expect(used).toHaveLength(2);
    expect(SHORT_TEXT).toContain(generateValue(request("unknown"), context()));
  });

  it("writes Lorem ipsum when asked", () => {
    const ctx = { ...context(), textStyle: "lorem" as const };
    const text = generateValue(request("textarea"), ctx) ?? "";
    expect(SENTENCES.some((sentence) => text.includes(sentence))).toBe(false);
    expect(SHORT_TEXT).not.toContain(generateValue(request("unknown"), ctx));
  });
});
