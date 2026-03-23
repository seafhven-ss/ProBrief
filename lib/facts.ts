/**
 * Facts extraction layer: extracts structured facts from raw BriefInput
 * to enable conflict detection between user input and generated output.
 */

import type { BriefInput } from "./types";
import { extractRegions } from "../data/region-normalization";

export type VisualIdentityStatus = "complete" | "partial" | "missing" | "unknown";
export type BudgetStatus = "clear" | "rough" | "unknown";
export type TimelineStatus = "clear" | "tight" | "unknown";

export interface FactsSnapshot {
  visualIdentityStatus: VisualIdentityStatus;
  budgetStatus: BudgetStatus;
  timelineStatus: TimelineStatus;
  customerGroupKnown: boolean;
  areaKnown: boolean;
  areaValue: string | null;
  projectScene: string | null;
  regionNormalized: string[];
  monthDetected: number[];
}

const VI_COMPLETE_SIGNALS = [
  "品牌视觉系统vi完善",
  "品牌视觉系统完善",
  "品牌视觉完善",
  "视觉系统完善",
  "vi完善",
  "vi已完善",
  "vi完整",
  "vi已完整",
  "vi都已经完成",
  "vi已经完成",
  "vi和logo都已经完成",
  "vi和logo已完成",
  "品牌vi完善",
  "品牌vi完整",
  "logo色值字体已定",
  "logo字体色值已定",
  "品牌规范齐全",
  "视觉资产齐全",
  "品牌手册完整",
  "vi手册完整",
  "品牌资料齐全",
  "视觉已完成",
  "有完整vi",
  "有完整的vi",
  "完整vi系统",
  "完整的vi系统",
  "有完整品牌",
  "品牌已完成",
  "品牌已完善",
  "品牌完整",
  "品牌已定",
  "logo已定",
  "logo已完成",
  "logo已有",
  "有logo",
  "品牌体系完整",
  "品牌体系完善",
  "品牌视觉已完成",
  "品牌视觉已定",
  "vi没问题",
  "vi齐全",
  "品牌齐全",
];

const VI_PARTIAL_SIGNALS = [
  "品牌还在做",
  "vi还没完成",
  "品牌在调整",
  "视觉还在改",
  "logo还没定",
  "品牌待完善",
  "品牌不太完整",
];

const VI_MISSING_SIGNALS = [
  "没有品牌",
  "没有vi",
  "没有logo",
  "品牌缺失",
  "vi缺失",
  "没有视觉系统",
];

const BUDGET_CLEAR_PATTERNS = [
  /预算\s*[\d,.]+\s*万/i,
  /[\d,.]+\s*万[^\n，。]*预算/i,
  /预算[^\n，。]*明确/i,
  /预算[^\n，。]*确定/i,
];

const BUDGET_ROUGH_SIGNALS = ["预算有限", "预算不多", "控制成本", "便宜", "不要太贵", "中等预算"];

const TIMELINE_CLEAR_PATTERNS = [
  /\d+\s*(个月|周|天).*完工/,
  /\d+\s*(个月|周|天).*交付/,
  /\d+\s*月.*开业/,
  /工期\s*\d+/,
  /deadline/i,
];

const TIMELINE_TIGHT_SIGNALS = ["工期紧", "时间紧", "赶工", "紧张", "来不及", "尽快"];
const CUSTOMER_GROUP_SIGNALS = ["目标客群", "目标人群", "客群", "消费层级", "年轻人", "白领", "家庭", "高端客户", "学生", "中产"];
const AREA_PATTERN = /(\d+)\s*(㎡|平米|平方米|m2|sqm)/i;
const MONTH_PATTERN = /(\d{1,2})\s*月/g;
const MONTH_NAME_MAP: Record<string, number> = {
  november: 11,
  december: 12,
  january: 1,
  february: 2,
  may: 5,
  june: 6,
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function textContainsAny(text: string, signals: string[]): boolean {
  const normalized = normalize(text);
  return signals.some((signal) => normalized.includes(normalize(signal)));
}

function textMatchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
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

export function extractFacts(input: BriefInput): FactsSnapshot {
  const fullText = [input.projectName, input.description, input.budget, input.timeline]
    .filter(Boolean)
    .join(" ");

  let visualIdentityStatus: VisualIdentityStatus = "unknown";
  if (textContainsAny(fullText, VI_COMPLETE_SIGNALS)) {
    visualIdentityStatus = "complete";
  } else if (textContainsAny(fullText, VI_PARTIAL_SIGNALS)) {
    visualIdentityStatus = "partial";
  } else if (textContainsAny(fullText, VI_MISSING_SIGNALS)) {
    visualIdentityStatus = "missing";
  }

  let budgetStatus: BudgetStatus = "unknown";
  if (input.budget && input.budget.trim()) {
    budgetStatus = textMatchesAny(input.budget, BUDGET_CLEAR_PATTERNS) ? "clear" : "rough";
  } else if (textMatchesAny(fullText, BUDGET_CLEAR_PATTERNS)) {
    budgetStatus = "clear";
  } else if (textContainsAny(fullText, BUDGET_ROUGH_SIGNALS)) {
    budgetStatus = "rough";
  }

  let timelineStatus: TimelineStatus = "unknown";
  if (input.timeline && input.timeline.trim()) {
    timelineStatus = textContainsAny(fullText, TIMELINE_TIGHT_SIGNALS) ? "tight" : "clear";
  } else if (textMatchesAny(fullText, TIMELINE_CLEAR_PATTERNS)) {
    timelineStatus = textContainsAny(fullText, TIMELINE_TIGHT_SIGNALS) ? "tight" : "clear";
  } else if (textContainsAny(fullText, TIMELINE_TIGHT_SIGNALS)) {
    timelineStatus = "tight";
  }

  const customerGroupKnown = textContainsAny(fullText, CUSTOMER_GROUP_SIGNALS);
  const areaMatch = fullText.match(AREA_PATTERN);
  const areaKnown = !!areaMatch;
  const areaValue = areaMatch ? `${areaMatch[1]}㎡` : null;
  const projectScene = input.projectType || null;
  const regionNormalized = extractRegions(fullText);
  const monthDetected = extractMonths(fullText);

  return {
    visualIdentityStatus,
    budgetStatus,
    timelineStatus,
    customerGroupKnown,
    areaKnown,
    areaValue,
    projectScene,
    regionNormalized,
    monthDetected,
  };
}
