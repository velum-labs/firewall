import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export const models = [
  // { name: "GPT-4o", input: { model: openai("gpt-4o") } },
  { name: "GPT-4o-mini", input: { model: openai("gpt-4o-mini") } },
  // { name: "GPT-5", input: { model: openai("gpt-5") } },
  // { name: "GPT-5-mini", input: { model: openai("gpt-5-mini") } },
  // { name: "GPT-5-nano", input: { model: openai("gpt-5-nano") } },
  // {
  //   name: "Claude 4.5 Sonnet",
  //   input: { model: anthropic("claude-sonnet-4-5") },
  // },
  // {
  //   name: "Claude 4.5 Haiku",
  //   input: { model: anthropic("claude-haiku-4-5") },
  // }
];
