import {
  LanguageModelV2Prompt,
  LanguageModelV2TextPart,
} from "@ai-sdk/provider";
import { LanguageModelV2Message } from "@ai-sdk/provider";

export function extractTextFromMessage(
  message: LanguageModelV2Message
): string {
  if (message.role === "user") {
    return message.content
      .filter(
        (
          part: LanguageModelV2TextPart | unknown
        ): part is LanguageModelV2TextPart =>
          (part as LanguageModelV2TextPart).type === "text"
      )
      .map((part: LanguageModelV2TextPart) => part.text)
      .join(" ");
  }
  return "";
}

export function findLastUserMessage(
  prompt: LanguageModelV2Prompt
): LanguageModelV2Message | null {
  for (let i = prompt.length - 1; i >= 0; i--) {
    if (prompt[i].role === "user") {
      return prompt[i];
    }
  }
  return null;
}
export function replaceTextInMessage(
  message: LanguageModelV2Message,
  newText: string
): LanguageModelV2Message {
  if (message.role !== "user") {
    return message;
  }

  if (Array.isArray(message.content)) {
    const newContent = message.content.map((part: unknown) => {
      const typedPart = part as LanguageModelV2TextPart;
      if (typedPart.type === "text") {
        return { ...typedPart, text: newText } as LanguageModelV2TextPart;
      }
      return part;
    }) as typeof message.content;

    return { ...message, content: newContent };
  }

  return message;
}

export function replaceLastUserMessage(
  prompt: LanguageModelV2Prompt,
  newMessage: LanguageModelV2Message
): LanguageModelV2Prompt {
  const newPrompt = [...prompt];
  for (let i = newPrompt.length - 1; i >= 0; i--) {
    if (newPrompt[i].role === "user") {
      newPrompt[i] = newMessage;
      break;
    }
  }
  return newPrompt;
}
