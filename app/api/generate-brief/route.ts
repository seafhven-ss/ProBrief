import { NextResponse } from "next/server";
import type { BriefInput, BriefOutput, MissingInfo, ProposalAngle, Requirement, Risk } from "@/lib/types";
import { applyLocalSafeguards, normalizeApiOutput, preprocessBriefInput } from "@/lib/demo-safeguards";
import { extractFacts } from "@/lib/facts";
import type { FactsSnapshot } from "@/lib/facts";
import { runRuleEngine } from "@/lib/rule-engine";
import { filterConflicts } from "@/lib/conflict-filter";
import { SYSTEM_PROMPT, getScenePrompt } from "@/lib/prompts";

interface GenerateBriefRequestBody {
  input: BriefInput;
}

interface ApiModelOutput {
  overview: string;
  requirements: Requirement[];
  missingInfo: MissingInfo[];
  risks: Risk[];
  nextSteps: Array<{ action: string; owner: string }>;
  proposalAngles: ProposalAngle[];
}

const schema = {
  name: "brief_output",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["overview", "requirements", "missingInfo", "risks", "nextSteps", "proposalAngles"],
    properties: {
      overview: { type: "string" },
      requirements: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["category", "description", "priority"],
          properties: {
            category: { type: "string" },
            description: { type: "string" },
            priority: { type: "string", enum: ["high", "medium", "low"] },
          },
        },
      },
      missingInfo: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["field", "reason", "impact"],
          properties: {
            field: { type: "string" },
            reason: { type: "string" },
            impact: { type: "string", enum: ["blocking", "important", "optional"] },
          },
        },
      },
      risks: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "description", "severity"],
          properties: {
            type: { type: "string" },
            description: { type: "string" },
            severity: { type: "string", enum: ["high", "medium", "low"] },
          },
        },
      },
      nextSteps: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["action", "owner"],
          properties: {
            action: { type: "string" },
            owner: { type: "string" },
          },
        },
      },
      proposalAngles: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["angle", "reasoning"],
          properties: {
            angle: { type: "string" },
            reasoning: { type: "string" },
          },
        },
      },
    },
  },
} as const;

function getScenePromptFile(projectType: string): string {
  if (projectType === "零售门店") return "retail.txt";
  if (projectType === "展会展台") return "booth.txt";
  return "commercial.txt";
}

// ── Build user prompt with facts context ────────────────────────────────────

function buildFactsSection(facts: FactsSnapshot): string {
  const lines: string[] = [];

  // VI status — critical for avoiding contradictions
  if (facts.visualIdentityStatus === "complete") {
    lines.push("IMPORTANT: The client has confirmed they have a COMPLETE brand visual identity system (VI, logo, colors, fonts are all finalized). Do NOT list any VI/logo/brand-visual related items as missing information.");
  } else if (facts.visualIdentityStatus === "partial") {
    lines.push("Note: The client's brand visual identity is PARTIALLY complete (still being finalized). You may suggest confirming remaining items, but do not treat the entire VI as missing.");
  } else if (facts.visualIdentityStatus === "missing") {
    lines.push("Note: The client has NO brand visual identity system. VI/logo/brand design should be flagged as missing.");
  }

  // Budget status
  if (facts.budgetStatus === "clear") {
    lines.push("Budget has been clearly specified. Do NOT list 'budget unknown' or 'budget range missing' as missing information. You may still suggest budget breakdown/prioritization if relevant.");
  } else if (facts.budgetStatus === "rough") {
    lines.push("Budget is roughly indicated but not precisely defined. You may suggest clarifying budget breakdown.");
  }

  // Timeline status
  if (facts.timelineStatus === "clear") {
    lines.push("Timeline/deadline has been clearly specified. Do NOT list 'timeline unknown' as missing information.");
  } else if (facts.timelineStatus === "tight") {
    lines.push("Timeline is tight/urgent. Flag schedule risks but do NOT list timeline as missing.");
  }

  // Area
  if (facts.areaKnown) {
    lines.push(`Project area is known: ${facts.areaValue}. Do NOT list area as missing information.`);
  }

  // Customer group
  if (facts.customerGroupKnown) {
    lines.push("Target customer group has been mentioned. Do NOT list customer demographics as missing.");
  }

  return lines.length > 0
    ? ["", "── Already confirmed by client (do NOT ask again) ──", ...lines, "──────────────────────────────────────────────────────"].join("\n")
    : "";
}

function buildUserPrompt(
  input: BriefInput,
  context: ReturnType<typeof preprocessBriefInput>,
  facts: FactsSnapshot,
): string {
  const factsSection = buildFactsSection(facts);

  return [
    `Scene: ${context.scene}`,
    `Project type: ${input.projectType}`,
    `Project name: ${input.projectName || "未提供"}`,
    `Description: ${input.description}`,
    `Budget: ${input.budget || "未提供"}`,
    `Timeline: ${input.timeline || "未提供"}`,
    `Normalized regions: ${context.regions.length > 0 ? context.regions.join(", ") : "none"}`,
    `Detected months: ${context.months.length > 0 ? context.months.join(", ") : "none"}`,
    `Area sqm: ${context.areaSqm ?? "unknown"}`,
    `Budget wan: ${context.budgetWan ?? "unknown"}`,
    `Budget tension: ${context.budgetTension ? "yes" : "no"}`,
    factsSection,
    "Return practical, proposal-ready brief content in JSON only.",
  ].filter(Boolean).join("\n");
}

