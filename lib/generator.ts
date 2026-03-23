import type { BriefInput, BriefOutput } from "./types";

interface GenerateBriefApiResponse {
  output: BriefOutput;
}

interface GenerateBriefApiErrorResponse {
  error?: string;
}

export async function generateBrief(input: BriefInput): Promise<BriefOutput> {
  const response = await fetch("/api/generate-brief", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  let payload: GenerateBriefApiResponse | GenerateBriefApiErrorResponse;
  try {
    payload = (await response.json()) as GenerateBriefApiResponse | GenerateBriefApiErrorResponse;
  } catch {
    throw new Error("生成服务暂时不可用，请稍后再试。");
  }

  if (!response.ok || !("output" in payload)) {
    const errorMessage = "error" in payload ? payload.error : undefined;
    throw new Error(errorMessage || "生成失败，请稍后再试。");
  }

  // Server already applies full pipeline: facts → rules → LLM → conflict filter → safeguards
  return payload.output;
}
