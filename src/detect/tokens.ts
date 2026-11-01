export function normalize(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-.[\]():/\\#*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function tokenize(text: string | undefined): string[] {
  const normalized = normalize(text);
  return normalized ? normalized.split(" ") : [];
}
