import { classify } from "./classify";
import { findFields } from "./find";
import { detectFormat } from "./format";
import { readSignals } from "./signals";
import type { DetectedField } from "./types";

export function detectFields(
  root: Document | ShadowRoot | Element = document,
): DetectedField[] {
  return findFields(root).map((element, ref) => {
    const signals = readSignals(element);
    const classification = classify(signals);
    return {
      ref,
      element,
      signals,
      ...classification,
      format: detectFormat(signals, classification.type),
    };
  });
}
