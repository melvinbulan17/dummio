import { describe, expect, it } from "vitest";
import { detectFormat } from "@/src/detect/format";
import type { FieldSignals } from "@/src/detect/types";

function signals(extra: Partial<FieldSignals>): FieldSignals {
  return { tag: "input", inputType: "text", ...extra };
}

describe("detectFormat", () => {
  describe("dates", () => {
    it("uses year-month-day for date inputs", () => {
      expect(detectFormat(signals({ inputType: "date" }), "birthday")).toEqual({
        dateOrder: "ymd",
        separator: "-",
      });
    });

    it.each([
      ["MM/DD/YYYY", "mdy", "/"],
      ["DD/MM/YYYY", "dmy", "/"],
      ["yyyy-mm-dd", "ymd", "-"],
      ["dd.mm.yyyy", "dmy", "."],
    ])("reads %s from the placeholder", (placeholder, dateOrder, separator) => {
      expect(detectFormat(signals({ placeholder }), "birthday")).toEqual({
        dateOrder,
        separator,
      });
    });

    it("reads the order from the label", () => {
      expect(
        detectFormat(
          signals({ labelText: "Birthday (DD/MM/YYYY)" }),
          "birthday",
        ),
      ).toMatchObject({
        dateOrder: "dmy",
      });
    });

    it("marks split date parts", () => {
      expect(
        detectFormat(signals({ tag: "select", datePart: "month" }), "birthday"),
      ).toEqual({
        part: "month",
      });
    });

    it("leaves the order open when there is no clue", () => {
      expect(
        detectFormat(signals({ labelText: "Birthday" }), "birthday"),
      ).toEqual({});
    });
  });

  describe("phones", () => {
    it("uses 11 local digits for maxlength 11", () => {
      expect(
        detectFormat(signals({ inputType: "tel", maxLength: 11 }), "phone"),
      ).toEqual({
        phoneStyle: "local11",
        digitsOnly: true,
        length: { min: undefined, max: 11 },
      });
    });

    it("uses 10 digits after a +63 prefix", () => {
      expect(
        detectFormat(signals({ prefixText: "+63" }), "phone"),
      ).toMatchObject({
        phoneStyle: "local10",
        digitsOnly: true,
      });
    });

    it("reads a 09 placeholder", () => {
      expect(
        detectFormat(signals({ placeholder: "09XX XXX XXXX" }), "phone")
          .phoneStyle,
      ).toBe("local11");
    });

    it("reads an international placeholder", () => {
      expect(
        detectFormat(signals({ placeholder: "+63 9XX XXX XXXX" }), "phone")
          .phoneStyle,
      ).toBe("intl");
    });

    it("leaves the style open without clues", () => {
      expect(detectFormat(signals({ inputType: "tel" }), "phone")).toEqual({});
    });
  });

  describe("any field", () => {
    it("marks digit-only patterns and numeric input mode", () => {
      expect(
        detectFormat(signals({ pattern: "[0-9]{4}" }), "zip").digitsOnly,
      ).toBe(true);
      expect(detectFormat(signals({ pattern: "\\d+" }), "zip").digitsOnly).toBe(
        true,
      );
      expect(
        detectFormat(signals({ inputMode: "numeric" }), "zip").digitsOnly,
      ).toBe(true);
      expect(
        detectFormat(signals({ pattern: "[A-Z]{2}" }), "zip").digitsOnly,
      ).toBeUndefined();
    });

    it("keeps length limits", () => {
      expect(
        detectFormat(signals({ minLength: 2, maxLength: 4 }), "zip").length,
      ).toEqual({
        min: 2,
        max: 4,
      });
    });
  });
});
