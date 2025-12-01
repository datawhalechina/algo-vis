import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

export const aiProblems: AIProblem[] = [
  {
    id: 10001,
    slug: "vision-attention-heatmap",
    title: "视觉注意力热力图",
    domain: AIDomain.VISION,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 Vision Transformer 中 Query/Key 点积、温度缩放和 Softmax 后的注意力分布，帮助理解模型为何聚焦在特定图像 patch 上。",
    learningGoals: [
      "理解 Query 与 Key 向量的点积如何影响注意力强度",
      "掌握温度缩放与 Softmax 对权重的影响",
      "观察注意力权重与上下文向量之间的对应关系",
    ],
    inputs: [
      "patches：JSON 字符串，包含每个 patch 的特征向量（二维数组）",
      "queryIndex：作为 Query 的 patch 下标",
      "temperature：温度系数，越小越“尖锐”",
    ],
    outputs: [
      "rawScores：Query 与所有 Key 的点积结果",
      "weights：Softmax 注意力权重",
      "contextVector：基于注意力权重聚合后的向量",
    ],
    tags: ["Vision Transformer", "Attention", "Softmax"],
    examples: [
      {
        input:
          "patches = [[0.8,0.3,0.1],[0.2,0.7,0.4],[0.9,0.1,0.5],[0.4,0.6,0.2]], queryIndex = 0, temperature = 0.8",
        output: "weights ≈ [0.44, 0.19, 0.27, 0.10]",
        explanation:
          "Query 更关注自身和相似特征的 patch，温度越小越偏向最大值。",
      },
    ],
    heroNote: "默认示例基于 2x2 patch tokens，演示局部注意力分布。",
  },
];

export function getAiProblemById(id: number): AIProblem | undefined {
  return aiProblems.find((problem) => problem.id === id);
}

export function getAiProblemsByDomain(domain: AIDomain): AIProblem[] {
  return aiProblems.filter((problem) => problem.domain === domain);
}
