import { tokenize } from "./tokens";
import type { DatePart, FieldSignals, FormField } from "./types";

const DATE_PART_TOKENS: Record<string, DatePart> = {
  day: "day",
  dd: "day",
  araw: "day",
  month: "month",
  mm: "month",
  buwan: "month",
  year: "year",
  yyyy: "year",
  yy: "year",
  taon: "year",
};

function cleanText(text: string | null | undefined): string | undefined {
  const value = text?.replace(/\s+/g, " ").trim();
  return value ? value : undefined;
}

function ownText(element: Element): string {
  let text = "";
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) text += ` ${node.textContent ?? ""}`;
    else if (
      node instanceof Element &&
      !(node instanceof HTMLInputElement) &&
      !(node instanceof HTMLSelectElement) &&
      !(node instanceof HTMLTextAreaElement)
    ) {
      text += ` ${ownText(node)}`;
    }
  }
  return text;
}

function readLabelText(field: FormField): string | undefined {
  const root = field.getRootNode() as Document | ShadowRoot;
  const labelledBy = field.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => root.getElementById?.(id)?.textContent ?? "")
      .join(" ");
    const cleaned = cleanText(text);
    if (cleaned) return cleaned;
  }
  const labels = field.labels ? Array.from(field.labels) : [];
  const wrapping = field.closest("label");
  if (wrapping && !labels.includes(wrapping)) labels.push(wrapping);
  return cleanText(labels.map(ownText).join(" "));
}

function readPrefixText(field: FormField): string | undefined {
  const previous = cleanText(field.previousElementSibling?.textContent);
  if (previous && previous.length <= 6) return previous;
  return undefined;
}

function readNumber(field: FormField, attribute: string): number | undefined {
  const raw = field.getAttribute(attribute);
  if (raw === null) return undefined;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function readDatePart(
  ...sources: (string | undefined)[]
): DatePart | undefined {
  for (const source of sources) {
    for (const token of tokenize(source)) {
      const part = DATE_PART_TOKENS[token];
      if (part) return part;
    }
  }
  return undefined;
}

export function readSignals(field: FormField): FieldSignals {
  const attr = (name: string) => cleanText(field.getAttribute(name));
  const tag = field.tagName.toLowerCase() as FieldSignals["tag"];
  const name = attr("name");
  const id = attr("id");
  const labelText = readLabelText(field);
  const ariaLabel = attr("aria-label");
  return {
    tag,
    inputType: field instanceof HTMLInputElement ? field.type : undefined,
    autocomplete: attr("autocomplete")?.toLowerCase(),
    name,
    id,
    placeholder: attr("placeholder"),
    ariaLabel,
    labelText,
    pattern: attr("pattern"),
    minLength: readNumber(field, "minlength"),
    maxLength: readNumber(field, "maxlength"),
    min: attr("min"),
    max: attr("max"),
    step: attr("step"),
    inputMode: attr("inputmode")?.toLowerCase(),
    prefixText: readPrefixText(field),
    datePart: readDatePart(name, id, labelText, ariaLabel),
  };
}
