import type { BriefInput, BriefOutput } from "./types";

interface GenerateBriefApiResponse {
  output: BriefOutput;
  remaining?: number;
}

interface GenerateBriefApiErrorResponse {
  error?: string;
  code?: string;
}

export async function generateBrief(input: BriefInput, token?: string): Promise<{ output: BriefOutput; remaining?: number }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/generate-brief", {
    method: "POST",
    headers,
    body: JSON.stringify({ input }),
  });

  let payload: GenerateBriefApiResponse | GenerateBriefApiErrorResponse;
  try {
    payload = (await response.json()) as GenerateBriefApiResponse | GenerateBriefApiErrorResponse;
  } catch {
    throw new Error("生成服务暂时不可用，请稍后再试。");
  }

  if (!response.ok || !("output" in payload)) {
    const errorPayload = payload as GenerateBriefApiErrorResponse;
    if (errorPayload.code === "AUTH_REQUIRED" || errorPayload.code === "AUTH_EXPIRED") {
      throw new AuthError(errorPayload.error || "请先验证邮箱");
    }
    if (errorPayload.code === "QUOTA_EXCEEDED") {
      throw new QuotaError(errorPayload.error || "免费额度已用完");
    }
    throw new Error(errorPayload.error || "生成失败，请稍后再试。");
  }

  return { output: payload.output, remaining: payload.remaining };
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaError";
  }
}
