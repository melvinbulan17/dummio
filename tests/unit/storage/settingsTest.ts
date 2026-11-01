import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import {
  DEFAULT_SETTINGS,
  loadFillOptions,
  presetsItem,
  settingsItem,
  type Settings,
  siteOf,
} from "@/src/storage/settings";

describe("siteOf", () => {
  it.each([
    ["https://Signup.Acme.test/register?x=1", "signup.acme.test"],
    ["signup.acme.test/path", "signup.acme.test"],
    ["  localhost:3000 ", "localhost"],
    ["", ""],
    ["not a site", ""],
  ])("reads %j as %j", (input, expected) => {
    expect(siteOf(input)).toBe(expected);
  });
});

describe("loadFillOptions", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("uses the defaults when nothing is saved", async () => {
    expect(await loadFillOptions("https://acme.test/")).toEqual({
      ...DEFAULT_SETTINGS,
      preset: {},
    });
  });

  it("uses saved settings, fills in newer defaults, and only this site's preset", async () => {
    await settingsItem.setValue({
      locale: "us",
      overwrite: true,
      passwordLength: 20,
    } as Settings);
    await presetsItem.setValue({
      "acme.test": { email: "qa@example.com" },
      "other.test": { email: "else@example.com" },
    });
    expect(await loadFillOptions("https://acme.test/signup")).toEqual({
      locale: "us",
      overwrite: true,
      passwordLength: 20,
      textStyle: "realistic",
      preset: { email: "qa@example.com" },
    });
  });
});
