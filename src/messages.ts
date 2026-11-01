import { detectFields, fieldLabel } from "./detect/detect";
import type { FieldType, FormField } from "./detect/types";
import {
  type FieldResult,
  type FillOptions,
  type FillReport,
  fillField,
  fillPage,
} from "./fill/fill";

export interface ScannedField {
  ref: number;
  type: FieldType;
  label: string;
}

export type Message =
  | { type: "scan" }
  | { type: "fill-page"; options: FillOptions }
  | { type: "fill-focused"; options: FillOptions };

export type Reply<M extends Message> = M extends { type: "scan" }
  ? ScannedField[]
  : M extends { type: "fill-page" }
    ? FillReport
    : FieldResult | null;

function focusedField(): FormField | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active instanceof HTMLInputElement ||
    active instanceof HTMLSelectElement ||
    active instanceof HTMLTextAreaElement
    ? active
    : null;
}

export function handleMessage(message: Message): Reply<Message> {
  switch (message.type) {
    case "scan":
      return detectFields().map((field) => ({
        ref: field.ref,
        type: field.type,
        label: fieldLabel(field),
      }));
    case "fill-page":
      return fillPage(message.options);
    case "fill-focused": {
      const field = focusedField();
      return field ? fillField(field, message.options) : null;
    }
  }
}
