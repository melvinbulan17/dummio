import { beforeEach, describe, expect, it } from "vitest";
import { findFields } from "@/src/detect/find";

describe("findFields", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("finds inputs, selects and textareas", () => {
    document.body.innerHTML = `
      <input id="a" />
      <select id="b"><option>One</option></select>
      <textarea id="c"></textarea>
    `;
    expect(findFields().map((field) => field.id)).toEqual(["a", "b", "c"]);
  });

  it("skips hidden, disabled, read-only and button-like inputs", () => {
    document.body.innerHTML = `
      <input id="keep" />
      <input id="hidden-type" type="hidden" />
      <input id="disabled" disabled />
      <input id="readonly" readonly />
      <input id="submit" type="submit" />
      <input id="file" type="file" />
      <input id="hidden-attr" hidden />
      <div style="display: none"><input id="in-hidden-parent" /></div>
      <input id="invisible" style="visibility: hidden" />
    `;
    expect(findFields().map((field) => field.id)).toEqual(["keep"]);
  });

  it("finds fields inside open shadow roots", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<input id="inside" />`;
    expect(findFields().map((field) => field.id)).toEqual(["inside"]);
  });
});
