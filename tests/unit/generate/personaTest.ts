import { describe, expect, it } from "vitest";
import {
  PH_LAST_NAMES,
  PH_MOBILE_PREFIXES,
  PH_PLACES,
} from "@/src/generate/data/ph";
import { US_PLACES } from "@/src/generate/data/us";
import {
  createFaker,
  createPersona,
  EMAIL_DOMAINS,
  slug,
} from "@/src/generate/persona";

const now = new Date(2026, 10, 1);

describe("createPersona", () => {
  it("gives the same person for the same seed", () => {
    const a = createPersona(createFaker(42), "ph", now);
    const b = createPersona(createFaker(42), "ph", now);
    expect(a).toEqual(b);
  });

  it("gives a different person for another seed", () => {
    const a = createPersona(createFaker(1), "ph", now);
    const b = createPersona(createFaker(2), "ph", now);
    expect(a).not.toEqual(b);
  });

  it.each(Array.from({ length: 20 }, (_, seed) => seed))(
    "builds a consistent Philippine person (seed %i)",
    (seed) => {
      const person = createPersona(createFaker(seed), "ph", now);
      expect(PH_PLACES).toContainEqual(person.place);
      expect(PH_LAST_NAMES).toContain(person.middleName);
      expect(person.middleName).not.toBe(person.lastName);
      expect(person.email).toMatch(
        new RegExp(
          `^${slug(person.firstName)}\\.${slug(person.lastName)}\\d{2}@`,
        ),
      );
      expect(EMAIL_DOMAINS).toContain(person.email.split("@")[1]);
      expect(person.phone.countryCode).toBe("63");
      expect(person.phone.national).toMatch(/^\d{10}$/);
      expect(PH_MOBILE_PREFIXES).toContain(person.phone.national.slice(0, 3));
      const age = now.getFullYear() - person.birthday.year;
      expect(age).toBeGreaterThanOrEqual(18);
      expect(age).toBeLessThanOrEqual(65);
      const date = new Date(
        person.birthday.year,
        person.birthday.month - 1,
        person.birthday.day,
      );
      expect(date.getDate()).toBe(person.birthday.day);
    },
  );

  it("builds a US person with a fictional 555-01 number in the place's area code", () => {
    const person = createPersona(createFaker(7), "us", now);
    expect(US_PLACES).toContainEqual(person.place);
    expect(person.country).toBe("United States");
    expect(person.phone.countryCode).toBe("1");
    expect(person.phone.national).toMatch(
      new RegExp(`^${person.place.areaCode}55501\\d{2}$`),
    );
  });
});

describe("slug", () => {
  it("drops spaces, accents and punctuation", () => {
    expect(slug("Dela Cruz")).toBe("delacruz");
    expect(slug("Osmeña")).toBe("osmena");
    expect(slug("John Paul")).toBe("johnpaul");
  });
});
