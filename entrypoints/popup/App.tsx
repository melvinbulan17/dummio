import { useEffect, useState } from "react";
import { GhostButton } from "@/src/components/GhostButton";
import { Wordmark } from "@/src/components/Wordmark";
import type { FillReport } from "@/src/fill/fill";
import type { ScannedField } from "@/src/messages";
import { loadFillOptions, settingsItem } from "@/src/storage/settings";
import { sendToTab } from "@/src/tab";
import { FieldList } from "./FieldList";
import { FieldSummary } from "./FieldSummary";
import { FillControls } from "./FillControls";
import { SupportLink } from "./SupportLink";

type State =
  | { kind: "loading" }
  | { kind: "blocked" }
  | { kind: "ready"; fields: ScannedField[]; report?: FillReport };

const MESSAGES = {
  loading: "Looking for fields…",
  blocked:
    "This page can’t be filled. Browsers keep extensions off built-in pages like settings and the web store.",
  empty: "No fields found on this page.",
};

async function activeTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export function App() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tab, setTab] = useState<Browser.tabs.Tab>();
  const [overwrite, setOverwrite] = useState(false);

  useEffect(() => {
    void settingsItem
      .getValue()
      .then((settings) => setOverwrite(settings.overwrite));
    void (async () => {
      const current = await activeTab();
      if (current?.id === undefined) return setState({ kind: "blocked" });
      setTab(current);
      try {
        const fields = await sendToTab(current.id, { type: "scan" });
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

  const message =
    state.kind === "ready"
      ? state.fields.length === 0
        ? MESSAGES.empty
        : undefined
      : MESSAGES[state.kind];

  return (
    <div className="flex w-90 flex-col">
      <header className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <Wordmark />
        <span className="truncate pl-4 font-mono text-xs text-ink-muted">
          {tab?.url ? new URL(tab.url).hostname : ""}
        </span>
      </header>

      {message && <p className="px-4 py-6 text-ink-muted">{message}</p>}

      {state.kind === "ready" && state.fields.length > 0 && (
        <>
          <FieldSummary fields={state.fields} report={state.report} />
          <FieldList fields={state.fields} report={state.report} />
          <FillControls
            overwrite={overwrite}
            onOverwriteChange={(next) => void changeOverwrite(next)}
            onFill={() => void fill()}
          />
        </>
      )}

      <SupportLink />

      <footer className="flex items-center justify-between border-t border-line bg-surface-50 px-4 py-2.5">
        <span className="text-xs text-ink-muted">
          Nothing leaves your browser
        </span>
        <GhostButton onClick={() => void browser.runtime.openOptionsPage()}>
          Settings
        </GhostButton>
      </footer>
    </div>
  );
}
