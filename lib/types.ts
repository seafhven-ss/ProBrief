export interface BriefInput {
  projectName: string;
  projectType: string;
  targetAudience: string;
  keyMessage: string;
  tone: string;
  deliverables: string[];
}

export interface BriefOutput {
  title: string;
  overview: string;
  objectives: string[];
  targetAudience: string;
  messaging: string;
  timeline: string;
  budget: string;
}
