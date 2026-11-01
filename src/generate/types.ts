export type Locale = "ph" | "us";

export interface Place {
  district: string;
  city: string;
  province: string;
  zip: string;
  areaCode?: string;
}

export interface Persona {
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  email: string;
  phone: { countryCode: string; national: string };
  birthday: { year: number; month: number; day: number };
  street: string;
  place: Place;
  country: string;
  company: string;
  website: string;
}
