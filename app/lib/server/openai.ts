import { getSystemPrompt, OPENAI_DEFAULT_PARAMS } from "./promptBuilder";

export type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAIChatRequest = {
  model: string;
  messages: OpenAIChatMessage[];
  max_tokens?: number;
  temperature?: number;
};

export type OpenAIChatResponse = {
  choices?: { message: { content: string } }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  [key: string]: unknown;
};

export async function fetchOpenAIChat(
  req: OpenAIChatRequest
): Promise<OpenAIChatResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchOpenAIChatWithDefaults(
  promptContent: string
): Promise<OpenAIChatResponse> {
  return fetchOpenAIChat({
    ...OPENAI_DEFAULT_PARAMS,
    messages: [
      { role: "system", content: getSystemPrompt() },
      { role: "user", content: promptContent },
    ],
  });
}
