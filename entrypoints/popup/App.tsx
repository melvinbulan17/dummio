import { useEffect, useState } from "react";
import { FieldChip } from "@/src/components/FieldChip";
import { FieldRow } from "@/src/components/FieldRow";
import { Toggle } from "@/src/components/Toggle";
import { Wordmark } from "@/src/components/Wordmark";
import type { FillReport } from "@/src/fill/fill";
import { countByGroup, groupOf } from "@/src/groups";
import type { ScannedField } from "@/src/messages";
import { SUPPORT_URL } from "@/src/links";
import { loadFillOptions, settingsItem } from "@/src/storage/settings";
import { sendToTab } from "@/src/tab";

const VISIBLE_ROWS = 5;

type State =
  | { kind: "loading" }
  | { kind: "blocked" }
  | { kind: "ready"; fields: ScannedField[]; report?: FillReport };

async function activeTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export function App() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [host, setHost] = useState("");
  const [tab, setTab] = useState<Browser.tabs.Tab>();
  const [showAll, setShowAll] = useState(false);
  const [overwrite, setOverwrite] = useState(false);

  useEffect(() => {
    void settingsItem
      .getValue()
      .then((settings) => setOverwrite(settings.overwrite));
    void (async () => {
      const tab = await activeTab();
      if (tab?.id === undefined) return setState({ kind: "blocked" });
      setTab(tab);
      setHost(tab.url ? new URL(tab.url).hostname : "");
      try {
        const fields = await sendToTab(tab.id, { type: "scan" });
        setState({ kind: "ready", fields });
      } catch {
        setState({ kind: "blocked" });
      }
    })();
  }, []);

  const changeOverwrite = async (next: boolean) => {
    setOverwrite(next);
    const settings = await settingsItem.getValue();
    await settingsItem.setValue({ ...settings, overwrite: next });
  };

  const fill = async () => {
    if (tab?.id === undefined || state.kind !== "ready") return;
    const options = { ...(await loadFillOptions(tab.url)), overwrite };
    const report = await sendToTab(tab.id, { type: "fill-page", options });
    setState({ ...state, report });
  };

  return (
    <div className="flex w-90 flex-col">
      <header className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <Wordmark />
        <span className="truncate pl-4 font-mono text-xs text-ink-muted">
          {host}
        </span>
      </header>

      {state.kind === "loading" && (
        <p className="px-4 py-6 text-ink-muted">Looking for fields…</p>
      )}

      {state.kind === "blocked" && (
        <p className="px-4 py-6 text-ink-muted">
          This page can’t be filled. Browsers keep extensions off built-in pages
          like settings and the web store.
        </p>
      )}

      {state.kind === "ready" && state.fields.length === 0 && (
        <p className="px-4 py-6 text-ink-muted">
          No fields found on this page.
        </p>
      )}

      {state.kind === "ready" && state.fields.length > 0 && (
        <>
          <section className="flex flex-col gap-3 px-4 pt-4">
            <p className="flex items-baseline gap-2">
              <span className="text-[28px] leading-8 font-semibold tracking-tight tabular-nums">
                {state.report
                  ? state.report.fields.filter((f) => f.status === "filled")
                      .length
                  : state.fields.length}
              </span>
              <span className="text-ink-muted">
                {state.report
                  ? `of ${state.report.fields.length} fields filled`
                  : "fields found"}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {countByGroup(state.fields.map((field) => field.type)).map(
                ({ group, count }) => (
                  <FieldChip key={group} group={group} count={count} />
                ),
              )}
            </div>
          </section>

          <ul className="flex flex-col gap-0.5 px-1 pt-3">
            {(showAll ? state.fields : state.fields.slice(0, VISIBLE_ROWS)).map(
              (field, index) => {
                const result = state.report?.fields.find(
                  (item) => item.ref === field.ref,
                );
                return (
                  <FieldRow
                    key={field.ref}
                    index={index}
                    label={field.label}
                    group={groupOf(field.type)}
                    value={result?.value}
                    status={result?.status}
                  />
                );
              },
            )}
          </ul>
          {!showAll && state.fields.length > VISIBLE_ROWS && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mx-4 mt-1 self-start rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-surface-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow"
            >
              Show all {state.fields.length}
            </button>
          )}

          <section className="sticky bottom-0 flex flex-col gap-3 bg-surface-0 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span id="popup-overwrite">Overwrite filled fields</span>
              <Toggle
                checked={overwrite}
                labelledBy="popup-overwrite"
                onChange={(next) => void changeOverwrite(next)}
              />
            </div>
            <button
              type="button"
              onClick={fill}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-dummy-yellow font-medium text-ink-on-accent transition-colors hover:bg-dummy-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow"
            >
              Fill page
              <kbd className="rounded-sm border border-ink-on-accent/20 px-1.5 py-0.5 font-mono text-[11px]">
                Alt+Shift+F
              </kbd>
            </button>
          </section>
        </>
      )}

      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-2 border-t border-line bg-dummy-yellow-soft px-4 py-2.5 text-xs text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dummy-yellow"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0 text-dummy-yellow-text"
        >
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <path d="M6 2v2M10 2v2M14 2v2" />
        </svg>
        <span className="flex-1">Saving you time? Buy me a coffee.</span>
        <span className="font-medium text-dummy-yellow-text group-hover:underline">
          Ko-fi →
        </span>
      </a>

      <footer className="flex items-center justify-between border-t border-line bg-surface-50 px-4 py-2.5">
        <span className="text-xs text-ink-muted">
          Nothing leaves your browser
        </span>
        <button
          type="button"
          onClick={() => void browser.runtime.openOptionsPage()}
          className="rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-surface-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow"
        >
          Settings
        </button>
      </footer>
    </div>
  );
}
