import type { Faker } from "@faker-js/faker";
import type { DetectedField, FieldType } from "../detect/types";
import { fitValue, formatDate, formatPhone } from "./format";
import type { Persona } from "./types";

export type FieldRequest = Pick<DetectedField, "type" | "format" | "signals">;

export interface GenerateContext {
  faker: Faker;
  persona: Persona;
  now: Date;
  passwordLength?: number;
  preset?: Partial<Record<FieldType, string>>;
}

const PASSWORD_SETS = [
  "abcdefghijkmnpqrstuvwxyz",
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "23456789",
  "!@#$%&*?",
];

function password(
  faker: Faker,
  field: FieldRequest,
  preferred: number,
): string {
  const { min, max } = field.format.length ?? {};
  const length = Math.min(
    Math.max(preferred, min ?? 0),
    max ?? Number.POSITIVE_INFINITY,
  );
  const required = PASSWORD_SETS.map((set) =>
    faker.helpers.arrayElement([...set]),
  );
  const all = PASSWORD_SETS.join("");
  const rest = Array.from(
    { length: Math.max(0, length - required.length) },
    () => faker.helpers.arrayElement([...all]),
  );
  return faker.helpers
    .shuffle([...required, ...rest])
    .join("")
    .slice(0, length);
}

function number(faker: Faker, field: FieldRequest): string {
  const min = Number(field.signals.min ?? 1);
  const max = Number(field.signals.max ?? 100);
  const step = Number(field.signals.step ?? 1);
  const low = Number.isFinite(min) ? min : 1;
  const high = Number.isFinite(max) && max >= low ? max : low + 99;
  const size = Number.isFinite(step) && step > 0 ? step : 1;
  const steps = Math.floor((high - low) / size);
  return String(low + faker.number.int({ min: 0, max: steps }) * size);
}

function upcomingDate(faker: Faker, now: Date): Persona["birthday"] {
  const date = new Date(now);
  date.setDate(date.getDate() + faker.number.int({ min: 1, max: 90 }));
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function rawValue(
  field: FieldRequest,
  { faker, persona, now, passwordLength = 12 }: GenerateContext,
): string | undefined {
  switch (field.type) {
    case "firstName":
      return persona.firstName;
    case "middleName":
      return persona.middleName;
    case "lastName":
      return persona.lastName;
    case "fullName":
      return `${persona.firstName} ${persona.lastName}`;
    case "username":
      return persona.username;
    case "email":
      return persona.email;
    case "phone":
      return formatPhone(persona.phone, field.format);
    case "street":
      return persona.street;
    case "barangay":
      return persona.place.district;
    case "city":
      return persona.place.city;
    case "province":
      return persona.place.province;
    case "zip":
      return persona.place.zip;
    case "country":
      return persona.country;
    case "birthday":
      return formatDate(persona.birthday, field.format);
    case "date":
      return formatDate(upcomingDate(faker, now), field.format);
    case "password":
      return password(faker, field, passwordLength);
    case "url":
      return persona.website;
    case "number":
      return number(faker, field);
    case "company":
      return persona.company;
    case "textarea":
      return faker.lorem.sentences(2);
    case "unknown":
      return faker.lorem.words(2);
    case "select":
    case "checkbox":
    case "radio":
      return undefined;
  }
}

export function generateValue(
  field: FieldRequest,
  context: GenerateContext,
): string | undefined {
  const preset = context.preset?.[field.type];
  if (preset) return preset;
  const value = rawValue(field, context);
  return value === undefined ? undefined : fitValue(value, field.format);
}
