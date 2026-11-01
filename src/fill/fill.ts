import { detectField, detectFields, fieldLabel } from "../detect/detect";
import type {
  DetectedField,
  FieldFormat,
  FieldType,
  FormField,
} from "../detect/types";
import { createFaker, createPersona } from "../generate/persona";
import type { Locale } from "../generate/types";
import {
  type GenerateContext,
  generateValue,
  type TextStyle,
} from "../generate/values";
import { chooseOption, isSelectEmpty } from "./choose";
import { setChecked, writeSelect, writeText } from "./write";

export interface FillOptions {
  locale: Locale;
  overwrite: boolean;
  seed?: number;
  now?: Date;
  passwordLength?: number;
  textStyle?: TextStyle;
  preset?: Partial<Record<FieldType, string>>;
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

function suggestions(element: HTMLInputElement | HTMLTextAreaElement) {
  if (!(element instanceof HTMLInputElement) || !element.list) return [];
  return Array.from(element.list.options)
    .map((option) => option.value)
    .filter(Boolean);
}

function fillText(field: DetectedField, context: GenerateContext): Outcome {
  const element = field.element as HTMLInputElement | HTMLTextAreaElement;
  const listed = suggestions(element);
  if (listed.length > 0 && !context.preset?.[field.type]) {
    const value = context.faker.helpers.arrayElement(listed);
    writeText(element, value);
    return { value, status: element.checkValidity() ? "filled" : "rejected" };
  }
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
    if (!pickedGroups.has(group)) {
      pickedGroups.add(group);
      setChecked(context.faker.helpers.arrayElement(radioGroup(element)), true);
    }
    return {
      value: element.checked ? "Selected" : "Not selected",
      status: "filled",
    };
  }
  const checked = element.required || context.faker.datatype.boolean();
  setChecked(element, checked);
  return { value: checked ? "Checked" : "Unchecked", status: "filled" };
}

function fillOne(
  field: DetectedField,
  overwrite: boolean,
  context: GenerateContext,
  pickedGroups: Set<string>,
): FieldResult {
  const base = { ref: field.ref, type: field.type, label: fieldLabel(field) };
  if (field.type === "checkbox" || field.type === "radio") {
    return { ...base, ...fillChoice(field, context, pickedGroups) };
  }
  if (!overwrite && !isEmpty(field.element)) {
    return { ...base, status: "skipped" };
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
  const { passwordLength, textStyle, preset } = options;
  return {
    seed,
    context: { faker, persona, now, passwordLength, textStyle, preset },
  };
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
