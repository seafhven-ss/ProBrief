export interface BriefInput {
  projectName: string;
  projectType: string;
  description: string;
  budget: string;
  timeline: string;
}

export interface ProjectSummary {
  title: string;
  overview: string;
  projectType: string;
}

export interface Requirement {
  category: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface MissingInfo {
  field: string;
  reason: string;
  impact: "blocking" | "important" | "optional";
}

export interface Risk {
  type: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface NextStep {
  order: number;
  action: string;
  owner: string;
}

export interface ProposalAngle {
  angle: string;
  reasoning: string;
}

export interface RuleDebugEntry {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  reasons: string[];
  matchedKeywords: string[];
  detectedRegions: string[];
  detectedMonths: number[];
}

export interface FactsSnapshotDebug {
  visualIdentityStatus: string;
  budgetStatus: string;
  timelineStatus: string;
  customerGroupKnown: boolean;
  areaKnown: boolean;
  areaValue: string | null;
  projectScene: string | null;
  regionNormalized: string[];
  monthDetected: number[];
}

export interface FilteredItemDebug {
  type: "missing" | "risk" | "nextStep" | "angle";
  original: string;
  reason: string;
  action: "removed" | "reworded";
}

export interface BriefOutput {
  summary: ProjectSummary;
  requirements: Requirement[];
  missingInfo: MissingInfo[];
  risks: Risk[];
  nextSteps: NextStep[];
  proposalAngles: ProposalAngle[];
  generatedAt: string;
  generatorVersion: "rule-based" | "llm";
  ruleDebug?: RuleDebugEntry[];
  factsDebug?: FactsSnapshotDebug;
  filteredDebug?: FilteredItemDebug[];
  demoSafeMode?: boolean;
}

export interface BriefGenerator {
  generate(input: BriefInput): Promise<BriefOutput>;
}
