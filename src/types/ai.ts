import { Difficulty } from "./index";

export enum AIDomain {
  VISION = "vision",
  CV = "cv",
  NLP = "nlp",
  LLM = "llm",
  LANGUAGE = "language",
  SPEECH = "speech",
  DEEP_LEARNING = "deep_learning",
  REINFORCEMENT_LEARNING = "reinforcement_learning",
  MULTIMODAL = "multimodal",
}

export const aiDomainNames: Record<AIDomain, string> = {
  [AIDomain.VISION]: "视觉",
  [AIDomain.CV]: "计算机视觉",
  [AIDomain.NLP]: "自然语言处理",
  [AIDomain.LLM]: "大语言模型",
  [AIDomain.LANGUAGE]: "语言模型",
  [AIDomain.SPEECH]: "语音",
  [AIDomain.DEEP_LEARNING]: "深度学习",
  [AIDomain.REINFORCEMENT_LEARNING]: "强化学习",
  [AIDomain.MULTIMODAL]: "多模态",
};

export interface AIProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface AIProblem {
  id: number;
  slug: string;
  title: string;
  domain: AIDomain;
  difficulty: Difficulty;
  description: string;
  learningGoals: string[];
  inputs: string[];
  outputs: string[];
  tags: string[];
  examples: AIProblemExample[];
  heroNote?: string;
}
