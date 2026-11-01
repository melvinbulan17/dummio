import {
  AUTOCOMPLETE_TYPES,
  INPUT_TYPE_SCORES,
  KEYWORD_RULES,
  type ScoredType,
  SOURCE_WEIGHTS,
  TIE_ORDER,
} from "./rules";
import { normalize } from "./tokens";
import type { Classification, FieldSignals } from "./types";

const AUTOCOMPLETE_SCORE = 10;
const SOURCE_LABELS: Record<keyof typeof SOURCE_WEIGHTS, string> = {
  labelText: "label",
  ariaLabel: "aria-label",
  name: "name",
  id: "id",
  placeholder: "placeholder",
};

type Scores = Map<
  ScoredType,
  { score: number; reasons: string[]; keyword: number }
>;

function add(
  scores: Scores,
  type: ScoredType,
  points: number,
  reason: string,
  keyword = false,
) {
  const entry = scores.get(type) ?? { score: 0, reasons: [], keyword: 0 };
  entry.score += points;
  if (keyword) entry.keyword += points;
  if (!entry.reasons.includes(reason)) entry.reasons.push(reason);
  scores.set(type, entry);
}

function matchesRule(
  text: string,
  words: Set<string>,
  phrases: string[] = [],
  tokens: string[] = [],
) {
  return (
    phrases.some((phrase) => ` ${text} `.includes(` ${phrase} `)) ||
    tokens.some((token) => words.has(token))
  );
}

function scoreAutocomplete(scores: Scores, autocomplete: string | undefined) {
  if (!autocomplete || autocomplete === "off" || autocomplete === "on") return;
  const tokens = autocomplete.split(/\s+/);
  for (const token of tokens.reverse()) {
    const type = AUTOCOMPLETE_TYPES[token];
    if (type) {
      add(scores, type, AUTOCOMPLETE_SCORE, `autocomplete is ${token}`);
      return;
    }
  }
}

function scoreKeywords(scores: Scores, signals: FieldSignals) {
  for (const source of Object.keys(
    SOURCE_WEIGHTS,
  ) as (keyof typeof SOURCE_WEIGHTS)[]) {
    const raw = signals[source];
    const text = normalize(raw);
    if (!text) continue;
    const words = new Set(text.split(" "));
    const matched = new Set<ScoredType>();
    for (const rule of KEYWORD_RULES) {
      if (matched.has(rule.type)) continue;
      if (!matchesRule(text, words, rule.phrases, rule.tokens)) continue;
      matched.add(rule.type);
      const points = SOURCE_WEIGHTS[source] * (rule.weight ?? 1);
      add(
        scores,
        rule.type,
        points,
        `${SOURCE_LABELS[source]} says "${raw}"`,
        true,
      );
    }
  }
}

function best(
  scores: Scores,
):
  | [ScoredType, { score: number; reasons: string[]; keyword: number }]
  | undefined {
  let winner:
    | [ScoredType, { score: number; reasons: string[]; keyword: number }]
    | undefined;
  for (const entry of scores) {
    if (!winner) {
      winner = entry;
      continue;
    }
    const [type, value] = entry;
    const [winType, winValue] = winner;
    if (value.score > winValue.score) winner = entry;
    else if (value.score === winValue.score) {
      if (value.keyword > winValue.keyword) winner = entry;
      else if (
        value.keyword === winValue.keyword &&
        TIE_ORDER.indexOf(type) < TIE_ORDER.indexOf(winType)
      ) {
        winner = entry;
      }
    }
  }
  return winner;
}

export function classify(signals: FieldSignals): Classification {
  if (signals.inputType === "checkbox" || signals.inputType === "radio") {
    return {
      type: signals.inputType,
      score: 1,
      reason: `type is ${signals.inputType}`,
    };
  }

  const scores: Scores = new Map();
  scoreAutocomplete(scores, signals.autocomplete);
  const typeScores = signals.inputType
    ? INPUT_TYPE_SCORES[signals.inputType]
    : undefined;
  if (typeScores) {
    for (const [type, points] of Object.entries(typeScores) as [
      ScoredType,
      number,
    ][]) {
      add(scores, type, points, `type is ${signals.inputType}`);
    }
  }
  scoreKeywords(scores, signals);

  if (
    signals.inputType === "date" &&
    (scores.get("birthday")?.keyword ?? 0) === 0
  ) {
    scores.delete("birthday");
  }

  const winner = best(scores);
  if (!winner || winner[1].score <= 0) {
    if (signals.tag === "select")
      return { type: "select", score: 0, reason: "a dropdown" };
    if (signals.tag === "textarea")
      return { type: "textarea", score: 0, reason: "a text area" };
    return { type: "unknown", score: 0, reason: "no clues matched" };
  }

  const [type, value] = winner;
  return { type, score: value.score, reason: value.reasons.join(", ") };
}
