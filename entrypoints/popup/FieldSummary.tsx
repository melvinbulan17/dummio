import { FieldChip } from "@/src/components/FieldChip";
import type { FillReport } from "@/src/fill/fill";
import { countByGroup } from "@/src/groups";
import type { ScannedField } from "@/src/messages";

interface FieldSummaryProps {
  fields: ScannedField[];
  report?: FillReport;
}

export function FieldSummary({ fields, report }: FieldSummaryProps) {
  const filled = report?.fields.filter((field) => field.status === "filled");
  return (
    <section className="flex flex-col gap-3 px-4 pt-4">
      <p className="flex items-baseline gap-2">
        <span className="text-[28px] leading-8 font-semibold tracking-tight tabular-nums">
          {filled ? filled.length : fields.length}
        </span>
        <span className="text-ink-muted">
          {report ? `of ${report.fields.length} fields filled` : "fields found"}
        </span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {countByGroup(fields.map((field) => field.type)).map(
          ({ group, count }) => (
            <FieldChip key={group} group={group} count={count} />
          ),
        )}
      </div>
    </section>
  );
}
