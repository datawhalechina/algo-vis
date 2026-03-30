import { DRLProblem, DRLCategory } from "@/types/drl";
import { overviewProblems } from "./overview";
import { tdLearningProblems } from "./tdlearning";
import { valueBasedProblems } from "./valuebased";
import { policyGradientProblems } from "./policygradient";
import { advancedPolicyProblems } from "./advpolicy";
import { continuousActionProblems } from "./continuous";
import { multiAgentProblems } from "./multiagent";
import { imitationLearningProblems } from "./imitation";
import { llmRLProblems } from "./llmrl";
import { verlProblems } from "./verl";

export const drlProblems: DRLProblem[] = [
  ...overviewProblems,
  ...tdLearningProblems,
  ...valueBasedProblems,
  ...policyGradientProblems,
  ...advancedPolicyProblems,
  ...continuousActionProblems,
  ...multiAgentProblems,
  ...imitationLearningProblems,
  ...llmRLProblems,
  ...verlProblems,
];

export function getDrlProblemById(id: number): DRLProblem | undefined {
  return drlProblems.find((p) => p.id === id);
}

export function getDrlProblemsByCategory(category: DRLCategory): DRLProblem[] {
  return drlProblems.filter((p) => p.category === category);
}
