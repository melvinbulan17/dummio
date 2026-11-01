import { useEffect, useState } from "react";
import { Wordmark } from "@/src/components/Wordmark";
import { REPORT_URL, SUPPORT_URL } from "@/src/links";
import {
  DEFAULT_SETTINGS,
  type Presets,
  presetsItem,
  type Settings,
  settingsItem,
  withoutPreset,
  withPreset,
} from "@/src/storage/settings";
import { FillSettings } from "./FillSettings";
import { PresetForm } from "./PresetForm";
import { PresetList } from "./PresetList";

const LINKS = [
  { href: REPORT_URL, label: "Report a problem" },
  { href: SUPPORT_URL, label: "Support Dummio on Ko-fi" },
];

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [presets, setPresets] = useState<Presets>({});

  useEffect(() => {
    void settingsItem.getValue().then(setSettings);
    void presetsItem.getValue().then(setPresets);
  }, []);

  const updateSettings = (change: Partial<Settings>) => {
    const next = { ...settings, ...change };
    setSettings(next);
    void settingsItem.setValue(next);
  };

  const savePresets = (next: Presets) => {
    setPresets(next);
    void presetsItem.setValue(next);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <main className="mx-auto flex max-w-180 flex-col gap-8 px-4 py-8">
        <header className="flex flex-col gap-1">
          <Wordmark />
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Settings
          </h1>
        </header>

        <FillSettings settings={settings} onChange={updateSettings} />

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold">Site presets</h2>
            <p className="text-sm text-ink-muted">
              Pick a site and a field, and Dummio always uses your value there,
              like a fixed test email. Add as many sites and fields as you need,
              one at a time.
            </p>
          </div>
          <PresetForm
            onAdd={(site, type, value) =>
              savePresets(withPreset(presets, site, type, value))
            }
          />
          <PresetList
            presets={presets}
            onRemove={(site, type) =>
              savePresets(withoutPreset(presets, site, type))
            }
          />
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
          <span>Settings are saved in this browser. Nothing leaves it.</span>
          <span className="flex gap-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-dummy-yellow-text hover:underline"
              >
                {link.label}
              </a>
            ))}
          </span>
        </footer>
      </main>
    </div>
  );
}
