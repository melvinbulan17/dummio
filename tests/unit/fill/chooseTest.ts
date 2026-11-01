import { describe, expect, it } from "vitest";
import { chooseOption, isSelectEmpty } from "@/src/fill/choose";
import { createFaker } from "@/src/generate/persona";

function select(html: string): HTMLSelectElement {
  document.body.innerHTML = `<select>${html}</select>`;
  return document.querySelector("select") as HTMLSelectElement;
}

describe("chooseOption", () => {
  const faker = createFaker(1);

  it("matches by value, text or number", () => {
    expect(
      chooseOption(
        select(
          `<option value="PH">Philippines</option><option value="US">United States</option>`,
        ),
        faker,
        "Philippines",
      )?.value,
    ).toBe("PH");
    expect(
      chooseOption(select(`<option>7</option><option>8</option>`), faker, "08")
        ?.text,
    ).toBe("8");
  });

  it("matches months by name in English or Filipino", () => {
    expect(
      chooseOption(
        select(`<option>Feb</option><option>Mar</option>`),
        faker,
        "03",
        true,
      )?.text,
    ).toBe("Mar");
    expect(
      chooseOption(
        select(`<option>Enero</option><option>Marso</option>`),
        faker,
        "3",
        true,
      )?.text,
    ).toBe("Marso");
  });

  it("falls back to a random real option", () => {
    const option = chooseOption(
      select(
        `<option value="">-- Choose --</option><option value="x">X</option>`,
      ),
      faker,
      "Nowhere",
    );
    expect(option?.value).toBe("x");
  });

  it("returns nothing when no option is usable", () => {
    expect(
      chooseOption(select(`<option value="">Pumili</option>`), faker),
    ).toBeUndefined();
  });
});

describe("isSelectEmpty", () => {
  it("treats a placeholder selection as empty", () => {
    expect(
      isSelectEmpty(
        select(`<option value="">Select</option><option value="a">A</option>`),
      ),
    ).toBe(true);
    expect(isSelectEmpty(select(`<option value="a" selected>A</option>`))).toBe(
      false,
    );
  });
});