// ── Dedup helper ────────────────────────────────────────────────────────────

function dedup<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item).toLowerCase().replace(/\s+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Main pipeline ───────────────────────────────────────────────────────────

// ── LLM provider config ─────────────────────────────────────────────────────

interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  supportsJsonSchema: boolean;
}

function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();

  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY 未配置。");
    return {
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      apiKey,
      model: process.env.GROQ_MODEL || "qwen/qwen3-32b",
      supportsJsonSchema: false,
    };
  }

  // Default: OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY 未配置。");
  return {
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey,
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    supportsJsonSchema: true,
  };
}

// ── JSON schema instruction (for providers that don't support json_schema) ──

function buildJsonSchemaInstruction(): string {
  return [
    "",
    "You MUST return valid JSON matching this exact structure:",
    "{",
    '  "overview": "string — project overview",',
    '  "requirements": [{"category": "string", "description": "string", "priority": "high|medium|low"}],',
    '  "missingInfo": [{"field": "string", "reason": "string", "impact": "blocking|important|optional"}],',
    '  "risks": [{"type": "string", "description": "string", "severity": "high|medium|low"}],',
    '  "nextSteps": [{"action": "string", "owner": "string"}],',
    '  "proposalAngles": [{"angle": "string", "reasoning": "string"}]',
    "}",
    "Return ONLY the JSON object, no markdown fences, no extra text.",
  ].join("\n");
}

async function callModel(input: BriefInput): Promise<BriefOutput> {
  const llm = getLLMConfig();

  // Step 1: Extract facts and preprocess context (single pass)
  const facts = extractFacts(input);
  const context = preprocessBriefInput(input);

  // Step 2: Run rule engine
  const ruleResult = runRuleEngine(input);

  // Step 3: Call LLM with facts-aware prompt
  const scenePrompt = getScenePrompt(input.projectType);

  // Build messages — for non-schema providers, append schema instruction to system prompt
  const systemContent = llm.supportsJsonSchema
    ? SYSTEM_PROMPT
    : SYSTEM_PROMPT + buildJsonSchemaInstruction();

  const body: Record<string, unknown> = {
    model: llm.model,
    temperature: 0.3,
    messages: [
      { role: "system", content: systemContent },
      { role: "system", content: scenePrompt },
      { role: "user", content: buildUserPrompt(input, context, facts) },
    ],
  };

  // Use strict json_schema for OpenAI, json_object for Groq
  if (llm.supportsJsonSchema) {
    body.response_format = { type: "json_schema", json_schema: schema };
  } else {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(llm.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llm.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`上游生成服务调用失败: ${errorText}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("上游生成服务未返回有效内容。");
  }

  // Strip markdown fences if present (some models wrap JSON in ```json...```)
  content = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  const parsed = JSON.parse(content) as ApiModelOutput;
  const output = normalizeApiOutput(input, parsed);

  // Step 4: Apply scene leakage safeguards
  const safeguarded = applyLocalSafeguards(output, context);

  // Step 5: Merge rule engine outputs (dedup against LLM output)
  const mergedMissing = dedup(
    [...safeguarded.missingInfo, ...ruleResult.injectedMissing],
    (m) => m.field,
  );
  const mergedRisks = dedup(
    [...safeguarded.risks, ...ruleResult.injectedRisks],
    (r) => r.type,
  );
  const mergedNextSteps = dedup(
    [...safeguarded.nextSteps, ...ruleResult.injectedNextSteps.map((s, i) => ({ ...s, order: safeguarded.nextSteps.length + i + 1 }))],
    (s) => s.action,
  );
  const mergedAngles = dedup(
    [...safeguarded.proposalAngles, ...ruleResult.injectedAngles],
    (a) => a.angle,
  );

  // Step 6: Conflict filter — remove items that contradict extracted facts
  const conflictResult = filterConflicts(
    facts,
    mergedMissing,
    mergedRisks,
    mergedNextSteps,
    mergedAngles,
    true, // demoSafeMode: soften wording
  );

  // Re-number nextSteps
  const finalNextSteps = conflictResult.nextSteps.map((s, i) => ({ ...s, order: i + 1 }));

  return {
    ...safeguarded,
    missingInfo: conflictResult.missingInfo,
    risks: conflictResult.risks,
    nextSteps: finalNextSteps,
    proposalAngles: conflictResult.proposalAngles,
    // Attach debug info
    ruleDebug: ruleResult.debug,
    factsDebug: facts,
    filteredDebug: conflictResult.filtered,
  };
}

export async function POST(request: Request) {
  try {
    // ── Auth check ──
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "请先验证邮箱 / Please verify your email first", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const { verifyToken, incrementUsage } = await import("@/lib/auth");
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "登录已过期，请重新验证 / Session expired", code: "AUTH_EXPIRED" }, { status: 401 });
    }

    const { allowed, remaining } = await incrementUsage(user.email);
    if (!allowed) {
      return NextResponse.json({ error: "免费额度已用完，请联系 seafhven@gmail.com 获取更多次数", code: "QUOTA_EXCEEDED" }, { status: 429 });
    }

    // ── Generate ──
    const body = (await request.json()) as GenerateBriefRequestBody;
    const input = body.input;

    if (!input?.projectType || !input?.description?.trim()) {
      return NextResponse.json({ error: "项目类型和需求描述为必填项。" }, { status: 400 });
    }

    const output = await callModel(input);
    const context = preprocessBriefInput(input);
    return NextResponse.json({ output, context, remaining });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败，请稍后再试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
