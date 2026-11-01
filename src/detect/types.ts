export type FieldType =
  | "firstName"
  | "middleName"
  | "lastName"
  | "fullName"
  | "username"
  | "email"
  | "phone"
  | "street"
  | "barangay"
  | "city"
  | "province"
  | "zip"
  | "country"
  | "birthday"
  | "date"
  | "password"
  | "url"
  | "number"
  | "company"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "unknown";

export type DatePart = "day" | "month" | "year";

export type FormField =
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export interface FieldSignals {
  tag: "input" | "select" | "textarea";
  inputType?: string;
  autocomplete?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
  labelText?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: string;
  max?: string;
  step?: string;
  inputMode?: string;
  prefixText?: string;
  datePart?: DatePart;
}

export interface Classification {
  type: FieldType;
  score: number;
  reason: string;
}

export interface FieldFormat {
  dateOrder?: "ymd" | "mdy" | "dmy";
  separator?: string;
  digitsOnly?: boolean;
  phoneStyle?: "intl" | "local11" | "local10";
  length?: { min?: number; max?: number };
  part?: DatePart;
}

export interface DetectedField extends Classification {
  ref: number;
  element: FormField;
  signals: FieldSignals;
  format: FieldFormat;
}
