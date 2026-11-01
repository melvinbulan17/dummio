import { describe, expect, it } from "vitest";
import { fitValue, formatDate, formatPhone } from "@/src/generate/format";

const birthday = { year: 1994, month: 3, day: 8 };
const ph = { countryCode: "63", national: "9174821093" };
const us = { countryCode: "1", national: "5125550142" };

describe("formatDate", () => {
  it.each([
    [{ dateOrder: "ymd", separator: "-" }, "1994-03-08"],
    [{ dateOrder: "mdy", separator: "/" }, "03/08/1994"],
    [{ dateOrder: "dmy", separator: "." }, "08.03.1994"],
    [{ dateOrder: "ymd" }, "1994-03-08"],
    [{}, "03/08/1994"],
  ] as const)("formats %j as %s", (format, expected) => {
    expect(formatDate(birthday, format)).toBe(expected);
  });

  it("returns one part for split fields", () => {
    expect(formatDate(birthday, { part: "day" })).toBe("08");
    expect(formatDate(birthday, { part: "month" })).toBe("03");
    expect(formatDate(birthday, { part: "year" })).toBe("1994");
  });
});

describe("formatPhone", () => {
  it.each([
    [{}, "+63 917 482 1093"],
    [{ phoneStyle: "intl" }, "+63 917 482 1093"],
    [{ phoneStyle: "local11" }, "09174821093"],
    [{ phoneStyle: "local10" }, "9174821093"],
    [{ digitsOnly: true }, "09174821093"],
  ] as const)("formats a PH mobile with %j", (format, expected) => {
    expect(formatPhone(ph, format)).toBe(expected);
  });

  it.each([
    [{}, "(512) 555-0142"],
    [{ phoneStyle: "intl" }, "+1 512 555 0142"],
    [{ phoneStyle: "local11" }, "15125550142"],
    [{ digitsOnly: true }, "5125550142"],
  ] as const)("formats a US number with %j", (format, expected) => {
    expect(formatPhone(us, format)).toBe(expected);
  });
});

describe("fitValue", () => {
  it("strips non-digits for digit-only fields", () => {
    expect(fitValue("+63 917 482 1093", { digitsOnly: true })).toBe(
      "639174821093",
    );
  });

  it("cuts values longer than the field allows", () => {
    expect(fitValue("Dimaculangan", { length: { max: 8 } })).toBe("Dimacula");
  });

  it("leaves values that fit alone", () => {
    expect(fitValue("Pasig City", {})).toBe("Pasig City");
  });
});
