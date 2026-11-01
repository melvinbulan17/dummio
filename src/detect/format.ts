import type { FieldFormat, FieldSignals, FieldType } from "./types";

const DATE_HINT = /\b(dd|mm|yyyy|yy)([./\- ]?)(dd|mm)\2(yyyy|yy|dd)\b/i;
const DIGITS_ONLY_PATTERN = /^\^?(?:\[0-9\]|\\d)(?:\*|\+|\{\d+(?:,\d*)?\})\$?$/;
const DATE_TYPES = new Set<FieldType>(["birthday", "date"]);

function readDateOrder(
  signals: FieldSignals,
): Pick<FieldFormat, "dateOrder" | "separator"> {
  if (signals.inputType === "date") return { dateOrder: "ymd", separator: "-" };
  for (const source of [
    signals.placeholder,
    signals.labelText,
    signals.ariaLabel,
    signals.pattern,
  ]) {
    const match = source?.match(DATE_HINT);
    if (!match) continue;
    const [, first = "", separator = "", second = "", third = ""] = match;
    const order = `${first[0]}${second[0]}${third[0]}`.toLowerCase();
    if (order === "ymd" || order === "mdy" || order === "dmy") {
      return { dateOrder: order, separator };
    }
  }
  return {};
}

function readPhoneStyle(signals: FieldSignals): FieldFormat["phoneStyle"] {
  const prefix = `${signals.prefixText ?? ""} ${signals.labelText ?? ""}`;
  if (/\+\s?63\b/.test(signals.prefixText ?? "")) return "local10";
  if (signals.maxLength === 10) return "local10";
  if (signals.maxLength === 11) return "local11";
  const placeholder = signals.placeholder?.replace(/\s/g, "") ?? "";
  if (/^09/.test(placeholder)) return "local11";
  if (/^9\d/.test(placeholder) && /\+\s?63/.test(prefix)) return "local10";
  if (/^\+/.test(placeholder)) return "intl";
  return undefined;
}

function readDigitsOnly(signals: FieldSignals): boolean | undefined {
  if (signals.pattern && DIGITS_ONLY_PATTERN.test(signals.pattern)) return true;
  if (signals.inputMode === "numeric") return true;
  return undefined;
}

function readLength(signals: FieldSignals): FieldFormat["length"] {
  if (signals.minLength === undefined && signals.maxLength === undefined)
    return undefined;
  return { min: signals.minLength, max: signals.maxLength };
}

export function detectFormat(
  signals: FieldSignals,
  type: FieldType,
): FieldFormat {
  const format: FieldFormat = {};
  if (DATE_TYPES.has(type)) {
    Object.assign(format, readDateOrder(signals));
    if (signals.datePart) format.part = signals.datePart;
  }
  if (type === "phone") {
    const phoneStyle = readPhoneStyle(signals);
    if (phoneStyle) format.phoneStyle = phoneStyle;
    if (phoneStyle === "local10" || phoneStyle === "local11")
      format.digitsOnly = true;
  }
  const digitsOnly = readDigitsOnly(signals);
  if (digitsOnly) format.digitsOnly = true;
  const length = readLength(signals);
  if (length) format.length = length;
  return format;
}
