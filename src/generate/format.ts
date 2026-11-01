import type { FieldFormat } from "../detect/types";
import type { Persona } from "./types";

const pad = (value: number) => String(value).padStart(2, "0");

export function formatDate(
  date: Persona["birthday"],
  format: FieldFormat,
): string {
  const year = String(date.year);
  const month = pad(date.month);
  const day = pad(date.day);
  if (format.part === "year") return year;
  if (format.part === "month") return month;
  if (format.part === "day") return day;
  const separator =
    format.separator ?? (format.dateOrder === "ymd" ? "-" : "/");
  switch (format.dateOrder) {
    case "ymd":
      return [year, month, day].join(separator);
    case "dmy":
      return [day, month, year].join(separator);
    default:
      return [month, day, year].join(separator);
  }
}

export function formatPhone(
  phone: Persona["phone"],
  format: FieldFormat,
): string {
  const { countryCode, national } = phone;
  const trunk = countryCode === "63" ? "0" : countryCode;
  const digitsOnlyStyle = countryCode === "63" ? "local11" : "local10";
  const style =
    format.phoneStyle ?? (format.digitsOnly ? digitsOnlyStyle : undefined);
  if (style === "local10") return national;
  if (style === "local11") return `${trunk}${national}`;
  if (countryCode === "63") {
    return `+63 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  }
  if (style === "intl") {
    return `+1 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  }
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

export function fitValue(value: string, format: FieldFormat): string {
  const shaped = format.digitsOnly ? value.replace(/\D/g, "") : value;
  const max = format.length?.max;
  return max !== undefined && shaped.length > max
    ? shaped.slice(0, max)
    : shaped;
}
