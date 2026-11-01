import { Toggle } from "@/src/components/Toggle";
import { PASSWORD_LENGTH, type Settings } from "@/src/storage/settings";
import { SettingRow } from "./SettingRow";
import { card, control } from "./styles";

interface FillSettingsProps {
  settings: Settings;
  onChange: (change: Partial<Settings>) => void;
}

export function FillSettings({ settings, onChange }: FillSettingsProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">Fill settings</h2>
      <div className={`${card} divide-y divide-line px-4`}>
        <SettingRow
          id="locale-label"
          title="Data locale"
          hint="Names, phone numbers and addresses"
        >
          <select
            aria-labelledby="locale-label"
            className={control}
            value={settings.locale}
            onChange={(event) =>
              onChange({ locale: event.target.value as Settings["locale"] })
            }
          >
            <option value="ph">Philippines</option>
            <option value="us">United States</option>
          </select>
        </SettingRow>
        <SettingRow
          id="text-style-label"
          title="Long text"
          hint="Text areas and fields Dummio doesn’t recognise"
        >
          <select
            aria-labelledby="text-style-label"
            className={control}
            value={settings.textStyle}
            onChange={(event) =>
              onChange({
                textStyle: event.target.value as Settings["textStyle"],
              })
            }
          >
            <option value="realistic">Realistic sentences</option>
            <option value="lorem">Lorem ipsum</option>
          </select>
        </SettingRow>
        <SettingRow
          id="overwrite-label"
          title="Overwrite filled fields"
          hint="Replace values that are already there"
        >
          <Toggle
            checked={settings.overwrite}
            labelledBy="overwrite-label"
            onChange={(overwrite) => onChange({ overwrite })}
          />
        </SettingRow>
        <SettingRow
          id="password-length-label"
          title="Password length"
          hint={`${PASSWORD_LENGTH.min} to ${PASSWORD_LENGTH.max} characters`}
        >
          <input
            aria-labelledby="password-length-label"
            type="number"
            min={PASSWORD_LENGTH.min}
            max={PASSWORD_LENGTH.max}
            className={`${control} w-20`}
            value={settings.passwordLength}
            onChange={(event) => {
              const length = Number(event.target.value);
              if (
                length >= PASSWORD_LENGTH.min &&
                length <= PASSWORD_LENGTH.max
              ) {
                onChange({ passwordLength: length });
              }
            }}
          />
        </SettingRow>
      </div>
    </section>
  );
}
