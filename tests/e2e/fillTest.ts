import { build } from "esbuild";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, type Page, test } from "@playwright/test";
import type { FillReport } from "@/src/fill/fill";

const root = resolve(import.meta.dirname, "../..");
const fixture = (name: string) =>
  pathToFileURL(resolve(root, "tests/fixtures/forms", name)).href;

async function bundle(entry: string, globalName?: string): Promise<string> {
  const result = await build({
    entryPoints: [resolve(root, entry)],
    bundle: true,
    format: "iife",
    globalName,
    write: false,
    alias: { "@": root },
    define: { "process.env.NODE_ENV": '"production"' },
  });
  return result.outputFiles[0]?.text ?? "";
}

let filler = "";
let reactForm = "";

test.beforeAll(async () => {
  [filler, reactForm] = await Promise.all([
    bundle("src/fill/fill.ts", "Dummio"),
    bundle("tests/fixtures/forms/react-form.tsx"),
  ]);
});

async function fill(page: Page): Promise<FillReport> {
  await page.addScriptTag({ content: filler });
  return page.evaluate(() =>
    (
      window as unknown as {
        Dummio: { fillPage: (options: object) => FillReport };
      }
    ).Dummio.fillPage({ locale: "ph", overwrite: false, seed: 5 }),
  );
}

test("fills a Philippine sign-up form in the shape each field wants", async ({
  page,
}) => {
  await page.goto(fixture("signup-ph.html"));
  const report = await fill(page);

  expect(report.fields.filter((field) => field.status === "rejected")).toEqual(
    [],
  );
  await expect(page.locator("#mob")).toHaveValue(/^9\d{9}$/);
  await expect(page.locator("#bd")).toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/);
  await expect(page.locator("#zip")).toHaveValue(/^\d{4}$/);
  await expect(page.locator("#prov")).not.toHaveValue("");
  await expect(page.locator("#terms")).toBeChecked();
  await expect(page.locator("input[name=gender]:checked")).toHaveCount(1);
  await expect(page.locator("company-field #co")).not.toHaveValue("");
  expect(
    await page
      .locator("#form")
      .evaluate((form: HTMLFormElement) => form.checkValidity()),
  ).toBe(true);
  expect(report.ms).toBeLessThan(100);
});

test("keeps values on a React-controlled form after submit", async ({
  page,
}) => {
  await page.setContent(`<div id="root"></div>`);
  await page.addScriptTag({ content: reactForm });
  await expect(page.locator("#name")).toBeVisible();
  await fill(page);
  await page.getByRole("button", { name: "Submit" }).click();

  const result = JSON.parse(
    (await page.locator("#result").textContent()) ?? "{}",
  ) as Record<string, string | boolean>;
  expect(result.name).toMatch(/^\S+( \S+)+$/);
  expect(result.email).toMatch(/@example\.(com|net|org)$/);
  expect(result.mobile).toMatch(/^09\d{9}$/);
  expect(["PH", "US"]).toContain(result.country);
  expect(result.newsletter).toBe(true);
});
