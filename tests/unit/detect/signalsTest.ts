import { beforeEach, describe, expect, it } from "vitest";
import { readSignals } from "@/src/detect/signals";
import type { FormField } from "@/src/detect/types";

function field(html: string, selector = "input, select, textarea"): FormField {
  document.body.innerHTML = html;
  return document.querySelector(selector) as FormField;
}

describe("readSignals", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("reads attributes", () => {
    const signals = readSignals(
      field(
        `<input type="tel" name="mobile_no" id="mobile" placeholder="09XX XXX XXXX" autocomplete="TEL" maxlength="11" minlength="11" pattern="[0-9]*" inputmode="numeric" />`,
      ),
    );
    expect(signals).toMatchObject({
      tag: "input",
      inputType: "tel",
      name: "mobile_no",
      id: "mobile",
      placeholder: "09XX XXX XXXX",
      autocomplete: "tel",
      maxLength: 11,
      minLength: 11,
      pattern: "[0-9]*",
      inputMode: "numeric",
    });
  });

  it("reads a label linked with for", () => {
    const signals = readSignals(
      field(`<label for="x">Mobile no.</label><input id="x" />`),
    );
    expect(signals.labelText).toBe("Mobile no.");
  });

  it("reads a wrapping label without the options of a select", () => {
    const signals = readSignals(
      field(
        `<label>Province <select><option>Cebu</option></select></label>`,
        "select",
      ),
    );
    expect(signals.labelText).toBe("Province");
  });

  it("prefers aria-labelledby", () => {
    const signals = readSignals(
      field(
        `<span id="l">Kaarawan</span><label for="x">Other</label><input id="x" aria-labelledby="l" />`,
      ),
    );
    expect(signals.labelText).toBe("Kaarawan");
  });

  it("reads a short prefix before the field", () => {
    const signals = readSignals(field(`<span>+63</span><input id="phone" />`));
    expect(signals.prefixText).toBe("+63");
  });

  it("ignores long text before the field", () => {
    const signals = readSignals(
      field(`<p>Enter your mobile number</p><input id="phone" />`),
    );
    expect(signals.prefixText).toBeUndefined();
  });

  it("finds date parts from names and labels", () => {
    expect(
      readSignals(field(`<select name="dob_day"></select>`, "select")).datePart,
    ).toBe("day");
    expect(readSignals(field(`<input name="birthMonth" />`)).datePart).toBe(
      "month",
    );
    expect(
      readSignals(field(`<label for="y">Taon</label><input id="y" />`))
        .datePart,
    ).toBe("year");
  });

  it("leaves missing length attributes undefined", () => {
    const signals = readSignals(field(`<input />`));
    expect(signals.maxLength).toBeUndefined();
    expect(signals.minLength).toBeUndefined();
  });
});
