import { detectField, detectFields, fieldLabel } from "../detect/detect";
import type {
  DetectedField,
  FieldFormat,
  FieldType,
  FormField,
} from "../detect/types";
import { createFaker, createPersona } from "../generate/persona";
import type { Locale } from "../generate/types";
import { type GenerateContext, generateValue } from "../generate/values";
import { chooseOption, isSelectEmpty } from "./choose";
import { check, writeSelect, writeText } from "./write";

export interface FillOptions {
  locale: Locale;
  overwrite: boolean;
  seed?: number;
  now?: Date;
}

export type FieldStatus = "filled" | "skipped" | "rejected";

export interface FieldResult {
  ref: number;
  type: FieldType;
  label: string;
  value?: string;
  status: FieldStatus;
}

export interface FillReport {
  seed: number;
  ms: number;
  fields: FieldResult[];
}

type Outcome = Pick<FieldResult, "value" | "status">;

function radioGroup(element: HTMLInputElement): HTMLInputElement[] {
  if (!element.name) return [element];
  const root = element.getRootNode() as Document | ShadowRoot;
  const selector = `input[type="radio"][name="${CSS.escape(element.name)}"]`;
  return Array.from(root.querySelectorAll<HTMLInputElement>(selector)).filter(
    (radio) => !radio.disabled,
  );
}

function isEmpty(element: FormField): boolean {
  if (element instanceof HTMLSelectElement) return isSelectEmpty(element);
  if (element instanceof HTMLInputElement && element.type === "radio") {
    return radioGroup(element).every((radio) => !radio.checked);
  }
  if (element instanceof HTMLInputElement && element.type === "checkbox") {
    return !element.checked;
  }
  return element.value === "";
}

function alternateFormats({ type, format }: DetectedField): FieldFormat[] {
  if ((type === "birthday" || type === "date") && !format.part) {
    return (["mdy", "dmy", "ymd"] as const)
      .filter((order) => order !== (format.dateOrder ?? "mdy"))
      .map((dateOrder) => ({ ...format, dateOrder }));
  }
  if (type === "phone") {
    return (["intl", "local11", "local10"] as const)
      .filter((style) => style !== format.phoneStyle)
      .map((phoneStyle) => ({ ...format, phoneStyle }));
  }
  return [];
}

function fillText(field: DetectedField, context: GenerateContext): Outcome {
  const element = field.element as HTMLInputElement | HTMLTextAreaElement;
  for (const format of [field.format, ...alternateFormats(field)]) {
    const value = generateValue({ ...field, format }, context);
    if (value === undefined) return { status: "skipped" };
    writeText(element, value);
    if (element.checkValidity()) return { value, status: "filled" };
  }
  return { value: element.value, status: "rejected" };
}

function fillSelect(field: DetectedField, context: GenerateContext): Outcome {
  const element = field.element as HTMLSelectElement;
  const wanted = generateValue(field, context);
  const isMonth = field.format.part === "month";
  const option = chooseOption(element, context.faker, wanted, isMonth);
  if (!option) return { status: "skipped" };
  writeSelect(element, option);
  return { value: option.text, status: "filled" };
}

function fillChoice(
  field: DetectedField,
  context: GenerateContext,
  pickedGroups: Set<string>,
): Outcome {
  const element = field.element as HTMLInputElement;
  if (element.type === "radio") {
    const group = element.name || `#${field.ref}`;
    if (pickedGroups.has(group)) return { status: "skipped" };
    pickedGroups.add(group);
    const choice = context.faker.helpers.arrayElement(radioGroup(element));
    check(choice);
    return { value: choice.value, status: "filled" };
  }
  if (!element.required && !context.faker.datatype.boolean()) {
    return { status: "skipped" };
  }
  check(element);
  return { value: "checked", status: "filled" };
}

function fillOne(
  field: DetectedField,
  overwrite: boolean,
  context: GenerateContext,
  pickedGroups: Set<string>,
): FieldResult {
  const base = { ref: field.ref, type: field.type, label: fieldLabel(field) };
  if (!overwrite && !isEmpty(field.element)) {
    return { ...base, status: "skipped" };
  }
  if (field.type === "checkbox" || field.type === "radio") {
    return { ...base, ...fillChoice(field, context, pickedGroups) };
  }
  if (field.element instanceof HTMLSelectElement) {
    return { ...base, ...fillSelect(field, context) };
  }
  return { ...base, ...fillText(field, context) };
}

function setup(options: FillOptions) {
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const now = options.now ?? new Date();
  const faker = createFaker(seed);
  const persona = createPersona(faker, options.locale, now);
  return { seed, context: { faker, persona, now } };
}

export function fillPage(
  options: FillOptions,
  root: Document | ShadowRoot | Element = document,
): FillReport {
  const start = performance.now();
  const { seed, context } = setup(options);
  const pickedGroups = new Set<string>();
  const fields = detectFields(root).map((field) =>
    fillOne(field, options.overwrite, context, pickedGroups),
  );
  return { seed, ms: Math.round(performance.now() - start), fields };
}

export function fillField(
  element: FormField,
  options: FillOptions,
): FieldResult {
  const { context } = setup(options);
  return fillOne(detectField(element), true, context, new Set());
}
