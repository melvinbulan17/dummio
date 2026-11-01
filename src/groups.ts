import type { FieldType } from "./detect/types";

export type FieldGroup =
  | "person"
  | "contact"
  | "address"
  | "date"
  | "number"
  | "secret"
  | "choice"
  | "unknown";

const GROUP_OF: Record<FieldType, FieldGroup> = {
  firstName: "person",
  middleName: "person",
  lastName: "person",
  fullName: "person",
  username: "person",
  company: "person",
  email: "contact",
  phone: "contact",
  url: "contact",
  street: "address",
  barangay: "address",
  city: "address",
  province: "address",
  zip: "address",
  country: "address",
  birthday: "date",
  date: "date",
  number: "number",
  password: "secret",
  textarea: "choice",
  select: "choice",
  checkbox: "choice",
  radio: "choice",
  unknown: "unknown",
};

export const GROUP_LABELS: Record<FieldGroup, string> = {
  person: "Person",
  contact: "Contact",
  address: "Address",
  date: "Date",
  number: "Number",
  secret: "Secret",
  choice: "Other",
  unknown: "Not recognised",
};

export function groupOf(type: FieldType): FieldGroup {
  return GROUP_OF[type];
}

export function countByGroup(
  types: FieldType[],
): { group: FieldGroup; count: number }[] {
  const counts = new Map<FieldGroup, number>();
  for (const type of types) {
    const group = groupOf(type);
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  return (Object.keys(GROUP_LABELS) as FieldGroup[])
    .filter((group) => counts.has(group))
    .map((group) => ({ group, count: counts.get(group) ?? 0 }));
}
