import type { Locale, Place } from "../types";
import phPlaces from "./ph-places.json";
import { US_AREA_CODES, US_STATE_NAMES } from "./us";
import usPlaces from "./us-places.json";

export interface PlaceEntry {
  city: string;
  province: string;
  zip: string;
  districts: string[];
  areaCode?: string;
}

type Grouped = Record<string, [string, string, string[]][]>;

function flatten(
  groups: Grouped,
  areaCodes?: Record<string, string>,
): PlaceEntry[] {
  return Object.entries(groups).flatMap(([province, places]) =>
    places.map(([city, zip, districts]) => ({
      city,
      province,
      zip,
      districts,
      areaCode: areaCodes?.[province],
    })),
  );
}

export const PLACES: Record<Locale, PlaceEntry[]> = {
  ph: flatten(phPlaces as unknown as Grouped),
  us: flatten(usPlaces as unknown as Grouped, US_AREA_CODES),
};

export function toPlace(entry: PlaceEntry, district: string): Place {
  return {
    district,
    city: entry.city,
    province: entry.province,
    zip: entry.zip,
    areaCode: entry.areaCode,
  };
}

export function placeKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(province of|city of|city)\b/g, "")
    .replace(/[^a-z]/g, "");
}

export function provinceNames({ province }: { province: string }): string[] {
  const name = US_STATE_NAMES[province];
  return name ? [province, name] : [province];
}
