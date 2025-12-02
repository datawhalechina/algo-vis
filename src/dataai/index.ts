import { AIProblem, AIDomain } from "@/types/ai";
import { visionProblems } from "./vision";
import { llmProblems } from "./llm";
import { nlpProblems } from "./nlp";
import { speechProblems } from "./speech";
import { cnnProblems } from "./cnn";
import { rnnProblems } from "./rnn";
import { transformerProblems } from "./transformer";
import { multimodalProblems } from "./multimodal";
import { gnnProblems } from "./gnn";
import { diffusionProblems } from "./diffusion";
import { ganProblems } from "./gan";
import { vaeProblems } from "./vae";

/**
 * 合并所有 AI 题目数据
 * 按题型分类，便于管理和扩展
 */
export const aiProblems: AIProblem[] = [
  ...visionProblems,
  ...llmProblems,
  ...nlpProblems,
  ...speechProblems,
  ...cnnProblems,
  ...rnnProblems,
  ...transformerProblems,
  ...multimodalProblems,
  ...gnnProblems,
  ...diffusionProblems,
  ...ganProblems,
  ...vaeProblems,
].sort((a, b) => a.id - b.id);

/**
 * 按题型导出
 */
export {
  visionProblems,
  llmProblems,
  nlpProblems,
  speechProblems,
  cnnProblems,
  rnnProblems,
  transformerProblems,
  multimodalProblems,
  gnnProblems,
  diffusionProblems,
  ganProblems,
  vaeProblems,
};

/**
 * 工具函数
 */
export function getAiProblemById(id: number): AIProblem | undefined {
  return aiProblems.find((problem) => problem.id === id);
}

export function getAiProblemsByDomain(domain: AIDomain): AIProblem[] {
  return aiProblems.filter((problem) => problem.domain === domain);
}
