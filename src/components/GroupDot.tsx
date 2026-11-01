import type { FieldGroup } from "@/src/groups";

const DOT_CLASS: Record<FieldGroup, string> = {
  person: "bg-type-person",
  contact: "bg-type-contact",
  address: "bg-type-address",
  date: "bg-type-date",
  number: "bg-type-number",
  secret: "bg-type-secret",
  choice: "bg-line-strong",
  unknown: "bg-warning",
};

export function GroupDot({ group }: { group: FieldGroup }) {
  return (
    <span
      aria-hidden="true"
      className={`size-2 shrink-0 rounded-full ${DOT_CLASS[group]}`}
    />
  );
}
