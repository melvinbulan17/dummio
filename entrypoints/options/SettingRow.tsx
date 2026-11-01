import type { ReactNode } from "react";

interface SettingRowProps {
  id: string;
  title: string;
  hint: string;
  children: ReactNode;
}

export function SettingRow({ id, title, hint, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span id={id}>
        <span className="block">{title}</span>
        <span className="block text-xs text-ink-muted">{hint}</span>
      </span>
      {children}
    </div>
  );
}
