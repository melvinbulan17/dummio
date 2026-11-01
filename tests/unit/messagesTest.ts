import { beforeEach, describe, expect, it } from "vitest";
import { handleMessage } from "@/src/messages";

const options = { locale: "ph" as const, overwrite: false, seed: 2 };

describe("handleMessage", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <label for="em">Email</label><input id="em" type="email" />
      <label for="c">City</label><input id="c" />
    `;
  });

  it("scans fields without filling them", () => {
    expect(handleMessage({ type: "scan" })).toEqual([
      { ref: 0, type: "email", label: "Email" },
      { ref: 1, type: "city", label: "City" },
    ]);
    expect((document.getElementById("em") as HTMLInputElement).value).toBe("");
  });

  it("fills the whole page", () => {
    const report = handleMessage({ type: "fill-page", options });
    expect(report).toMatchObject({ seed: 2 });
  });

  it("fills only the focused field", () => {
    const city = document.getElementById("c") as HTMLInputElement;
    city.focus();
    const result = handleMessage({ type: "fill-focused", options });
    expect(result).toMatchObject({ type: "city", status: "filled" });
    expect((document.getElementById("em") as HTMLInputElement).value).toBe("");
  });

  it("returns nothing when no field is focused", () => {
    (document.activeElement as HTMLElement | null)?.blur();
    expect(handleMessage({ type: "fill-focused", options })).toBeNull();
  });
});
