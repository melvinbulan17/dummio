import { useState } from "react";
import { FieldRow } from "@/src/components/FieldRow";
import { GhostButton } from "@/src/components/GhostButton";
import type { FillReport } from "@/src/fill/fill";
import { groupOf } from "@/src/groups";
import type { ScannedField } from "@/src/messages";

const VISIBLE_ROWS = 5;

interface FieldListProps {
  fields: ScannedField[];
  report?: FillReport;
}

export function FieldList({ fields, report }: FieldListProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? fields : fields.slice(0, VISIBLE_ROWS);
  return (
    <>
      <ul className="flex flex-col gap-0.5 px-1 pt-3">
        {visible.map((field, index) => {
          const result = report?.fields.find((item) => item.ref === field.ref);
          return (
            <FieldRow
              key={field.ref}
              index={index}
              label={field.label}
              group={groupOf(field.type)}
              value={result?.value}
              status={result?.status}
            />
          );
        })}
      </ul>
      {visible.length < fields.length && (
        <GhostButton
          className="mx-4 mt-1 self-start"
          onClick={() => setShowAll(true)}
        >
          Show all {fields.length}
        </GhostButton>
      )}
    </>
  );
}
