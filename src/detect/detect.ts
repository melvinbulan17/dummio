import { classify } from "./classify";
import { findFields } from "./find";
import { detectFormat } from "./format";
import { readSignals } from "./signals";
import type { DetectedField, FormField } from "./types";

export function detectField(element: FormField, ref = 0): DetectedField {
  const signals = readSignals(element);
  const classification = classify(signals);
  return {
    ref,
    element,
    signals,
    ...classification,
    format: detectFormat(signals, classification.type),
  };
}

export function fieldLabel({
  signals,
}: Pick<DetectedField, "signals">): string {
  return (
    signals.labelText ??
    signals.ariaLabel ??
    signals.placeholder ??
    signals.name ??
    signals.id ??
    signals.tag
  );
}

export function detectFields(
  root: Document | ShadowRoot | Element = document,
): DetectedField[] {
  return findFields(root).map((element, ref) => detectField(element, ref));
}
