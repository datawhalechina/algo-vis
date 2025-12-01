import { Difficulty } from "./index";

export enum AIDomain {
  VISION = "vision",
  LANGUAGE = "language",
  SPEECH = "speech",
  MULTIMODAL = "multimodal",
}

export const aiDomainNames: Record<AIDomain, string> = {
  [AIDomain.VISION]: "视觉",
  [AIDomain.LANGUAGE]: "大语言模型",
  [AIDomain.SPEECH]: "语音",
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
