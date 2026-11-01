type TextField = HTMLInputElement | HTMLTextAreaElement;

function dispatch(field: HTMLElement) {
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  field.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
}

export function writeText(field: TextField, value: string) {
  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  if (setter) setter.call(field, value);
  else field.value = value;
  dispatch(field);
}

export function writeSelect(
  field: HTMLSelectElement,
  option: HTMLOptionElement,
) {
  option.selected = true;
  dispatch(field);
}

export function setChecked(field: HTMLInputElement, checked: boolean) {
  if (field.checked !== checked) field.click();
}
