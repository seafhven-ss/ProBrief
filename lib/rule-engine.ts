/**
 * Rule engine 鈥?runs all demo rules against input, returns matched results
 * and the injected outputs to merge into the generator's output.
 */

import type { BriefInput, MissingInfo, Risk, ProposalAngle } from "./types";
import { DEMO_RULES } from "../data/demo-rules-v1";
import { buildContext, matchRule, type RuleMatchResult } from "./rule-matcher";

// 鈹€鈹€鈹€ Debug trace 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export interface RuleDebugEntry {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  reasons: string[];
  matchedKeywords: string[];
  detectedRegions: string[];
  detectedMonths: number[];
}

export interface RuleEngineResult {
  /** Items to inject into output */
  injectedRisks: Risk[];
  injectedMissing: MissingInfo[];
  injectedNextSteps: { action: string; owner: string }[];
  injectedAngles: ProposalAngle[];
  /** Full debug trace for all 8 rules */
  debug: RuleDebugEntry[];
}

// 鈹€鈹€鈹€ Run all rules 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function getAllowedRulePrefixes(projectType: string): string[] {
  if (projectType === "零售门店") {
    return ["R-Retail-", "R-Cross-"];
  }

  if (projectType === "展会展台") {
    return ["R-Booth-", "R-Cross-"];
  }

  if (["商业空间升级", "办公/展示空间", "品牌快闪"].includes(projectType)) {
    return ["R-Commercial-", "R-Cross-"];
  }

  return ["R-Cross-"];
}
export function runRuleEngine(input: BriefInput): RuleEngineResult {
  const ctx = buildContext(input);
  const allowedPrefixes = getAllowedRulePrefixes(input.projectType);

  const injectedRisks: Risk[] = [];
  const injectedMissing: MissingInfo[] = [];
  const injectedNextSteps: { action: string; owner: string }[] = [];
  const injectedAngles: ProposalAngle[] = [];
  const debug: RuleDebugEntry[] = [];

  for (const rule of DEMO_RULES) {
    if (!allowedPrefixes.some((prefix) => rule.id.startsWith(prefix))) {
      continue;
    }

    const result: RuleMatchResult = matchRule(rule, ctx);

    debug.push({
      ruleId: rule.id,
      ruleName: rule.name,
      matched: result.matched,
      reasons: result.reasons,
      matchedKeywords: result.matchedKeywords,
      detectedRegions: result.detectedRegions,
      detectedMonths: result.detectedMonths,
    });

    if (!result.matched) continue;

    // Inject outputs from this rule
    if (rule.riskOutput) {
      injectedRisks.push(rule.riskOutput);
    }

    if (rule.missingOutputs) {
      for (const m of rule.missingOutputs) {
        injectedMissing.push(m);
      }
    }

    if (rule.nextStepOutputs) {
      for (const ns of rule.nextStepOutputs) {
        injectedNextSteps.push(ns);
      }
    }

    if (rule.proposalAngleOutputs) {
      for (const pa of rule.proposalAngleOutputs) {
        injectedAngles.push(pa);
      }
    }
  }

  return { injectedRisks, injectedMissing, injectedNextSteps, injectedAngles, debug };
}


