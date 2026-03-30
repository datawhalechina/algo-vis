import { Difficulty } from "./index";

export enum DRLCategory {
  OVERVIEW = "overview",
  TD_LEARNING = "td_learning",
  VALUE_BASED = "value_based",
  POLICY_GRADIENT = "policy_gradient",
  ADVANCED_POLICY = "advanced_policy",
  CONTINUOUS_ACTION = "continuous_action",
  MULTI_AGENT = "multi_agent",
  IMITATION_LEARNING = "imitation_learning",
  LLM_RL = "llm_rl",
  VERL_FRAMEWORK = "verl_framework",
}

export const drlCategoryNames: Record<DRLCategory, string> = {
  [DRLCategory.OVERVIEW]: "基础概念 (Overview)",
  [DRLCategory.TD_LEARNING]: "TD 学习 (TD Learning)",
  [DRLCategory.VALUE_BASED]: "高级价值学习 (Advanced Value-Based)",
  [DRLCategory.POLICY_GRADIENT]: "策略梯度 (Policy Gradient)",
  [DRLCategory.ADVANCED_POLICY]: "高级策略学习 (Advanced Policy-Based)",
  [DRLCategory.CONTINUOUS_ACTION]: "连续动作空间 (Continuous Action)",
  [DRLCategory.MULTI_AGENT]: "多智能体强化学习 (Multi-Agent RL)",
  [DRLCategory.IMITATION_LEARNING]: "模仿学习 (Imitation Learning)",
  [DRLCategory.LLM_RL]: "LLM RL 对齐 (LLM RL Alignment)",
  [DRLCategory.VERL_FRAMEWORK]: "verl 框架 (verl Framework)",
};

export interface DRLProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface DRLProblem {
  id: number;
  slug: string;
  title: string;
  category: DRLCategory;
  difficulty: Difficulty;
  description: string;
  learningGoals: string[];
  inputs: string[];
  outputs: string[];
  tags: string[];
  examples: DRLProblemExample[];
  heroNote?: string;
}
