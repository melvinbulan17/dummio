# Dummio

A browser extension for Chrome and Firefox that fills web forms with realistic fake data in one click, with Philippine-format data built in. Everything runs in the browser: no network requests, no accounts, no tracking.

## Stack

WXT, TypeScript, React, Tailwind CSS v4, Vitest and Playwright.

## Getting started

Requires Node 26 and pnpm.

```bash
pnpm install
pnpm dev
```

`pnpm dev` opens Chrome with the extension loaded. Use `pnpm dev:firefox` for Firefox.

## Scripts

| Script                              | What it does                      |
| ----------------------------------- | --------------------------------- |
| `pnpm dev` / `pnpm dev:firefox`     | Run the extension with hot reload |
| `pnpm build` / `pnpm build:firefox` | Build into `.output/`             |
| `pnpm zip` / `pnpm zip:firefox`     | Build a zip for the store         |
| `pnpm lint`                         | ESLint                            |
| `pnpm format` / `pnpm format:check` | Prettier                          |
| `pnpm typecheck`                    | TypeScript                        |
| `pnpm test`                         | Unit tests in `tests/unit`        |
| `pnpm test:e2e`                     | End-to-end tests in `tests/e2e`   |
