import type { FieldStatus } from "@/src/fill/fill";
import type { FieldGroup } from "@/src/groups";
import { GroupDot } from "./GroupDot";

interface FieldRowProps {
  label: string;
  group: FieldGroup;
  index: number;
  value?: string;
  status?: FieldStatus;
}

export function FieldRow({
  label,
  group,
  index,
  value,
  status,
}: FieldRowProps) {
  const filled = status === "filled";
  return (
    <li
      className={`grid min-h-9 grid-cols-[auto_6rem_minmax(0,1fr)] items-center gap-2 rounded-md px-3 ${filled ? "animate-filled" : ""}`}
      style={filled ? { animationDelay: `${index * 30}ms` } : undefined}
    >
      <GroupDot group={status === "rejected" ? "unknown" : group} />
      <span className="truncate text-[13px] text-ink-muted" title={label}>
        {label}
      </span>
      {status === "rejected" ? (
        <span className="truncate text-[13px] text-warning">Not accepted</span>
      ) : value ? (
        <span
          className="truncate font-mono text-[13px] text-ink tabular-nums"
          title={value}
        >
          {value}
        </span>
      ) : status === "skipped" ? (
        <span className="text-[13px] text-ink-muted">Left as is</span>
      ) : (
        <span
          aria-hidden="true"
          className="block h-2.5 rounded-sm bg-skeleton"
          style={{ width: `${45 + ((index * 17) % 45)}%` }}
        />
      )}
    </li>
  );
}
