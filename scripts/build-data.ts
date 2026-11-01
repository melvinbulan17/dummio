import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { strFromU8, unzipSync } from "fflate";

const OUT = resolve(import.meta.dirname, "../src/generate/data");

const SOURCES = {
  phZip: "https://download.geonames.org/export/zip/PH.zip",
  usZip: "https://download.geonames.org/export/zip/US.zip",
  psgcProvinces: "https://psgc.gitlab.io/api/provinces/",
  psgcCities: "https://psgc.gitlab.io/api/cities-municipalities/",
  psgcBarangays: "https://psgc.gitlab.io/api/barangays/",
  usFemale:
    "https://www2.census.gov/topics/genealogy/1990surnames/dist.female.first",
  usMale:
    "https://www2.census.gov/topics/genealogy/1990surnames/dist.male.first",
  usSurnames: "https://www2.census.gov/topics/genealogy/2010surnames/names.zip",
};

const BARANGAYS_PER_PLACE = 3;
const US_PLACES_PER_STATE = 60;
const US_FIRST_NAMES = 300;
const US_SURNAMES = 1000;
const US_STATES = new Set(
  "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(
    " ",
  ),
);

type PsgcPlace = { code: string; name: string; provinceCode: string | false };
type PsgcBarangay = {
  name: string;
  cityCode: string | false;
  municipalityCode: string | false;
};
type Grouped = Record<string, [string, string, string[]][]>;

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function text(url: string): Promise<string> {
  return strFromU8(await download(url));
}

async function json<T>(url: string): Promise<T> {
  return JSON.parse(await text(url)) as T;
}

async function zipEntry(url: string, suffix: string): Promise<string> {
  const files = unzipSync(await download(url));
  const name = Object.keys(files).find((file) => file.endsWith(suffix));
  if (!name) throw new Error(`${suffix} not found in ${url}`);
  return strFromU8(files[name]!);
}

function tsv(content: string): string[][] {
  return content
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("\t"));
}

function titleCase(name: string): string {
  const word = name.charAt(0) + name.slice(1).toLowerCase();
  return word.startsWith("Mc") && word.length > 3
    ? `Mc${word.charAt(2).toUpperCase()}${word.slice(3)}`
    : word;
}

function key(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\bcity of\b|\bcity\b|\bprovince of\b/g, "")
    .replace(/[^a-z]/g, "");
}

function cityName(name: string): string {
  if (name === "City of Manila") return "Manila";
  const match = name.match(/^City of (.+)$/);
  return match ? `${match[1]} City` : name;
}

function spread<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  return Array.from(
    { length: count },
    (_, index) => items[Math.floor((index * items.length) / count)]!,
  );
}

function sortGroups(groups: Grouped): Grouped {
  return Object.fromEntries(
    Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, places]) => [
        group,
        places.sort(
          (a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]),
        ),
      ]),
  );
}

