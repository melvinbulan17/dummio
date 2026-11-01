import { storage } from "wxt/utils/storage";
import type { FieldType } from "../detect/types";
import type { FillOptions } from "../fill/fill";
import type { Locale } from "../generate/types";
import type { TextStyle } from "../generate/values";

export interface Settings {
  locale: Locale;
  overwrite: boolean;
  passwordLength: number;
  textStyle: TextStyle;
}

export type PresetValues = NonNullable<FillOptions["preset"]>;
export type Presets = Record<string, PresetValues>;

export const DEFAULT_SETTINGS: Settings = {
  locale: "ph",
  overwrite: false,
  passwordLength: 12,
  textStyle: "realistic",
};

export const PASSWORD_LENGTH = { min: 8, max: 64 };

export const PRESET_FIELDS: { type: FieldType; label: string }[] = [
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
  { type: "password", label: "Password" },
  { type: "username", label: "Username" },
  { type: "firstName", label: "First name" },
  { type: "lastName", label: "Last name" },
  { type: "fullName", label: "Full name" },
  { type: "company", label: "Company" },
  { type: "street", label: "Street" },
  { type: "city", label: "City" },
  { type: "zip", label: "ZIP code" },
];

export const settingsItem = storage.defineItem<Settings>("sync:settings", {
  fallback: DEFAULT_SETTINGS,
});

export const presetsItem = storage.defineItem<Presets>("local:presets", {
  fallback: {},
});

export function siteOf(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return "";
  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
      .hostname;
  } catch {
    return "";
  }
}

export async function loadFillOptions(url?: string): Promise<FillOptions> {
  const [settings, presets] = await Promise.all([
    settingsItem.getValue(),
    presetsItem.getValue(),
  ]);
  const site = url ? siteOf(url) : "";
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    preset: presets[site] ?? {},
  };
}
