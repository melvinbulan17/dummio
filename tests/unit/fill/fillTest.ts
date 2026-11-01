import { beforeEach, describe, expect, it } from "vitest";
import { fillField, fillPage } from "@/src/fill/fill";

const options = {
  locale: "ph" as const,
  overwrite: false,
  seed: 11,
  now: new Date(2026, 10, 1),
};

function value(id: string): string {
  return (document.getElementById(id) as HTMLInputElement).value;
}

describe("fillPage", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("fills a form with one consistent person", () => {
    document.body.innerHTML = `
      <label for="fn">First name</label><input id="fn" />
      <label for="ln">Last name</label><input id="ln" />
      <label for="em">Email</label><input id="em" type="email" />
      <label for="mob">Mobile</label><input id="mob" type="tel" maxlength="11" />
    `;
    const report = fillPage(options);
    const slug = (text: string) => text.toLowerCase().replace(/[^a-z]/g, "");
    expect(
      value("em").startsWith(`${slug(value("fn"))}.${slug(value("ln"))}`),
    ).toBe(true);
    expect(value("mob")).toMatch(/^09\d{9}$/);
    expect(report.fields.map((field) => field.status)).toEqual([
      "filled",
      "filled",
      "filled",
      "filled",
    ]);
    expect(report.fields[0]).toMatchObject({
      ref: 0,
      type: "firstName",
      label: "First name",
    });
  });

  it("gives the same values for the same seed", () => {
    document.body.innerHTML = `<input name="first_name" /><input name="city" />`;
    const first = fillPage(options).fields.map((field) => field.value);
    document.body.innerHTML = `<input name="first_name" /><input name="city" />`;
    const second = fillPage(options).fields.map((field) => field.value);
    expect(second).toEqual(first);
  });

  it("fires input, change and focusout so frameworks notice", () => {
    document.body.innerHTML = `<input name="email" type="email" />`;
    const events: string[] = [];
    for (const type of ["input", "change", "focusout"]) {
      document.body.addEventListener(type, () => events.push(type));
    }
    fillPage(options);
    expect(events).toEqual(["input", "change", "focusout"]);
  });

  it("leaves filled fields alone unless overwrite is on", () => {
    document.body.innerHTML = `<input id="em" name="email" value="mine@example.com" />`;
    expect(fillPage(options).fields[0]?.status).toBe("skipped");
    expect(value("em")).toBe("mine@example.com");
    fillPage({ ...options, overwrite: true });
    expect(value("em")).not.toBe("mine@example.com");
  });

  it("tries other date orders until the field accepts the value", () => {
    document.body.innerHTML = `<label for="bd">Birthday</label><input id="bd" pattern="\\d{4}-\\d{2}-\\d{2}" />`;
    const [result] = fillPage(options).fields;
    expect(result?.status).toBe("filled");
    expect(value("bd")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("reports a field the form still rejects", () => {
    document.body.innerHTML = `<label for="m">Mobile</label><input id="m" type="tel" pattern="x+" />`;
    expect(fillPage(options).fields[0]?.status).toBe("rejected");
  });

  it("matches split birthday dropdowns by number and month name", () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    document.body.innerHTML = `
      <select name="dob_month"><option value="">Month</option>${months.map((m) => `<option>${m}</option>`).join("")}</select>
      <select name="dob_day"><option value="">Day</option>${Array.from({ length: 31 }, (_, i) => `<option>${i + 1}</option>`).join("")}</select>
    `;
    const report = fillPage(options);
    expect(report.fields.map((field) => field.status)).toEqual([
      "filled",
      "filled",
    ]);
    const [month, day] = report.fields.map((field) => field.value);
    expect(months).toContain(month);
    expect(Number(day)).toBeGreaterThanOrEqual(1);
  });

  it("picks a real option, never the placeholder", () => {
    document.body.innerHTML = `<select id="s" name="plan"><option value="">Select a plan</option><option value="a">Basic</option><option value="b" disabled>Old</option></select>`;
    fillPage(options);
    expect(value("s")).toBe("a");
  });

  it("checks one radio per group and every required checkbox", () => {
    document.body.innerHTML = `
      <input type="radio" name="g" value="f" /><input type="radio" name="g" value="m" />
      <input type="checkbox" id="terms" required />
    `;
    const report = fillPage(options);
    expect(document.querySelectorAll("input[name=g]:checked")).toHaveLength(1);
    expect((document.getElementById("terms") as HTMLInputElement).checked).toBe(
      true,
    );
    expect(report.fields.map((field) => field.status)).toEqual([
      "filled",
      "skipped",
      "filled",
    ]);
  });

  it("cuts values to the field's max length", () => {
    document.body.innerHTML = `<label for="st">Street address</label><input id="st" maxlength="4" />`;
    fillPage(options);
    expect(value("st")).toHaveLength(4);
  });
});

describe("fillField", () => {
  it("fills one field even when it already has a value", () => {
    document.body.innerHTML = `<input id="c" name="city" value="Old" /><input id="z" name="zip" />`;
    const result = fillField(
      document.getElementById("c") as HTMLInputElement,
      options,
    );
    expect(result.status).toBe("filled");
    expect(value("c")).not.toBe("Old");
    expect(value("z")).toBe("");
  });
});
