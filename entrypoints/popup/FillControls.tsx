import { GhostButton } from "@/src/components/GhostButton";
import { Toggle } from "@/src/components/Toggle";

interface FillControlsProps {
  overwrite: boolean;
  shortcut?: string;
  onOverwriteChange: (overwrite: boolean) => void;
  onFill: () => void;
  onSetShortcut: () => void;
}

export function FillControls({
  overwrite,
  shortcut,
  onOverwriteChange,
  onFill,
  onSetShortcut,
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
        {shortcut && (
          <kbd className="rounded-sm border border-ink-on-accent/20 px-1.5 py-0.5 font-mono text-[11px]">
            {shortcut}
          </kbd>
        )}
      </button>
      {shortcut === "" && (
        <p className="flex items-center justify-between gap-2 text-xs text-ink-muted">
          No keyboard shortcut yet
          <GhostButton onClick={onSetShortcut}>Set a shortcut</GhostButton>
        </p>
      )}
    </section>
  );
}
