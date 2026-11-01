import type { Faker } from "@faker-js/faker";

const PLACEHOLDER = /^\s*(-+|select|choose|pick|please|pumili)\b/i;

const MONTHS = [
  ["january", "jan", "enero"],
  ["february", "feb", "pebrero"],
  ["march", "mar", "marso"],
  ["april", "apr", "abril"],
  ["may", "mayo"],
  ["june", "jun", "hunyo"],
  ["july", "jul", "hulyo"],
  ["august", "aug", "agosto"],
  ["september", "sep", "sept", "setyembre"],
  ["october", "oct", "oktubre"],
  ["november", "nov", "nobyembre"],
  ["december", "dec", "disyembre"],
];

export function usableOptions(select: HTMLSelectElement): HTMLOptionElement[] {
  return Array.from(select.options).filter(
    (option) =>
      !option.disabled && option.value !== "" && !PLACEHOLDER.test(option.text),
  );
}

export function isSelectEmpty(select: HTMLSelectElement): boolean {
  const selected = select.selectedOptions[0];
  return !selected || !usableOptions(select).includes(selected);
}

function matches(
  option: HTMLOptionElement,
  wanted: string,
  isMonth: boolean,
): boolean {
  const target = wanted.trim().toLowerCase();
  const candidates = [option.value, option.text].map((text) =>
    text.trim().toLowerCase(),
  );
  if (candidates.includes(target)) return true;
  const number = Number(target);
  if (!Number.isInteger(number)) return false;
  if (candidates.some((text) => text !== "" && Number(text) === number))
    return true;
  const names = isMonth ? MONTHS[number - 1] : undefined;
  return !!names && candidates.some((text) => names.includes(text));
}

export function chooseOption(
  select: HTMLSelectElement,
  faker: Faker,
  wanted?: string,
  isMonth = false,
): HTMLOptionElement | undefined {
  const options = usableOptions(select);
  if (options.length === 0) return undefined;
  if (wanted) {
    const match = options.find((option) => matches(option, wanted, isMonth));
    if (match) return match;
  }
  return faker.helpers.arrayElement(options);
}
