import { beforeEach, describe, expect, it } from "vitest";
import { detectFields } from "@/src/detect/detect";

describe("detectFields", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("detects a Philippine sign-up form", () => {
    document.body.innerHTML = `
      <form>
        <label for="fn">Unang pangalan</label><input id="fn" />
        <label for="ln">Apelyido</label><input id="ln" />
        <label for="em">Email</label><input id="em" type="email" />
        <label for="mob">Mobile no.</label><span>+63</span><input id="mob" type="tel" />
        <label for="bd">Birthday</label><input id="bd" placeholder="MM/DD/YYYY" />
        <label for="brgy">Barangay</label><input id="brgy" />
        <label>Lungsod <select id="city"><option>Pasig</option></select></label>
        <label for="zip">ZIP</label><input id="zip" maxlength="4" pattern="[0-9]{4}" />
        <label for="ref">Reference</label><input id="ref" name="q7" />
        <input type="checkbox" id="terms" />
        <button type="submit">Sign up</button>
      </form>
    `;

    const fields = detectFields();
    expect(fields.map((field) => [field.element.id, field.type])).toEqual([
      ["fn", "firstName"],
      ["ln", "lastName"],
      ["em", "email"],
      ["mob", "phone"],
      ["bd", "birthday"],
      ["brgy", "barangay"],
      ["city", "city"],
      ["zip", "zip"],
      ["ref", "unknown"],
      ["terms", "checkbox"],
    ]);
    expect(fields.map((field) => field.ref)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);

    const byId = Object.fromEntries(
      fields.map((field) => [field.element.id, field]),
    );
    expect(byId.mob?.format).toMatchObject({
      phoneStyle: "local10",
      digitsOnly: true,
    });
    expect(byId.bd?.format).toEqual({ dateOrder: "mdy", separator: "/" });
    expect(byId.zip?.format).toEqual({
      digitsOnly: true,
      length: { min: undefined, max: 4 },
    });
  });

  it("detects split birthday dropdowns", () => {
    document.body.innerHTML = `
      <select name="dob_day"></select>
      <select name="dob_month"></select>
      <select name="dob_year"></select>
    `;
    expect(
      detectFields().map((field) => [field.type, field.format.part]),
    ).toEqual([
      ["birthday", "day"],
      ["birthday", "month"],
      ["birthday", "year"],
    ]);
  });
});