async function buildPhilippines(): Promise<Grouped> {
  const [rows, provinces, places, barangays] = await Promise.all([
    zipEntry(SOURCES.phZip, "PH.txt").then(tsv),
    json<{ code: string; name: string }[]>(SOURCES.psgcProvinces),
    json<PsgcPlace[]>(SOURCES.psgcCities),
    json<PsgcBarangay[]>(SOURCES.psgcBarangays),
  ]);

  const provinceName = new Map(provinces.map((p) => [p.code, p.name]));
  const barangaysOf = new Map<string, string[]>();
  for (const barangay of barangays) {
    const owner = barangay.cityCode || barangay.municipalityCode;
    if (!owner) continue;
    const list = barangaysOf.get(owner) ?? [];
    list.push(barangay.name.replace(/\s*\(Pob\.\)$/, "").trim());
    barangaysOf.set(owner, list);
  }

  const byNameAndProvince = new Map<string, PsgcPlace>();
  const byName = new Map<string, PsgcPlace[]>();
  for (const place of places) {
    const province = place.provinceCode
      ? (provinceName.get(place.provinceCode) ?? "")
      : "";
    byNameAndProvince.set(`${key(place.name)}|${key(province)}`, place);
    byName.set(key(place.name), [
      ...(byName.get(key(place.name)) ?? []),
      place,
    ]);
  }

  const groups: Grouped = {};
  const seen = new Set<string>();
  let unmatched = 0;
  for (const [, zip, placeName, region, , adminTwo, , adminThree] of rows) {
    if (!zip || !placeName || !region || /CPO|Post Office/.test(placeName))
      continue;
    let city: string;
    let province: string;
    let districts: string[];
    if (region === "Metro Manila") {
      city = cityName(adminThree || "City of Manila");
      province = "Metro Manila";
      districts = [placeName];
    } else {
      province = (adminTwo ?? "").replace(/^Province of /, "");
      city = placeName;
      const match =
        byNameAndProvince.get(`${key(placeName)}|${key(province)}`) ??
        (byName.get(key(placeName))?.length === 1
          ? byName.get(key(placeName))![0]
          : undefined);
      if (!match) {
        unmatched++;
        continue;
      }
      city = cityName(match.name);
      districts = spread(
        barangaysOf.get(match.code) ?? [],
        BARANGAYS_PER_PLACE,
      );
    }
    if (!province || districts.length === 0) continue;
    const id = `${city}|${province}|${districts.join()}`;
    if (seen.has(id)) continue;
    seen.add(id);
    (groups[province] ??= []).push([city, zip, districts]);
  }
  console.log(
    `PH: ${seen.size} places, ${unmatched} ZIP rows without a PSGC match`,
  );
  return sortGroups(groups);
}

async function buildUnitedStates(): Promise<Grouped> {
  const rows = tsv(await zipEntry(SOURCES.usZip, "US.txt"));
  const byState = new Map<string, string[][]>();
  for (const row of rows) {
    const state = row[4];
    if (!state || !US_STATES.has(state) || !row[2]) continue;
    byState.set(state, [...(byState.get(state) ?? []), row]);
  }
  const groups: Grouped = {};
  let total = 0;
  for (const [state, stateRows] of byState) {
    const cities = new Map<string, string[]>();
    for (const row of stateRows)
      if (!cities.has(row[2]!)) cities.set(row[2]!, row);
    const unique = [...cities.values()].sort((a, b) =>
      a[1]!.localeCompare(b[1]!),
    );
    const step = Math.max(1, Math.floor(unique.length / US_PLACES_PER_STATE));
    const picked = unique
      .filter((_, index) => index % step === 0)
      .slice(0, US_PLACES_PER_STATE);
    groups[state] = picked.map((row) => [
      row[2]!,
      row[1]!,
      row[5] ? [`${row[5]} County`] : [],
    ]);
    total += picked.length;
  }
  console.log(`US: ${total} places in ${byState.size} states`);
  return sortGroups(groups);
}

async function buildUsNames() {
  const firstNames = async (url: string) =>
    (await text(url))
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter((name): name is string => !!name)
      .slice(0, US_FIRST_NAMES)
      .map(titleCase);
  const [female, male, surnameCsv] = await Promise.all([
    firstNames(SOURCES.usFemale),
    firstNames(SOURCES.usMale),
    zipEntry(SOURCES.usSurnames, ".csv"),
  ]);
  const surnames = surnameCsv
    .split("\n")
    .slice(1)
    .map((line) => line.split(",")[0]?.trim())
    .filter((name): name is string => !!name && /^[A-Z]+$/.test(name))
    .slice(0, US_SURNAMES)
    .map(titleCase);
  console.log(
    `US names: ${female.length + male.length} first, ${surnames.length} last`,
  );
  return { firstNames: [...female, ...male].sort(), lastNames: surnames };
}

const [philippines, unitedStates, usNames] = await Promise.all([
  buildPhilippines(),
  buildUnitedStates(),
  buildUsNames(),
]);

await Promise.all([
  writeFile(resolve(OUT, "ph-places.json"), `${JSON.stringify(philippines)}\n`),
  writeFile(
    resolve(OUT, "us-places.json"),
    `${JSON.stringify(unitedStates)}\n`,
  ),
  writeFile(resolve(OUT, "us-names.json"), `${JSON.stringify(usNames)}\n`),
]);
