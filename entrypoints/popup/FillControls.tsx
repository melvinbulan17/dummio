import { Toggle } from "@/src/components/Toggle";

interface FillControlsProps {
  overwrite: boolean;
  onOverwriteChange: (overwrite: boolean) => void;
  onFill: () => void;
}

export function FillControls({
  overwrite,
  onOverwriteChange,
  onFill,
}: FillControlsProps) {
  return (
    <section className="sticky bottom-0 flex flex-col gap-3 bg-surface-0 p-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span id="popup-overwrite">Overwrite filled fields</span>
        <Toggle
          checked={overwrite}
          labelledBy="popup-overwrite"
          onChange={onOverwriteChange}
        />
      </div>
      <button
        type="button"
        onClick={onFill}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-dummy-yellow font-medium text-ink-on-accent transition-colors hover:bg-dummy-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dummy-yellow"
      >
        Fill page
        <kbd className="rounded-sm border border-ink-on-accent/20 px-1.5 py-0.5 font-mono text-[11px]">
          Alt+Shift+F
        </kbd>
      </button>
    </section>
  );
}
