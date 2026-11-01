import { type FormEvent, useState } from "react";
import type { FieldType } from "@/src/detect/types";
import { PRESET_FIELDS, siteOf } from "@/src/storage/settings";
import { card, control } from "./styles";

const fieldLabel = "flex flex-col gap-1 text-xs text-ink-muted";

interface PresetFormProps {
  onAdd: (site: string, type: FieldType, value: string) => void;
}

export function PresetForm({ onAdd }: PresetFormProps) {
  const [site, setSite] = useState("");
  const [type, setType] = useState<FieldType>("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const host = siteOf(site);
    if (!host) return setError("Enter a site like signup.acme.test.");
    if (!value.trim()) return setError("Enter the value to use.");
    onAdd(host, type, value);
    setValue("");
    setError("");
  };

  return (
    <form
      onSubmit={submit}
      className={`${card} flex flex-wrap items-end gap-3 p-4`}
    >
      <label className={`${fieldLabel} min-w-40 flex-1`}>
        Site
        <input
          className={control}
          placeholder="signup.acme.test"
          value={site}
          onChange={(event) => setSite(event.target.value)}
        />
      </label>
      <label className={fieldLabel}>
        Field
        <select
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
      <label className={`${fieldLabel} min-w-40 flex-1`}>
        Value
        <input
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
        Add preset
      </button>
      {error && (
        <p role="alert" className="w-full text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
