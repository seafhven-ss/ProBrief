/**
 * Conflict filter: removes or rewrites output items that contradict extracted facts.
 */

import type { MissingInfo, Risk, NextStep, ProposalAngle } from "./types";
import type { FactsSnapshot } from "./facts";

export interface FilteredItem {
  type: "missing" | "risk" | "nextStep" | "angle";
  original: string;
  reason: string;
  action: "removed" | "reworded";
}

export interface ConflictFilterResult {
  missingInfo: MissingInfo[];
  risks: Risk[];
  nextSteps: NextStep[];
  proposalAngles: ProposalAngle[];
  filtered: FilteredItem[];
}

const VI_CONFLICT_TERMS = [
  "vi缺失",
  "vi基础",
  "补齐vi",
  "提供vi",
  "确认vi",
  "品牌缺失",
  "品牌视觉不完整",
  "品牌视觉缺",
  "品牌标识",
  "品牌设计",
  "品牌规范",
  "平面设计说明",
  "logo",
  "色值",
  "字体",
  "品牌资料",
  "品牌视觉",
  "视觉系统",
  "视觉规范",
  "视觉标准",
  "品牌文件",
  "品牌手册",
  "设计规范文件",
];

const AREA_CONFLICT_TERMS = ["项目面积", "面积未知", "未提及面积"];
const BUDGET_UNKNOWN_TERMS = ["预算范围", "预算未知", "预算信息缺失", "未提及预算"];
const TIMELINE_UNKNOWN_TERMS = ["时间节点", "时间未知", "工期未知", "未明确时间"];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function containsAny(text: string, terms: string[]): boolean {
  const normalized = normalize(text);
  return terms.some((term) => normalized.includes(normalize(term)));
}

const SAFE_MODE_REPLACEMENTS: [RegExp, string][] = [
  [/缺失/g, "建议确认"],
  [/没有/g, "若尚未明确"],
  [/不足/g, "建议补充"],
  [/未提及/g, "建议确认"],
  [/未明确/g, "建议确认"],
  [/缺少/g, "建议补充"],
];

function applySafeWording(text: string): string {
  let result = text;
  for (const [pattern, replacement] of SAFE_MODE_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function filterConflicts(
  facts: FactsSnapshot,
  missingInfo: MissingInfo[],
  risks: Risk[],
  nextSteps: NextStep[],
  proposalAngles: ProposalAngle[],
  demoSafeMode: boolean,
): ConflictFilterResult {
  const filtered: FilteredItem[] = [];

  const filteredMissing = missingInfo.filter((item) => {
    const combined = `${item.field} ${item.reason}`;

    if (facts.visualIdentityStatus === "complete" && containsAny(combined, VI_CONFLICT_TERMS)) {
      filtered.push({ type: "missing", original: item.field, reason: "品牌视觉已由客户明确为完整", action: "removed" });
      return false;
    }

    if (facts.areaKnown && containsAny(combined, AREA_CONFLICT_TERMS)) {
      filtered.push({ type: "missing", original: item.field, reason: `面积已明确: ${facts.areaValue}`, action: "removed" });
      return false;
    }

    if (facts.budgetStatus !== "unknown" && containsAny(combined, BUDGET_UNKNOWN_TERMS)) {
      if (containsAny(combined, ["拆项", "分档", "结构", "优先级"])) return true;
      filtered.push({ type: "missing", original: item.field, reason: `预算已明确: ${facts.budgetStatus}`, action: "removed" });
      return false;
    }

    if (facts.timelineStatus !== "unknown" && containsAny(combined, TIMELINE_UNKNOWN_TERMS)) {
      if (containsAny(combined, ["紧", "赶", "压缩", "缓冲"])) return true;
      filtered.push({ type: "missing", original: item.field, reason: `时间已明确: ${facts.timelineStatus}`, action: "removed" });
      return false;
    }

    return true;
  });

  const filteredRisks = risks.filter((risk) => {
    const combined = `${risk.type} ${risk.description}`;

    if (facts.visualIdentityStatus === "complete" && containsAny(combined, VI_CONFLICT_TERMS)) {
      filtered.push({ type: "risk", original: risk.type, reason: "品牌视觉已由客户明确为完整", action: "removed" });
      return false;
    }

    return true;
  });

  let finalMissing = filteredMissing;
  let finalRisks = filteredRisks;
  let finalNextSteps = nextSteps;

  if (demoSafeMode) {
    finalMissing = filteredMissing.map((item) => {
      const newReason = applySafeWording(item.reason);
      if (newReason !== item.reason) {
        filtered.push({ type: "missing", original: item.field, reason: "demoSafeMode 措辞软化", action: "reworded" });
      }
      return { ...item, reason: newReason };
    });

    finalRisks = filteredRisks.map((risk) => {
      if (risk.severity === "high") return risk;
      const newDesc = applySafeWording(risk.description);
      if (newDesc !== risk.description) {
        filtered.push({ type: "risk", original: risk.type, reason: "demoSafeMode 措辞软化", action: "reworded" });
      }
      return { ...risk, description: newDesc };
    });

    finalNextSteps = nextSteps.map((step) => {
      const newAction = applySafeWording(step.action);
      if (newAction !== step.action) {
        filtered.push({ type: "nextStep", original: step.action, reason: "demoSafeMode 措辞软化", action: "reworded" });
      }
      return { ...step, action: newAction };
    });
  }

  return {
    missingInfo: finalMissing,
    risks: finalRisks,
    nextSteps: finalNextSteps,
    proposalAngles,
    filtered,
  };
}
