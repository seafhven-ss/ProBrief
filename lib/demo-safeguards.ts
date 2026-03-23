import type { BriefInput, BriefOutput, MissingInfo, NextStep, ProposalAngle, Requirement, Risk } from "./types";
import { extractRegions } from "../data/region-normalization";

export type DemoScene = "retail" | "booth" | "commercial";

export interface DemoPreprocessContext {
  scene: DemoScene;
  normalizedProjectType: string;
  regions: string[];
  months: number[];
  areaSqm: number | null;
  budgetWan: number | null;
  budgetTension: boolean;
  budgetTensionRisk: Risk | null;
}

const MONTH_PATTERN = /(\d{1,2})\s*月/g;
const MONTH_NAME_MAP: Record<string, number> = {
  november: 11,
  december: 12,
  january: 1,
  february: 2,
  may: 5,
  june: 6,
};
const AREA_PATTERN = /(\d+)\s*(㎡|平米|平方米|m2|sqm)/i;
const BUDGET_PATTERN = /(\d+(?:\.\d+)?)\s*万/i;
const BOOTH_TERMS = ["展位", "展馆", "报馆", "审图", "吊点", "限高", "开口面"];
const RETAIL_OPERATION_TERMS = ["收银", "试衣", "补货", "仓储", "坪效"];

function detectScene(projectType: string): DemoScene {
  if (projectType === "零售门店") return "retail";
  if (projectType === "展会展台") return "booth";
  return "commercial";
}

function extractMonths(text: string): number[] {
  const months = new Set<number>();
  const numericPattern = new RegExp(MONTH_PATTERN.source, MONTH_PATTERN.flags);
  let match: RegExpExecArray | null;

  while ((match = numericPattern.exec(text)) !== null) {
    const month = parseInt(match[1], 10);
    if (month >= 1 && month <= 12) months.add(month);
  }

  const lower = text.toLowerCase();
  for (const [name, month] of Object.entries(MONTH_NAME_MAP)) {
    if (lower.includes(name)) months.add(month);
  }

  return [...months];
}

function extractAreaSqm(text: string): number | null {
  const match = text.match(AREA_PATTERN);
  return match ? Number(match[1]) : null;
}

function extractBudgetWan(text: string): number | null {
  const match = text.match(BUDGET_PATTERN);
  return match ? Number(match[1]) : null;
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function scrubSceneLeakage(scene: DemoScene, text: string): boolean {
  if (scene === "retail") return !containsAny(text, BOOTH_TERMS);
  if (scene === "booth") return !containsAny(text, RETAIL_OPERATION_TERMS);
  return !containsAny(text, BOOTH_TERMS) && !containsAny(text, RETAIL_OPERATION_TERMS);
}

function filterSceneItems<T>(scene: DemoScene, items: T[], getText: (item: T) => string): T[] {
  return items.filter((item) => scrubSceneLeakage(scene, getText(item)));
}

export function preprocessBriefInput(input: BriefInput): DemoPreprocessContext {
  const scene = detectScene(input.projectType);
  const combinedText = [input.projectName, input.description, input.budget, input.timeline].filter(Boolean).join(" ");
  const areaSqm = extractAreaSqm(combinedText);
  const budgetWan = extractBudgetWan(combinedText);
  const requestsPremium = /高端|高级感|精品|质感|premium/i.test(combinedText);
  const budgetTension = scene === "retail"
    && areaSqm !== null
    && budgetWan !== null
    && areaSqm >= 80
    && areaSqm <= 120
    && budgetWan >= 4
    && budgetWan <= 6
    && requestsPremium;

  return {
    scene,
    normalizedProjectType: input.projectType,
    regions: extractRegions(combinedText),
    months: extractMonths(combinedText),
    areaSqm,
    budgetWan,
    budgetTension,
    budgetTensionRisk: budgetTension
      ? {
          type: "预算与目标张力",
          description: `当前零售项目面积约${areaSqm}㎡、预算约${budgetWan}万，同时希望呈现较强品牌形象或高端感，预算投入与目标效果存在明显张力。建议前置明确形象优先级、材料档次和必保项。`,
          severity: "high",
        }
      : null,
  };
}

export function buildSummary(input: BriefInput, overview: string): BriefOutput["summary"] {
  const typeLabel = input.projectType || "项目";
  return {
    title: input.projectName ? `${input.projectName} - ${typeLabel}项目 Brief` : `${typeLabel}项目 Brief（草稿）`,
    overview,
    projectType: typeLabel,
  };
}

export function applyLocalSafeguards(output: BriefOutput, context: DemoPreprocessContext): BriefOutput {
  let risks = filterSceneItems(context.scene, output.risks, (item) => `${item.type} ${item.description}`);
  const missingInfo = filterSceneItems(context.scene, output.missingInfo, (item) => `${item.field} ${item.reason}`);
  const nextSteps: NextStep[] = filterSceneItems(context.scene, output.nextSteps, (item) => `${item.action} ${item.owner}`)
    .map((item, index) => ({ ...item, order: index + 1 }));
  const proposalAngles = filterSceneItems(context.scene, output.proposalAngles, (item) => `${item.angle} ${item.reasoning}`);

  if (context.budgetTensionRisk && !risks.some((risk) => risk.type === context.budgetTensionRisk?.type)) {
    risks = [context.budgetTensionRisk, ...risks];
  }

  return {
    ...output,
    missingInfo,
    risks,
    nextSteps,
    proposalAngles,
  };
}

export function normalizeApiOutput(input: BriefInput, apiOutput: {
  overview: string;
  requirements: Requirement[];
  missingInfo: MissingInfo[];
  risks: Risk[];
  nextSteps: Array<{ action: string; owner: string }>;
  proposalAngles: ProposalAngle[];
}): BriefOutput {
  return {
    summary: buildSummary(input, apiOutput.overview),
    requirements: apiOutput.requirements,
    missingInfo: apiOutput.missingInfo,
    risks: apiOutput.risks,
    nextSteps: apiOutput.nextSteps.map((step, index) => ({ order: index + 1, ...step })),
    proposalAngles: apiOutput.proposalAngles,
    generatedAt: new Date().toISOString(),
    generatorVersion: "llm",
  };
}
