import { type FormEvent, useEffect, useState } from "react";
import { Wordmark } from "@/src/components/Wordmark";
import type { FieldType } from "@/src/detect/types";
import {
  DEFAULT_SETTINGS,
  PASSWORD_LENGTH,
  PRESET_FIELDS,
  type Presets,
  presetsItem,
  type Settings,
  settingsItem,
  siteOf,
} from "@/src/storage/settings";

const REPORT_URL = "https://github.com/melvinbulan17/form-filler/issues/new";
const FIELD_LABEL = Object.fromEntries(
  PRESET_FIELDS.map(({ type, label }) => [type, label]),
) as Record<FieldType, string>;

const card = "rounded-lg border border-line bg-surface-0 shadow-xs";
const control =
  "h-9 rounded-sm border border-line-strong bg-surface-0 px-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-dummy-yellow";

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [presets, setPresets] = useState<Presets>({});
  const [site, setSite] = useState("");
  const [type, setType] = useState<FieldType>("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

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

  const addPreset = (event: FormEvent) => {
    event.preventDefault();
    const host = siteOf(site);
    if (!host) return setError("Enter a site like signup.acme.test.");
    if (!value.trim()) return setError("Enter the value to use.");
    savePresets({ ...presets, [host]: { ...presets[host], [type]: value } });
    setValue("");
    setError("");
  };

  const removePreset = (host: string, field: FieldType) => {
    const rest = { ...presets[host] };
    delete rest[field];
    const next = { ...presets };
    if (Object.keys(rest).length === 0) delete next[host];
    else next[host] = rest;
    savePresets(next);
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

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Fill settings</h2>
          <div className={`${card} divide-y divide-line px-4`}>
            <label className="flex items-center justify-between gap-3 py-3">
              <span>
                <span className="block">Data locale</span>
                <span className="block text-xs text-ink-muted">
                  Names, phone numbers and addresses
                </span>
              </span>
              <select
                id="locale"
                className={control}
                value={settings.locale}
                onChange={(event) =>
                  updateSettings({
                    locale: event.target.value as Settings["locale"],
                  })
                }
              >
                <option value="ph">Philippines</option>
                <option value="us">United States</option>
              </select>
            </label>
            <div className="flex items-center justify-between gap-3 py-3">
              <span id="overwrite-label">
                <span className="block">Overwrite filled fields</span>
                <span className="block text-xs text-ink-muted">
                  Replace values that are already there
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.overwrite}
                aria-labelledby="overwrite-label"
                onClick={() =>
                  updateSettings({ overwrite: !settings.overwrite })
                }
                className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow ${settings.overwrite ? "border-dummy-yellow bg-dummy-yellow" : "border-line-strong bg-surface-100"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-3.5 rounded-full transition-transform ${settings.overwrite ? "translate-x-4 bg-ink-on-accent" : "bg-ink-muted"}`}
                />
              </button>
            </div>
            <label className="flex items-center justify-between gap-3 py-3">
              <span>
                <span className="block">Password length</span>
                <span className="block text-xs text-ink-muted">
                  {PASSWORD_LENGTH.min} to {PASSWORD_LENGTH.max} characters
                </span>
              </span>
              <input
                id="password-length"
                type="number"
                min={PASSWORD_LENGTH.min}
                max={PASSWORD_LENGTH.max}
                className={`${control} w-20`}
                value={settings.passwordLength}
                onChange={(event) => {
                  const length = Number(event.target.value);
                  if (
                    length >= PASSWORD_LENGTH.min &&
                    length <= PASSWORD_LENGTH.max
                  ) {
                    updateSettings({ passwordLength: length });
                  }
                }}
              />
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold">Site presets</h2>
            <p className="text-sm text-ink-muted">
              Always use the same value for a field on a site, like a fixed test
              email.
            </p>
          </div>

          <form
            onSubmit={addPreset}
            className={`${card} flex flex-wrap items-end gap-3 p-4`}
          >
            <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-ink-muted">
              Site
              <input
                id="preset-site"
                className={control}
                placeholder="signup.acme.test"
                value={site}
                onChange={(event) => setSite(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Field
              <select
                id="preset-field"
                className={control}
                value={type}
                onChange={(event) => setType(event.target.value as FieldType)}
              >
                {PRESET_FIELDS.map((field) => (
                  <option key={field.type} value={field.type}>
                    {field.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-ink-muted">
              Value
              <input
                id="preset-value"
                className={`${control} font-mono`}
                placeholder="qa+login@example.com"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </label>
            <button
              type="submit"
              className="h-9 rounded-md bg-dummy-yellow px-4 text-sm font-medium text-ink-on-accent hover:bg-dummy-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow"
            >
              Save preset
            </button>
            {error && (
              <p role="alert" className="w-full text-sm text-danger">
                {error}
              </p>
            )}
          </form>

          {Object.keys(presets).length === 0 ? (
            <p className="text-sm text-ink-muted">No presets yet.</p>
          ) : (
            Object.entries(presets).map(([host, values]) => (
              <div key={host} className={`${card} px-4`}>
                <h3 className="py-3 font-mono text-sm">{host}</h3>
                <ul className="divide-y divide-line border-t border-line">
                  {Object.entries(values).map(([field, preset]) => (
                    <li
                      key={field}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <span className="w-28 shrink-0 text-sm text-ink-muted">
                        {FIELD_LABEL[field as FieldType]}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-mono text-sm">
                        {preset}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePreset(host, field as FieldType)}
                        aria-label={`Delete ${FIELD_LABEL[field as FieldType]} preset for ${host}`}
                        className="rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-surface-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
          <span>Settings are saved in this browser. Nothing leaves it.</span>
          <a
            href={REPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="text-dummy-yellow-text hover:underline"
          >
            Report a problem
          </a>
        </footer>
      </main>
    </div>
  );
}
