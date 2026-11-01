import type { Locale, Place } from "../types";
import phPlaces from "./ph-places.json";
import { US_AREA_CODES } from "./us";
import usPlaces from "./us-places.json";

interface PlaceEntry {
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
