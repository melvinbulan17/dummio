import { GhostButton } from "@/src/components/GhostButton";
import type { FieldType } from "@/src/detect/types";
import { PRESET_FIELDS, type Presets } from "@/src/storage/settings";
import { card } from "./styles";

const FIELD_LABEL = Object.fromEntries(
  PRESET_FIELDS.map(({ type, label }) => [type, label]),
) as Record<FieldType, string>;

interface PresetListProps {
  presets: Presets;
  onRemove: (site: string, type: FieldType) => void;
}

export function PresetList({ presets, onRemove }: PresetListProps) {
  const sites = Object.entries(presets);
  if (sites.length === 0) {
    return <p className="text-sm text-ink-muted">No presets yet.</p>;
  }
  return sites.map(([site, values]) => (
    <div key={site} className={`${card} px-4`}>
      <h3 className="py-3 font-mono text-sm">{site}</h3>
      <ul className="divide-y divide-line border-t border-line">
        {(Object.entries(values) as [FieldType, string][]).map(
          ([type, value]) => (
            <li
              key={type}
              className="flex items-center justify-between gap-3 py-2"
            >
              <span className="w-28 shrink-0 text-sm text-ink-muted">
                {FIELD_LABEL[type]}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-sm">
                {value}
              </span>
              <GhostButton
                onClick={() => onRemove(site, type)}
                aria-label={`Delete ${FIELD_LABEL[type]} preset for ${site}`}
              >
                Delete
              </GhostButton>
            </li>
          ),
        )}
      </ul>
    </div>
  ));
}
