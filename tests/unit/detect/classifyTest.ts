import { describe, expect, it } from "vitest";
import { classify } from "@/src/detect/classify";
import type { FieldSignals, FieldType } from "@/src/detect/types";

function typeOf(signals: Partial<FieldSignals>): FieldType {
  return classify({ tag: "input", inputType: "text", ...signals }).type;
}

describe("classify", () => {
  it.each<[Partial<FieldSignals>, FieldType]>([
    [{ autocomplete: "given-name" }, "firstName"],
    [{ autocomplete: "shipping family-name" }, "lastName"],
    [{ autocomplete: "section-a address-level2" }, "city"],
    [{ autocomplete: "bday" }, "birthday"],
    [{ inputType: "email" }, "email"],
    [{ inputType: "tel" }, "phone"],
    [{ inputType: "password" }, "password"],
    [{ inputType: "url" }, "url"],
  ])("uses autocomplete and input type: %j", (signals, expected) => {
    expect(typeOf(signals)).toBe(expected);
  });

  it.each<[Partial<FieldSignals>, FieldType]>([
    [{ labelText: "First name" }, "firstName"],
    [{ labelText: "Middle name" }, "middleName"],
    [{ labelText: "Last name" }, "lastName"],
    [{ labelText: "Full name" }, "fullName"],
    [{ labelText: "Name" }, "fullName"],
    [{ name: "user[email]" }, "email"],
    [{ labelText: "Email address" }, "email"],
    [{ labelText: "Mobile number" }, "phone"],
    [{ labelText: "Street address" }, "street"],
    [{ labelText: "Barangay" }, "barangay"],
    [{ labelText: "City / Municipality" }, "city"],
    [{ labelText: "Province" }, "province"],
    [{ labelText: "ZIP code" }, "zip"],
    [{ labelText: "Country" }, "country"],
    [{ labelText: "Date of birth" }, "birthday"],
    [{ id: "dob_day" }, "birthday"],
    [{ labelText: "Company" }, "company"],
    [{ labelText: "Website" }, "url"],
    [{ labelText: "Age" }, "number"],
  ])("reads English keywords: %j", (signals, expected) => {
    expect(typeOf(signals)).toBe(expected);
  });

  it.each<[Partial<FieldSignals>, FieldType]>([
    [{ labelText: "Unang pangalan" }, "firstName"],
    [{ labelText: "Apelyido" }, "lastName"],
    [{ labelText: "Kaarawan" }, "birthday"],
    [{ labelText: "Lungsod" }, "city"],
    [{ labelText: "Lalawigan" }, "province"],
    [{ labelText: "Telepono" }, "phone"],
    [{ labelText: "Tirahan" }, "street"],
  ])("reads Filipino keywords: %j", (signals, expected) => {
    expect(typeOf(signals)).toBe(expected);
  });

  it("keeps a date field as a date unless it mentions birth", () => {
    expect(typeOf({ inputType: "date", labelText: "Start date" })).toBe("date");
    expect(typeOf({ inputType: "date" })).toBe("date");
    expect(typeOf({ inputType: "date", labelText: "Birthday" })).toBe(
      "birthday",
    );
  });

  it("lets autocomplete outweigh a misleading label", () => {
    expect(typeOf({ autocomplete: "email", labelText: "Username" })).toBe(
      "email",
    );
  });

  it("returns checkbox and radio as they are", () => {
    expect(typeOf({ inputType: "checkbox", labelText: "Email me" })).toBe(
      "checkbox",
    );
    expect(typeOf({ inputType: "radio" })).toBe("radio");
  });

  it("falls back for fields with no clues", () => {
    expect(
      classify({ tag: "input", inputType: "text", name: "q7" }),
    ).toMatchObject({
      type: "unknown",
      score: 0,
    });
    expect(classify({ tag: "select" }).type).toBe("select");
    expect(classify({ tag: "textarea" }).type).toBe("textarea");
  });

  it("explains the winning clues", () => {
    const result = classify({
      tag: "input",
      inputType: "tel",
      labelText: "Mobile no.",
    });
    expect(result.reason).toBe('type is tel, label says "Mobile no."');
    expect(result.score).toBe(12);
  });
});
