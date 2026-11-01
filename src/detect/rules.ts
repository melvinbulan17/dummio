import type { FieldType } from "./types";

export type ScoredType = Exclude<
  FieldType,
  "textarea" | "select" | "checkbox" | "radio" | "unknown"
>;

export interface KeywordRule {
  type: ScoredType;
  phrases?: string[];
  tokens?: string[];
  weight?: number;
}

export const AUTOCOMPLETE_TYPES: Record<string, ScoredType> = {
  "given-name": "firstName",
  "additional-name": "middleName",
  "family-name": "lastName",
  name: "fullName",
  username: "username",
  email: "email",
  tel: "phone",
  "tel-national": "phone",
  "tel-local": "phone",
  "street-address": "street",
  "address-line1": "street",
  "address-level4": "barangay",
  "address-level3": "barangay",
  "address-level2": "city",
  "address-level1": "province",
  "postal-code": "zip",
  country: "country",
  "country-name": "country",
  bday: "birthday",
  "new-password": "password",
  "current-password": "password",
  url: "url",
  organization: "company",
};

export const INPUT_TYPE_SCORES: Record<
  string,
  Partial<Record<ScoredType, number>>
> = {
  email: { email: 8 },
  tel: { phone: 8 },
  url: { url: 8 },
  password: { password: 8 },
  date: { date: 6, birthday: 6 },
  number: { number: 3 },
};

export const KEYWORD_RULES: KeywordRule[] = [
  {
    type: "firstName",
    phrases: ["first name", "given name", "unang pangalan"],
    tokens: ["fname", "firstname", "givenname", "forename"],
  },
  {
    type: "middleName",
    phrases: ["middle name", "gitnang pangalan"],
    tokens: ["mname", "middlename"],
  },
  {
    type: "lastName",
    phrases: ["last name", "family name"],
    tokens: ["lname", "lastname", "surname", "familyname", "apelyido"],
  },
  {
    type: "fullName",
    phrases: ["full name", "your name", "buong pangalan"],
    tokens: ["fullname"],
  },
  { type: "fullName", tokens: ["name", "pangalan"], weight: 0.5 },
  {
    type: "username",
    phrases: ["user name"],
    tokens: ["username", "userid", "login", "handle"],
  },
  {
    type: "email",
    phrases: ["e mail"],
    tokens: ["email", "mail", "emailaddress"],
  },
  {
    type: "phone",
    phrases: ["mobile number", "contact number", "phone number", "cell number"],
    tokens: [
      "phone",
      "mobile",
      "cell",
      "cellphone",
      "tel",
      "telephone",
      "telepono",
      "msisdn",
    ],
  },
  { type: "phone", tokens: ["contact"], weight: 0.5 },
  {
    type: "street",
    phrases: ["street address", "address line 1", "house number"],
    tokens: ["street", "address1", "addressline1", "kalye"],
  },
  { type: "street", tokens: ["address", "tirahan"], weight: 0.75 },
  { type: "barangay", tokens: ["barangay", "brgy"] },
  {
    type: "city",
    tokens: ["city", "town", "municipality", "lungsod", "bayan", "locality"],
  },
  {
    type: "province",
    tokens: ["province", "state", "region", "lalawigan", "probinsya"],
  },
  {
    type: "zip",
    phrases: ["postal code", "zip code"],
    tokens: ["zip", "zipcode", "postal", "postcode", "postalcode"],
  },
  { type: "country", tokens: ["country", "bansa"] },
  {
    type: "birthday",
    phrases: ["date of birth", "birth date", "petsa ng kapanganakan"],
    tokens: ["birthday", "birthdate", "dob", "bday", "kaarawan", "birth"],
  },
  {
    type: "date",
    tokens: ["date", "petsa", "day", "month", "year"],
    weight: 0.75,
  },
  { type: "password", tokens: ["password", "passwd", "pwd", "pass"] },
  { type: "url", tokens: ["url", "website", "homepage", "site", "link"] },
  {
    type: "company",
    tokens: [
      "company",
      "organization",
      "organisation",
      "employer",
      "business",
      "kumpanya",
    ],
  },
  { type: "number", tokens: ["age", "quantity", "qty", "amount", "count"] },
];

export const SOURCE_WEIGHTS = {
  labelText: 4,
  ariaLabel: 4,
  name: 3,
  id: 3,
  placeholder: 2,
} as const;

export const TIE_ORDER: ScoredType[] = [
  "email",
  "password",
  "birthday",
  "phone",
  "firstName",
  "middleName",
  "lastName",
  "username",
  "zip",
  "barangay",
  "city",
  "province",
  "country",
  "street",
  "company",
  "url",
  "date",
  "number",
  "fullName",
];
