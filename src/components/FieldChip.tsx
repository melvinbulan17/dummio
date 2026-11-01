import { type FieldGroup, GROUP_LABELS } from "@/src/groups";
import { GroupDot } from "./GroupDot";

export function FieldChip({
  group,
  count,
}: {
  group: FieldGroup;
  count: number;
}) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-sm bg-surface-100 px-2 text-xs font-medium ${group === "unknown" ? "text-warning" : "text-ink"}`}
    >
      <GroupDot group={group} />
      {GROUP_LABELS[group]} {count}
    </span>
  );
}
