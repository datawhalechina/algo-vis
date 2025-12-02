import { AIProblem, AIDomain } from "@/types/ai";
import {
  aiProblems as allAiProblems,
  getAiProblemById as getAiProblemByIdFromData,
  getAiProblemsByDomain as getAiProblemsByDomainFromData,
} from ".";

/**
 * 导出所有 AI 题目数据
 * 数据已按题型分类存放在 dataAI 目录中
 */
export const aiProblems: AIProblem[] = allAiProblems;

/**
 * 工具函数
 */
export function getAiProblemById(id: number): AIProblem | undefined {
  return getAiProblemByIdFromData(id);
}

export function getAiProblemsByDomain(domain: AIDomain): AIProblem[] {
  return getAiProblemsByDomainFromData(domain);
}
