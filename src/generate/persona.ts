import { base, en, en_US, Faker } from "@faker-js/faker";
import {
  PH_FIRST_NAMES,
  PH_LAST_NAMES,
  PH_MOBILE_PREFIXES,
  PH_PLACES,
  PH_STREETS,
} from "./data/ph";
import { US_PLACES } from "./data/us";
import type { Locale, Persona } from "./types";

export const EMAIL_DOMAINS = ["example.com", "example.net", "example.org"];

export function createFaker(seed: number): Faker {
  const faker = new Faker({ locale: [en_US, en, base] });
  faker.seed(seed);
  return faker;
}

export function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function digits(faker: Faker, length: number): string {
  return faker.string.numeric({ length, allowLeadingZeros: true });
}

export function createPersona(
  faker: Faker,
  locale: Locale,
  now: Date,
): Persona {
  const pick = faker.helpers.arrayElement;
  const isPh = locale === "ph";

  const firstName = isPh ? pick(PH_FIRST_NAMES) : faker.person.firstName();
  const lastName = isPh ? pick(PH_LAST_NAMES) : faker.person.lastName();
  const middleName = isPh
    ? pick(PH_LAST_NAMES.filter((name) => name !== lastName))
    : faker.person.middleName();
  const place = pick(isPh ? PH_PLACES : US_PLACES);

  const year = now.getFullYear() - faker.number.int({ min: 18, max: 65 });
  const month = faker.number.int({ min: 1, max: 12 });
  const day = faker.number.int({ min: 1, max: daysInMonth(year, month) });

  const tag = digits(faker, 2);
  const first = slug(firstName);
  const last = slug(lastName);

  return {
    firstName,
    middleName,
    lastName,
    username: `${first}${last}${tag}`,
    email: `${first}.${last}${tag}@${pick(EMAIL_DOMAINS)}`,
    phone: isPh
      ? {
          countryCode: "63",
          national: `${pick(PH_MOBILE_PREFIXES)}${digits(faker, 7)}`,
        }
      : {
          countryCode: "1",
          national: `${place.areaCode}55501${digits(faker, 2)}`,
        },
    birthday: { year, month, day },
    street: isPh
      ? `${faker.number.int({ min: 1, max: 999 })} ${pick(PH_STREETS)} St.`
      : faker.location.streetAddress(),
    place,
    country: isPh ? "Philippines" : "United States",
    company: faker.company.name(),
    website: `https://${last}${tag}.example.com`,
  };
}
