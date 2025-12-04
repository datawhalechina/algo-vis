import type { ProblemCoreIdeaConfig } from "./problemCoreIdeas";

/**
 * AI 题目核心思想
 */
export const aiProblemCoreIdeas: Record<number, ProblemCoreIdeaConfig> = {
  10001: {
    idea: "通过 Query 与所有 Key 做点积，结合温度缩放后输入 Softmax 得到注意力权重，再对 Value 向量进行加权求和，从而凸显与 Query 最匹配的 patch。",
    color: "purple",
    features: [
      "Q·K 点积衡量相关性",
      "温度缩放控制分布尖锐度",
      "Softmax 权重加权 Value 得上下文",
    ],
  },
};

/**
 * 根据 AI 题目 ID 获取核心思想
 */
export function getAiProblemCoreIdea(
  problemId: number
): ProblemCoreIdeaConfig | undefined {
  return aiProblemCoreIdeas[problemId];
}
