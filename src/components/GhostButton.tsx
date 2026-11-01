import type { ButtonHTMLAttributes } from "react";

export function GhostButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-surface-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow ${className}`}
      {...props}
    />
  );
}
