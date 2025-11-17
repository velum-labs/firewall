import { ModelMessage } from "ai";
import type { Catalog } from "../catalog";

export function buildSubjectExtractionPrompt(
  subjects: string[],
  catalog: Catalog,
  text: string
): ModelMessage[] {
  const defS = subjects
    .map((s) => {
      const spec = catalog.subjects[s];
      const desc = spec?.description ?? "";
      const exs = spec?.examples?.length
        ? `\n  Examples: ${spec.examples.join(", ")}`
        : "";
      return `- ${s}: ${desc}${exs}`;
    })
    .join("\n");

  return [
    {
      role: "system",
      content: [
        "You are extracting SUBJECT mentions for a firewall. Follow every rule strictly.",
        "",
        "General rules:",
        "- Only return the requested SUBJECT labels.",
        "- List EVERY occurrence separately. If a surface appears N times, emit N entries.",
        "- Quotes must be the minimal semantic phrase (e.g., the name or identifier) and must NOT include surrounding numbers, dates, currencies, or punctuation that is not part of the entity.",
        "- Quotes must be copied verbatim (preserve casing and spacing).",
        "- If the quote appears multiple times, provide either `pre` or `post` anchors (8-24 characters) taken directly from the text to disambiguate. Omit anchors that would extend beyond the start/end of the document.",
        "- Never fabricate anchors. Leave `pre`/`post` undefined when the quote is unique or occurs at the boundary.",
        "",
        "Confidence scoring:",
        "- 0.9-1.0: Exact match with examples/definition.",
        "- 0.7-0.9: Clear match with mild variation.",
        "- 0.5-0.7: Partial or ambiguous match.",
        "- <0.5: Do not emit.",
        "",
        `Subjects:\n${defS}`,
      ].join("\n\n"),
    },
    { role: "user", content: text },
  ];
}

export function buildPredicateExtractionPrompt(
  predicates: string[],
  catalog: Catalog,
  text: string,
  knownSubjects?: Array<{ type: string; text: string }>
): ModelMessage[] {
  const defP = predicates
    .map((p) => {
      const spec = catalog.predicates[p];
      const def = spec?.definition ?? "";
      const exs = spec?.examples?.length
        ? `\n  Examples: ${spec.examples.join("; ")}`
        : "";
      const negs = spec?.negatives?.length
        ? `\n  Counter-examples (do NOT extract): ${spec.negatives.join("; ")}`
        : "";
      return `- ${p}: ${def}${exs}${negs}`;
    })
    .join("\n");

  const knownSubjectsStr = knownSubjects?.length
    ? knownSubjects.map((s) => `- ${s.type}: "${s.text}"`).join("\n")
    : "";

  return [
    {
      role: "system",
      content: [
        "You are extracting PREDICATE spans for a firewall. Follow every rule strictly.",
        "",
        "General rules:",
        "- Only return the requested predicate labels.",
        "- Enumerate EVERY occurrence separately.",
        "- Quotes must be minimal verbatim spans that describe the predicate phrase. Do not include attached numbers, timestamps, or amounts unless they are explicitly part of the predicate definition.",
        "- If the same predicate quote appears multiple times, provide `pre` or `post` anchors (8-24 characters) taken directly from the text to disambiguate. Skip anchors that would extend beyond the text boundaries.",
        "- Never alter numeric values, currency symbols, or timestamp formatting.",
        "",
        "Confidence scoring:",
        "- 0.9-1.0: Exact match with definition/examples.",
        "- 0.7-0.9: Clear match with minor variation.",
        "- 0.5-0.7: Implied or less direct match.",
        "- <0.5: Do not emit.",
        "",
        `Predicates:\n${defP}`,
        knownSubjectsStr
          ? `Known subjects (context only — do NOT re-extract):\n${knownSubjectsStr}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    { role: "user", content: text },
  ];
}
