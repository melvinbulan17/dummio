import type { FormField } from "./types";

const SKIPPED_INPUT_TYPES = new Set([
  "hidden",
  "submit",
  "button",
  "reset",
  "image",
  "file",
  "range",
  "color",
]);

function isFormField(element: Element): element is FormField {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  );
}

function isHidden(element: Element): boolean {
  let node: Element | null = element;
  while (node) {
    if (node instanceof HTMLElement && node.hidden) return true;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return true;
    node =
      node.parentElement ?? ((node.getRootNode() as ShadowRoot).host || null);
  }
  return false;
}

export function isFillable(field: FormField): boolean {
  if (field.disabled) return false;
  if (field instanceof HTMLInputElement && SKIPPED_INPUT_TYPES.has(field.type))
    return false;
  if (!(field instanceof HTMLSelectElement) && field.readOnly) return false;
  if (
    typeof field.checkVisibility === "function" &&
    field.getClientRects().length > 0
  ) {
    return field.checkVisibility({ visibilityProperty: true });
  }
  return !isHidden(field);
}

export function findFields(
  root: Document | ShadowRoot | Element = document,
): FormField[] {
  const found: FormField[] = [];
  const visit = (scope: Document | ShadowRoot | Element) => {
    for (const element of scope.querySelectorAll("*")) {
      if (isFormField(element) && isFillable(element)) found.push(element);
      if (element.shadowRoot) visit(element.shadowRoot);
    }
  };
  visit(root);
  return found;
}
