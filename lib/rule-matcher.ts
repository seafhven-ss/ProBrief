/**
 * Rule matcher: extracts structured context from input and matches demo rules.
 */

import type { BriefInput } from "./types";
import type { DemoRule } from "../data/demo-rules-v1";
import { extractRegions } from "../data/region-normalization";

export interface MatchContext {
  fullText: string;
  projectType: string;
  regions: string[];
  months: number[];
}

export interface RuleMatchResult {
  rule: DemoRule;
  matched: boolean;
  reasons: string[];
  matchedKeywords: string[];
  detectedRegions: string[];
  detectedMonths: number[];
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

function extractMonths(text: string): number[] {
  const months = new Set<number>();
  const numericPattern = new RegExp(MONTH_PATTERN.source, MONTH_PATTERN.flags);
  let match: RegExpExecArray | null;

  while ((match = numericPattern.exec(text)) !== null) {
    const month = parseInt(match[1], 10);
    if (month >= 1 && month <= 12) {
      months.add(month);
    }
  }

  const lower = text.toLowerCase();
  for (const [name, month] of Object.entries(MONTH_NAME_MAP)) {
    if (lower.includes(name)) {
      months.add(month);
    }
  }

  return [...months];
}

export function buildContext(input: BriefInput): MatchContext {
  const fullText = [input.projectName, input.description, input.budget, input.timeline]
    .filter(Boolean)
    .join(" ");

  return {
    fullText,
    projectType: input.projectType,
    regions: extractRegions(fullText),
    months: extractMonths(fullText),
  };
}

function textContains(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

export function matchRule(rule: DemoRule, ctx: MatchContext): RuleMatchResult {
  const reasons: string[] = [];
  const matchedKeywords: string[] = [];

  if (rule.projectTypes.length > 0) {
    const typeMatch = rule.projectTypes.some(
      (t) => ctx.projectType === t || ctx.projectType.includes(t) || t.includes(ctx.projectType),
    );
    if (!typeMatch) {
      return {
        rule,
        matched: false,
        reasons: ["项目类型不匹配"],
        matchedKeywords: [],
        detectedRegions: ctx.regions,
        detectedMonths: ctx.months,
      };
    }
  }

  let hasKeywordMatch = rule.triggerKeywords.length === 0;
  for (const kw of rule.triggerKeywords) {
    if (textContains(ctx.fullText, kw)) {
      hasKeywordMatch = true;
      matchedKeywords.push(kw);
    }
  }
  if (matchedKeywords.length > 0) {
    reasons.push(`关键词命中: ${matchedKeywords.join(", ")}`);
  }

  let hasAbsent = rule.absentKeywords.length === 0;
  const absentOnes: string[] = [];
  for (const kw of rule.absentKeywords) {
    if (!textContains(ctx.fullText, kw)) {
      hasAbsent = true;
      absentOnes.push(kw);
    }
  }
  if (absentOnes.length > 0) {
    reasons.push(`缺失信息: ${absentOnes.join(", ")}`);
  }

  let regionMatch = rule.regions.length === 0;
  const overlappingRegions: string[] = [];
  for (const region of rule.regions) {
    if (ctx.regions.includes(region)) {
      regionMatch = true;
      overlappingRegions.push(region);
    }
  }
  if (overlappingRegions.length > 0) {
    reasons.push(`地区命中: ${overlappingRegions.join(", ")}`);
  }

  let monthMatch = rule.months.length === 0;
  const overlappingMonths: number[] = [];
  for (const month of rule.months) {
    if (ctx.months.includes(month)) {
      monthMatch = true;
      overlappingMonths.push(month);
    }
  }
  if (overlappingMonths.length > 0) {
    reasons.push(`月份命中: ${overlappingMonths.map((m) => `${m}月`).join(", ")}`);
  }

  return {
    rule,
    matched: hasKeywordMatch && hasAbsent && regionMatch && monthMatch,
    reasons,
    matchedKeywords,
    detectedRegions: ctx.regions,
    detectedMonths: ctx.months,
  };
}
