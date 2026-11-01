interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelledBy: string;
}

export function Toggle({ checked, onChange, labelledBy }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow ${checked ? "border-dummy-yellow bg-dummy-yellow" : "border-line-strong bg-surface-100"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-3.5 rounded-full transition-transform ${checked ? "translate-x-4 bg-ink-on-accent" : "bg-ink-muted"}`}
      />
    </button>
  );
}
